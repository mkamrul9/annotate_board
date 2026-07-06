import { create } from 'zustand';
import api from '@/lib/api';

export interface Polygon {
  id?: number;
  points: number[][]; // Array of [x, y] percentages, e.g., [[0.2, 0.5], [0.3, 0.6]]
}

export interface AnnotationImage {
  id: number;
  image: string; // URL
  polygons: Polygon[];
}

interface AnnotationState {
  images: AnnotationImage[];
  currentIndex: number;
  loading: boolean;
  fetchImages: () => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  setCurrentIndex: (index: number) => void;
  savePolygon: (imageId: number, points: number[][]) => Promise<void>;
  deletePolygon: (polygonId: number, imageId: number) => Promise<void>;
  autoAnnotate: (imageId: number) => Promise<void>;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  images: [],
  currentIndex: 0,
  loading: false,

  setCurrentIndex: (index) => set({ currentIndex: index }),

  fetchImages: async () => {
    set({ loading: true });
    try {
      const response = await api.get('annotations/images/');
      set({ images: response.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch images', error);
      set({ loading: false });
    }
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.post('annotations/images/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set((state) => ({ images: [response.data, ...state.images], currentIndex: 0 }));
    } catch (error) {
      console.error('Upload failed', error);
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
    } catch (error) {
      console.error('Failed to save polygon', error);
    }
  },

  deletePolygon: async (polygonId, imageId) => {
    try {
      await api.delete(`annotations/polygons/${polygonId}/`);
      set((state) => ({
        images: state.images.map((img) =>
          img.id === imageId
            ? { ...img, polygons: img.polygons.filter((p) => p.id !== polygonId) }
            : img
        ),
      }));
    } catch (error) {
      console.error('Failed to delete polygon', error);
    }
  },

  autoAnnotate: async (imageId: number) => {
    set({ loading: true });
    try {
      const response = await api.post(`annotations/images/${imageId}/auto_annotate/`);
      const newPolygons = response.data;
      
      // Update state with the newly generated polygons
      set((state) => ({
        images: state.images.map((img) => 
          img.id === imageId 
            ? { ...img, polygons: [...img.polygons, ...newPolygons] } 
            : img
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Auto-annotation failed', error);
      set({ loading: false });
    }
  }
}));
