'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import useImage from 'use-image';
import { AnnotationImage, useAnnotationStore } from '@/store/useAnnotationStore';

interface DrawingCanvasProps {
  imageObj: AnnotationImage;
}

export default function DrawingCanvas({ imageObj }: DrawingCanvasProps) {
  const [img] = useImage(imageObj.image, 'anonymous');
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentPoints, setCurrentPoints] = useState<number[][]>([]);
  const { savePolygon, deletePolygon } = useAnnotationStore();

  // Resize canvas dynamically to fit the container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleCanvasClick = (e: any) => {
    // If right click, ignore (used for deletion on existing polygons)
    if (e.evt.button === 2) return; 

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    
    // Normalize coordinates (0.0 to 1.0)
    const normalizedX = pointer.x / dimensions.width;
    const normalizedY = pointer.y / dimensions.height;

    setCurrentPoints([...currentPoints, [normalizedX, normalizedY]]);
  };

  const handleCompletePolygon = () => {
    if (currentPoints.length > 2) {
      savePolygon(imageObj.id, currentPoints);
    }
    setCurrentPoints([]); // Reset current drawing
  };

  const denormalizePoints = (points: number[][]) => {
    return points.flatMap(([x, y]) => [x * dimensions.width, y * dimensions.height]);
  };

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative" ref={containerRef}>
      
      {/* Controls overlay */}
      {currentPoints.length > 0 && (
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button onClick={handleCompletePolygon} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm shadow-lg">Save Shape</button>
          <button onClick={() => setCurrentPoints([])} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm shadow-lg">Cancel</button>
        </div>
      )}

      {dimensions.width > 0 && (
        <Stage 
          width={dimensions.width} 
          height={dimensions.height} 
          onClick={handleCanvasClick}
          onContextMenu={(e) => e.evt.preventDefault()} // Disable default right-click menu
        >
          <Layer>
            {/* 1. Render the Background Image (scaled to fit) */}
            {img && <KonvaImage image={img} width={dimensions.width} height={dimensions.height} />}

            {/* 2. Render Saved Polygons from Database */}
            {imageObj.polygons.map((poly, i) => (
              <Line
                key={poly.id || i}
                points={denormalizePoints(poly.points)}
                fill="rgba(99, 102, 241, 0.3)" // Indigo transparent
                stroke="#6366f1"
                strokeWidth={2}
                closed
                onContextMenu={(e) => {
                  e.evt.preventDefault();
                  if (poly.id && window.confirm('Delete this annotation?')) {
                    deletePolygon(poly.id, imageObj.id);
                  }
                }}
              />
            ))}

            {/* 3. Render the currently drawing polygon */}
            {currentPoints.length > 0 && (
              <Line
                points={denormalizePoints(currentPoints)}
                stroke="#22c55e" // Green while drawing
                strokeWidth={2}
                closed={false}
              />
            )}
            
            {/* Draw dots at vertices for visual feedback */}
            {currentPoints.map((pt, i) => (
              <Circle
                key={i}
                x={pt[0] * dimensions.width}
                y={pt[1] * dimensions.height}
                radius={4}
                fill="#22c55e"
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
