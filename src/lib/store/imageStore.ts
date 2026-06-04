import { create } from 'zustand';

export interface HistoryEntry {
  tool: string;
  params: Record<string, unknown>;
  timestamp: number;
}

export interface ImageState {
  activeImage: File | Blob | null;
  activeImageUrl: string | null;
  processingHistory: HistoryEntry[];
  
  setActiveImage: (file: File | Blob) => void;
  clearActiveImage: () => void;
  addToHistory: (operation: Omit<HistoryEntry, 'timestamp'>) => void;
}

export const useImageStore = create<ImageState>((set, get) => ({
  activeImage: null,
  activeImageUrl: null,
  processingHistory: [],

  setActiveImage: (file: File | Blob) => {
    // Revoke previous URL to prevent memory leaks
    const currentUrl = get().activeImageUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    const newUrl = URL.createObjectURL(file);
    set({
      activeImage: file,
      activeImageUrl: newUrl,
    });
  },

  clearActiveImage: () => {
    // Revoke URL to prevent memory leaks
    const currentUrl = get().activeImageUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    set({
      activeImage: null,
      activeImageUrl: null,
    });
  },

  addToHistory: (operation) => {
    const newEntry: HistoryEntry = {
      ...operation,
      timestamp: Date.now(),
    };
    set((state) => ({
      processingHistory: [...state.processingHistory, newEntry],
    }));
  },
}));
