import { create } from 'zustand';
import type { CsvRow, FilterResult } from '../types';

export interface OpenFile {
  id: string;
  fileName: string;
  rows: CsvRow[];
}

interface AppState {
  openFiles: OpenFile[];
  activeFileId: string | null;
  parseErrors: string[];
  isLoading: boolean;
  filterResult: FilterResult | null;
  searchText: string;
  themeMode: 'light' | 'dark';
  addFile: (file: OpenFile) => void;
  removeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  setParseErrors: (errors: string[]) => void;
  setLoading: (loading: boolean) => void;
  setFilterResult: (result: FilterResult | null) => void;
  setSearchText: (text: string) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  openFiles: [],
  activeFileId: null,
  parseErrors: [],
  isLoading: false,
  filterResult: null,
  searchText: '',
  themeMode: 'light',

  addFile: (file) => set((state) => ({
    openFiles: [...state.openFiles, file],
    activeFileId: file.id,
    parseErrors: [],
  })),

  removeFile: (fileId) => set((state) => {
    const newFiles = state.openFiles.filter(f => f.id !== fileId);
    let newActiveId = state.activeFileId;

    // If removing active file, switch to another
    if (state.activeFileId === fileId) {
      if (newFiles.length > 0) {
        const removedIndex = state.openFiles.findIndex(f => f.id === fileId);
        // Try to activate the next file, or previous if it was the last
        newActiveId = newFiles[Math.min(removedIndex, newFiles.length - 1)]?.id || null;
      } else {
        newActiveId = null;
      }
    }

    return {
      openFiles: newFiles,
      activeFileId: newActiveId,
    };
  }),

  setActiveFile: (fileId) => set({ activeFileId: fileId }),

  setParseErrors: (errors) => set({ parseErrors: errors }),

  setLoading: (loading) => set({ isLoading: loading }),

  setFilterResult: (result) => set({ filterResult: result }),

  setSearchText: (text) => set({ searchText: text }),

  setThemeMode: (mode) => set({ themeMode: mode }),

  reset: () => set({
    openFiles: [],
    activeFileId: null,
    parseErrors: [],
    isLoading: false,
    filterResult: null,
    searchText: '',
    themeMode: 'light'
  }),
}));
