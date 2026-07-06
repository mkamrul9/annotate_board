'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import Konva from 'konva';
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Filter states
  const [brightness, setBrightness] = useState(0);
  const [invert, setInvert] = useState(false);
  const imageNodeRef = useRef<any>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrentPoints([]);
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        setCurrentPoints((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cache image for filters once loaded
  useEffect(() => {
    if (img && imageNodeRef.current) {
      imageNodeRef.current.cache();
    }
  }, [img, brightness, invert, dimensions]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
  
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
  
    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Limit zoom out to original size
    if (newScale < 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      return;
    }
  
    // Calculate new position to zoom exactly where the mouse is pointing
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
  
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
  
    setScale(newScale);
    setPosition(newPos);
  };

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
    
    // Calculate relative coordinates considering pan and zoom
    const relativeX = (pointer.x - stage.x()) / scale;
    const relativeY = (pointer.y - stage.y()) / scale;

    // Normalize coordinates (0.0 to 1.0)
    const normalizedX = relativeX / dimensions.width;
    const normalizedY = relativeY / dimensions.height;

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

      {/* Radiologist Toolkit Toolbar */}
      <div className="flex gap-4 mb-4 p-4 bg-slate-900 rounded-lg border border-slate-800 absolute top-4 left-1/2 -translate-x-1/2 z-10 shadow-2xl min-w-[400px]">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-slate-400 font-medium">Brightness</label>
          <input 
            type="range" min="-1" max="1" step="0.05" 
            value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))}
            className="flex-1 accent-indigo-500"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400 font-medium cursor-pointer">
          <input 
            type="checkbox" 
            checked={invert} onChange={(e) => setInvert(e.target.checked)}
            className="accent-indigo-500 w-4 h-4"
          />
          Invert Colors
        </label>
      </div>

      {dimensions.width > 0 && (
        <Stage 
          width={dimensions.width} 
          height={dimensions.height} 
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          draggable={scale > 1}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          onDragEnd={(e) => {
            setPosition({ x: e.target.x(), y: e.target.y() });
          }}
          onContextMenu={(e) => e.evt.preventDefault()}
        >
          <Layer>
            {/* 1. Render the Background Image (scaled to fit) */}
            {img && (
              <KonvaImage 
                ref={imageNodeRef}
                image={img} 
                width={dimensions.width} 
                height={dimensions.height} 
                filters={[Konva.Filters.Brighten, Konva.Filters.Invert]}
                brightness={brightness}
                // Konva's invert filter is applied automatically if included in the array, 
                // so we conditionally add it based on state
                {...(invert ? { filters: [Konva.Filters.Brighten, Konva.Filters.Invert] } : { filters: [Konva.Filters.Brighten] })}
              />
            )}

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
