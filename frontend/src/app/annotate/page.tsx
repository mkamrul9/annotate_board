'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAnnotationStore } from '@/store/useAnnotationStore';
import DrawingCanvas from '@/components/annotate/DrawingCanvas';
import { UploadCloud, ChevronLeft, ChevronRight, Wand2, Download } from 'lucide-react';

export default function AnnotatePage() {
  const searchParams = useSearchParams();
  const targetImageId = searchParams.get('imageId');
  
  const { images, currentIndex, loading, fetchImages, uploadImage, setCurrentIndex, autoAnnotate } = useAnnotationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Fetch images if we haven't already
    if (images.length === 0) {
      fetchImages();
    }
  }, [fetchImages, images.length]);

  useEffect(() => {
    // 2. Once images are loaded, if there's a target ID in the URL, slide directly to it
    if (targetImageId && images.length > 0) {
      const index = images.findIndex((img) => img.id === Number(targetImageId));
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [targetImageId, images, currentIndex, setCurrentIndex]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadImage(e.target.files[0]);
    }
  };

  const exportYOLOFormat = () => {
    if (!activeImage || activeImage.polygons.length === 0) return;

    // YOLO segmentation format: <class-index> <x1> <y1> <x2> <y2> ...
    // Assuming class index '0' for our single generic class
    let yoloText = '';
    activeImage.polygons.forEach((poly) => {
      const coords = poly.points.map(([x, y]) => `${x.toFixed(6)} ${y.toFixed(6)}`).join(' ');
      yoloText += `0 ${coords}\n`;
    });

    // Create a Blob and trigger download
    const blob = new Blob([yoloText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image_${activeImage.id}_annotations.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeImage = images[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Uploader */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Image Annotation</h1>
            <p className="text-slate-400 mt-1">Click to draw shapes. Right-click a shape to delete it.</p>
          </div>
          
          <div className="flex gap-4">
            {activeImage && (
              <>
                <button 
                  onClick={exportYOLOFormat}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg border border-slate-700"
                >
                  <Download size={20} /> Export to YOLO
                </button>
                <button 
                  onClick={() => autoAnnotate(activeImage.id)}
                  disabled={loading}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg disabled:opacity-50"
                >
                  <Wand2 size={20} /> 
                  {loading ? 'Analyzing...' : 'Auto-Annotate'}
                </button>
              </>
            )}
            <div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg"
              >
                <UploadCloud size={20} /> Upload Image
              </button>
            </div>
          </div>
        </div>

        {/* Carousel / Slider Controls */}
        {images.length > 0 && (
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
            <button 
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition"
            >
              <ChevronLeft />
            </button>
            <span className="font-medium text-slate-400">
              Image {currentIndex + 1} of {images.length}
            </span>
            <button 
              onClick={() => setCurrentIndex(Math.min(images.length - 1, currentIndex + 1))}
              disabled={currentIndex === images.length - 1}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition"
            >
              <ChevronRight />
            </button>
          </div>
        )}

        {/* The Canvas Workspace */}
        {loading ? (
          <div className="h-[600px] flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/50">
            <span className="text-slate-400 animate-pulse">Loading workspace...</span>
          </div>
        ) : activeImage ? (
          <DrawingCanvas imageObj={activeImage} />
        ) : (
          <div className="h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
            <UploadCloud size={48} className="mb-4 opacity-50" />
            <p>No images uploaded yet. Upload an image to begin annotating.</p>
          </div>
        )}
      </div>
    </div>
  );
}
