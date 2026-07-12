'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAnnotationStore } from '@/store/useAnnotationStore';
import { useAuthStore } from '@/store/useAuthStore';
import DrawingCanvas from '@/components/annotate/DrawingCanvas';
import {
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Download,
  Loader2,
  ImageIcon,
  Shapes,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// ── Thumbnail strip ───────────────────────────────────────────────────────────

function ThumbnailStrip() {
  const { images, currentIndex, setCurrentIndex } = useAnnotationStore();

  if (images.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {images.map((img, i) => (
        <button
          key={img.id}
          onClick={() => setCurrentIndex(i)}
          className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
            i === currentIndex
              ? 'border-indigo-500 shadow-lg shadow-indigo-900/40'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 opacity-60 hover:opacity-100'
          }`}
          title={`Image #${img.id} — ${img.polygons.length} annotation(s)`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.image}
            alt={`Thumbnail ${i + 1}`}
            className="w-full h-full object-cover"
          />
          {img.polygons.length > 0 && (
            <span className="absolute bottom-0.5 right-0.5 bg-indigo-600 text-white text-[9px] font-bold px-1 rounded">
              {img.polygons.length}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Main annotate content ─────────────────────────────────────────────────────

function AnnotateContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const searchParams = useSearchParams();
  const targetImageId = searchParams.get('imageId');

  const {
    images,
    currentIndex,
    loading,
    uploading,
    fetchImages,
    uploadImage,
    setCurrentIndex,
    autoAnnotate,
    deleteImage,
  } = useAnnotationStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Fetch images on mount (always, to handle deleted-all edge case)
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Navigate to target image when images are loaded (from TaskCard deep-link)
  useEffect(() => {
    if (targetImageId && images.length > 0) {
      const index = images.findIndex((img) => img.id === Number(targetImageId));
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [targetImageId, images, currentIndex, setCurrentIndex]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadImage(e.target.files[0]);
      // Reset so the same file can be re-uploaded if needed
      e.target.value = '';
    }
  };

  const exportYOLOFormat = () => {
    if (!activeImage || activeImage.polygons.length === 0) {
      toast.error('No annotations to export');
      return;
    }

    // YOLO segmentation format: <class-index> <x1> <y1> <x2> <y2> ...
    const yoloText = activeImage.polygons
      .map((poly) => {
        const coords = poly.points.map(([x, y]) => `${x.toFixed(6)} ${y.toFixed(6)}`).join(' ');
        return `0 ${coords}`;
      })
      .join('\n');

    const blob = new Blob([yoloText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image_${activeImage.id}_annotations.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('YOLO format exported successfully!');
  };

  const exportCOCO = () => {
    if (!activeImage || activeImage.polygons.length === 0) {
      toast.error('No annotations to export');
      return;
    }

    const cocoData = {
      info: { description: "VAI Radiology Export", date_created: new Date().toISOString() },
      images: [{ id: activeImage.id, file_name: `image_${activeImage.id}.jpg` }],
      annotations: activeImage.polygons.map((poly, index) => {
        // COCO requires a flat array of pixels [x1, y1, x2, y2...]
        // We must denormalize using an assumed standard resolution (e.g., 1024x1024) or the original image dims
        const flatPoints = poly.points.flatMap(([x, y]) => [Math.round(x * 1024), Math.round(y * 1024)]);
        return {
          id: poly.id || index,
          image_id: activeImage.id,
          category_id: 1, // Assuming class 1
          segmentation: [flatPoints],
          iscrowd: 0,
        };
      }),
      categories: [{ id: 1, name: "anomaly", supercategory: "medical" }]
    };

    const blob = new Blob([JSON.stringify(cocoData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coco_export_${activeImage.id}.json`;
    a.click();
    toast.success('COCO format exported successfully!');
  };

  const activeImage = images[currentIndex];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 p-6 md:p-8 text-slate-800 dark:text-slate-200">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Image Annotation</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Click on canvas to draw polygon shapes · Right-click to delete
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {activeImage && (
              <>
                <button
                  onClick={exportYOLOFormat}
                  disabled={activeImage.polygons.length === 0}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-200 dark:border-slate-700"
                  title={activeImage.polygons.length === 0 ? 'No annotations to export' : 'Export YOLO format'}
                >
                  <Download size={16} /> Export YOLO (.txt)
                </button>
                <button
                  onClick={exportCOCO}
                  disabled={activeImage.polygons.length === 0}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-200 dark:border-slate-700"
                  title={activeImage.polygons.length === 0 ? 'No annotations to export' : 'Export COCO format'}
                >
                  <Download size={16} /> Export COCO (.json)
                </button>
                <button
                  onClick={() => autoAnnotate(activeImage.id)}
                  disabled={loading}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition pulse-glow shadow-lg"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  {loading ? 'Analyzing…' : 'Auto-Annotate'}
                </button>
              </>
            )}

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                aria-label="Upload image"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-900/30"
              >
                {uploading
                  ? <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                  : <><UploadCloud size={16} /> Upload Image</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Image info bar + thumbnail strip */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3"
          >
            {/* Navigation row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white disabled:opacity-30 transition"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Image {currentIndex + 1} of {images.length}
                </span>
                {activeImage && (
                  <span className="flex items-center gap-1 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    <Shapes size={11} />
                    {activeImage.polygons.length} annotation(s)
                  </span>
                )}
                {activeImage && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this image and all its annotations?')) {
                        deleteImage(activeImage.id);
                      }
                    }}
                    className="flex items-center justify-center p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete Image"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setCurrentIndex(Math.min(images.length - 1, currentIndex + 1))}
                disabled={currentIndex === images.length - 1}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white disabled:opacity-30 transition"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Thumbnail strip */}
            <ThumbnailStrip />
          </motion.div>
        )}

        {/* Canvas workspace */}
        {loading && !activeImage ? (
          <div className="h-[580px] flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-900/50">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-sm">Loading workspace…</span>
            </div>
          </div>
        ) : activeImage ? (
          <DrawingCanvas imageObj={activeImage} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[580px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center">
              <ImageIcon size={28} className="opacity-50" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-600 dark:text-slate-400">No images yet</p>
              <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">Upload an image to begin annotating</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              <UploadCloud size={16} /> Upload Image
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function AnnotatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
          <Loader2 size={24} className="animate-spin mr-3" />
          Loading…
        </div>
      }
    >
      <AnnotateContent />
    </Suspense>
  );
}
