import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Polygon {
  id?: number;
  points: number[][]; // Array of [x, y] fractions in [0,1], e.g. [[0.2, 0.5], [0.3, 0.6]]
}

export interface AnnotationImage {
  id: number;
  image: string; // absolute URL
  polygons: Polygon[];
}

interface AnnotationState {
  images: AnnotationImage[];
  currentIndex: number;
  loading: boolean;
  uploading: boolean;
  fetchImages: () => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  setCurrentIndex: (index: number) => void;
  savePolygon: (imageId: number, points: number[][]) => Promise<void>;
  deletePolygon: (polygonId: number, imageId: number) => Promise<void>;
  restorePolygon: (polygon: Polygon, imageId: number) => Promise<void>;
  autoAnnotate: (imageId: number) => Promise<void>;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  images: [],
  currentIndex: 0,
  loading: false,
  uploading: false,

  setCurrentIndex: (index) => set({ currentIndex: index }),

  fetchImages: async () => {
    set({ loading: true });
    try {
      const response = await api.get('annotations/images/');
      set({ images: response.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch images', error);
      toast.error('Failed to load images');
      set({ loading: false });
    }
  },

  uploadImage: async (file: File) => {
    set({ uploading: true });
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.post('annotations/images/', formData);
      // Prepend the new image and focus it
      set((state) => ({
        images: [response.data, ...state.images],
        currentIndex: 0,
        uploading: false,
      }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Upload failed. Please try again.');
      set({ uploading: false });
    }
  },

  savePolygon: async (imageId, points) => {
    try {
      const response = await api.post('annotations/polygons/', { image: imageId, points });
      set((state) => ({
        images: state.images.map((img) =>
          img.id === imageId ? { ...img, polygons: [...img.polygons, response.data] } : img
        ),
      }));
      toast.success('Annotation saved');
    } catch (error) {
      console.error('Failed to save polygon', error);
      toast.error('Failed to save annotation');
    }
  },

  deletePolygon: async (polygonId, imageId) => {
    // Optimistic update
    const originalImages = get().images;
    set((state) => ({
      images: state.images.map((img) =>
        img.id === imageId
          ? { ...img, polygons: img.polygons.filter((p) => p.id !== polygonId) }
          : img
      ),
    }));
    try {
      await api.delete(`annotations/polygons/${polygonId}/`);
    } catch (error) {
      console.error('Failed to delete polygon', error);
      toast.error('Failed to delete annotation');
      // Rollback
      set({ images: originalImages });
    }
  },

  restorePolygon: async (polygon, imageId) => {
    try {
      // Re-save it using the points
      const response = await api.post('annotations/polygons/', { image: imageId, points: polygon.points });
      set((state) => ({
        images: state.images.map((img) =>
          img.id === imageId ? { ...img, polygons: [...img.polygons, response.data] } : img
        ),
      }));
    } catch (error) {
      console.error('Failed to restore polygon', error);
      toast.error('Failed to restore annotation');
    }
  },

  autoAnnotate: async (imageId: number) => {
    set({ loading: true });
    try {
      const response = await api.post(`annotations/images/${imageId}/auto_annotate/`);
      const newPolygons: Polygon[] = response.data;

      set((state) => ({
        images: state.images.map((img) =>
          img.id === imageId
            ? { ...img, polygons: [...img.polygons, ...newPolygons] }
            : img
        ),
        loading: false,
      }));
      toast.success(`AI Annotation complete — ${newPolygons.length} region(s) detected`);
    } catch (error) {
      console.error('Auto-annotation failed', error);
      toast.error('AI Annotation failed. Please try again.');
      set({ loading: false });
    }
  },
}));
