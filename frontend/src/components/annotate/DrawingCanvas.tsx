'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import { AnnotationImage, useAnnotationStore } from '@/store/useAnnotationStore';
import { ZoomIn, ZoomOut, RotateCcw, BoxSelect, Pentagon } from 'lucide-react';

interface DrawingCanvasProps {
  imageObj: AnnotationImage;
}

export default function DrawingCanvas({ imageObj }: DrawingCanvasProps) {
  const [img] = useImage(imageObj.image, 'anonymous');
  const containerRef = useRef<HTMLDivElement>(null);
  const imageNodeRef = useRef<Konva.Image>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const [currentPoints, setCurrentPoints] = useState<number[][]>([]);
  const [boxPreview, setBoxPreview] = useState<number[][] | null>(null);
  const [drawMode, setDrawMode] = useState<'polygon' | 'box'>('polygon');
  
  const { savePolygon, deletePolygon } = useAnnotationStore();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Radiologist filter controls
  const [brightness, setBrightness] = useState(0);
  const [invert, setInvert] = useState(false);

  // ── Reset canvas state when image changes ────────────────────────────────
  useEffect(() => {
    setCurrentPoints([]);
    setBoxPreview(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setBrightness(0);
    setInvert(false);
  }, [imageObj.id]);

  // ── Keyboard shortcuts (Ctrl+Z = undo last point, Esc = cancel) ──────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        setCurrentPoints((prev) => prev.slice(0, -1));
        setBoxPreview(null);
      }
      if (e.key === 'Escape') {
        setCurrentPoints([]);
        setBoxPreview(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── ResizeObserver: update canvas size to match container ────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Cache Konva image only when filter-relevant props change ─────────────
  useEffect(() => {
    if (img && imageNodeRef.current) {
      imageNodeRef.current.cache();
      imageNodeRef.current.getLayer()?.batchDraw();
    }
  }, [img, brightness, invert]);

  // ── Zoom via mouse wheel ──────────────────────────────────────────────────
  const handleWheel = useCallback((e: { evt: WheelEvent; target: Konva.Node }) => {
    e.evt.preventDefault();

    const SCALE_FACTOR = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const newScale = e.evt.deltaY < 0 ? oldScale * SCALE_FACTOR : oldScale / SCALE_FACTOR;

    if (newScale < 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      return;
    }

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, []);

  // ── Calculate Fitted Dimensions (Preserve Aspect Ratio) ────────────────────
  const getFittedDimensions = useCallback(() => {
    if (!img || dimensions.width === 0) return { width: 0, height: 0, x: 0, y: 0 };
    
    const scaleFactor = Math.min(
      dimensions.width / img.width,
      dimensions.height / img.height
    );

    const fittedWidth = img.width * scaleFactor;
    const fittedHeight = img.height * scaleFactor;

    const x = (dimensions.width - fittedWidth) / 2;
    const y = (dimensions.height - fittedHeight) / 2;

    return { width: fittedWidth, height: fittedHeight, x, y };
  }, [img, dimensions]);

  // ── Canvas click: add point to polygon or draw box ───────────────────────
  const handleCanvasClick = useCallback(
    (e: { evt: MouseEvent; target: Konva.Node }) => {
      if (e.evt.button === 2) return; // Ignore right-click

      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const relativeX = (pointer.x - stage.x()) / scale;
      const relativeY = (pointer.y - stage.y()) / scale;

      const fitted = getFittedDimensions();
      const adjustedX = relativeX - fitted.x;
      const adjustedY = relativeY - fitted.y;

      // Ensure click is inside the actual image bounds
      if (adjustedX < 0 || adjustedX > fitted.width || adjustedY < 0 || adjustedY > fitted.height) return;

      const normalizedX = adjustedX / fitted.width;
      const normalizedY = adjustedY / fitted.height;

      if (drawMode === 'polygon') {
        setCurrentPoints((prev) => [...prev, [normalizedX, normalizedY]]);
      } else {
        // Bounding Box Mode
        if (currentPoints.length === 0) {
          // First click: Start
          setCurrentPoints([[normalizedX, normalizedY]]);
        } else {
          // Second click: End
          const startPt = currentPoints[0];
          const endPt = [normalizedX, normalizedY];
          const boxPoints = [
            [startPt[0], startPt[1]],
            [endPt[0], startPt[1]],
            [endPt[0], endPt[1]],
            [startPt[0], endPt[1]]
          ];
          savePolygon(imageObj.id, boxPoints);
          setCurrentPoints([]);
          setBoxPreview(null);
        }
      }
    },
    [scale, drawMode, currentPoints, getFittedDimensions, savePolygon, imageObj.id]
  );

  // ── Mouse Move for Box Preview ─────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: { evt: MouseEvent; target: Konva.Node }) => {
      if (drawMode !== 'box' || currentPoints.length !== 1) return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const relativeX = (pointer.x - stage.x()) / scale;
      const relativeY = (pointer.y - stage.y()) / scale;

      const fitted = getFittedDimensions();
      const adjustedX = relativeX - fitted.x;
      const adjustedY = relativeY - fitted.y;
      
      // Clamp so preview box doesn't spill outside image
      const clampedX = Math.max(0, Math.min(adjustedX, fitted.width));
      const clampedY = Math.max(0, Math.min(adjustedY, fitted.height));

      const normalizedX = clampedX / fitted.width;
      const normalizedY = clampedY / fitted.height;

      const startPt = currentPoints[0];
      setBoxPreview([
        [startPt[0], startPt[1]],
        [normalizedX, startPt[1]],
        [normalizedX, normalizedY],
        [startPt[0], normalizedY]
      ]);
    },
    [scale, drawMode, currentPoints, getFittedDimensions]
  );

  // ── Save completed polygon ────────────────────────────────────────────────
  const handleCompletePolygon = useCallback(() => {
    if (drawMode === 'polygon' && currentPoints.length > 2) {
      savePolygon(imageObj.id, currentPoints);
    }
    setCurrentPoints([]);
  }, [currentPoints, imageObj.id, savePolygon, drawMode]);

  // ── Denormalize [0,1] coords to canvas pixel coords ──────────────────────
  const denormalizePoints = useCallback(
    (points: number[][]) => {
      const fitted = getFittedDimensions();
      return points.flatMap(([x, y]) => [
        (x * fitted.width) + fitted.x, 
        (y * fitted.height) + fitted.y
      ]);
    },
    [getFittedDimensions]
  );

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const filters = invert
    ? [Konva.Filters.Brighten, Konva.Filters.Invert]
    : [Konva.Filters.Brighten];

  const fitted = getFittedDimensions();

  return (
    <div className="w-full h-[580px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative" ref={containerRef}>

      {/* ── Draw Mode Toggle ── */}
      <div className="absolute top-4 left-4 z-10 flex bg-slate-950/80 p-1 rounded-lg backdrop-blur-md border border-slate-700 shadow-xl">
        <button
          onClick={() => { setDrawMode('polygon'); setCurrentPoints([]); setBoxPreview(null); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            drawMode === 'polygon' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Pentagon size={14} /> Polygon
        </button>
        <button
          onClick={() => { setDrawMode('box'); setCurrentPoints([]); setBoxPreview(null); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            drawMode === 'box' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BoxSelect size={14} /> Bounding Box
        </button>
      </div>

      {/* ── Controls overlay: Save / Cancel drawing ── */}
      {drawMode === 'polygon' && currentPoints.length > 0 && (
        <div className="absolute top-16 left-4 z-10 flex gap-2">
          <button
            onClick={handleCompletePolygon}
            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg transition"
          >
            ✓ Save Shape ({currentPoints.length} pts)
          </button>
          <button
            onClick={() => setCurrentPoints([])}
            className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg transition"
          >
            ✕ Cancel
          </button>
        </div>
      )}

      {/* ── Radiologist Toolkit Toolbar (top-center) ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 bg-slate-950/90 border border-slate-700 shadow-2xl rounded-xl px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Brightness</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={brightness}
            onChange={(e) => setBrightness(parseFloat(e.target.value))}
            className="w-24 accent-indigo-500"
          />
          <span className="text-xs text-slate-500 w-8 text-right">
            {brightness > 0 ? '+' : ''}{Math.round(brightness * 100)}%
          </span>
        </div>

        <div className="w-px h-4 bg-slate-700" />

        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={invert}
            onChange={(e) => setInvert(e.target.checked)}
            className="accent-indigo-500 w-3.5 h-3.5"
          />
          Invert
        </label>

        <div className="w-px h-4 bg-slate-700" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.min(s * 1.2, 8))}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <span className="text-xs text-slate-500 w-10 text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.max(s / 1.2, 1))}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={resetZoom}
            disabled={scale === 1}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 transition"
            title="Reset zoom"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* ── Konva Stage ── */}
      {dimensions.width > 0 && (
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          draggable={scale > 1}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
          onContextMenu={(e) => e.evt.preventDefault()}
          style={{ cursor: 'crosshair' }}
        >
          {/* Layer 1: Image. Fixed Aspect Ratio. */}
          <Layer listening={false}>
            {img && (
              <KonvaImage
                ref={imageNodeRef}
                image={img}
                width={fitted.width}
                height={fitted.height}
                x={fitted.x}
                y={fitted.y}
                brightness={brightness}
                filters={filters}
              />
            )}
          </Layer>

          {/* Layer 2: Saved annotations */}
          <Layer>
            {imageObj.polygons.map((poly, i) => (
              <Line
                key={poly.id ?? `poly-${i}`}
                points={denormalizePoints(poly.points)}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="#6366f1"
                strokeWidth={2 / scale}
                closed
                onContextMenu={(e) => {
                  e.evt.preventDefault();
                  if (poly.id && window.confirm('Delete this annotation?')) {
                    deletePolygon(poly.id, imageObj.id);
                  }
                }}
              />
            ))}
          </Layer>

          {/* Layer 3: Active drawing */}
          <Layer listening={false}>
            {/* Polygon Mode Preview */}
            {drawMode === 'polygon' && currentPoints.length > 0 && (
              <>
                <Line
                  points={denormalizePoints(currentPoints)}
                  stroke="#22c55e"
                  strokeWidth={2 / scale}
                  closed={false}
                  dash={[6, 3]}
                />
                {currentPoints.map((pt, i) => (
                  <Circle
                    key={i}
                    x={(pt[0] * fitted.width) + fitted.x}
                    y={(pt[1] * fitted.height) + fitted.y}
                    radius={4 / scale}
                    fill="#22c55e"
                    stroke="white"
                    strokeWidth={1 / scale}
                  />
                ))}
              </>
            )}

            {/* Bounding Box Mode Preview */}
            {drawMode === 'box' && boxPreview && (
              <Line
                points={denormalizePoints(boxPreview)}
                stroke="#22c55e"
                strokeWidth={2 / scale}
                closed
                dash={[6, 3]}
                fill="rgba(34, 197, 94, 0.15)"
              />
            )}
          </Layer>
        </Stage>
      )}

      {/* ── Keyboard hint ── */}
      <div className="absolute bottom-3 right-3 text-xs text-slate-600 pointer-events-none">
        <kbd>Ctrl+Z</kbd> undo · <kbd>Esc</kbd> cancel · scroll to zoom
      </div>
    </div>
  );
}
