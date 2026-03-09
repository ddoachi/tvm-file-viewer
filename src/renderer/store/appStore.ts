import { create } from 'zustand';
import type { CsvRow, FilterResult } from '../types';

export interface OpenFile {
  id: string;
  fileName: string;
  filePath: string;
  rows: CsvRow[];
}

interface AppState {
  openFiles: OpenFile[];
  activeFileId: string | null;
  parseErrors: string[];
  isLoading: boolean;
  isFiltering: boolean;
  filterResults: Record<string, FilterResult>; // per-file filter results
  searchText: string;
  themeMode: 'light' | 'dark';
  gridFilteredCount: number | null;
  addFile: (file: OpenFile) => void;
  removeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  setParseErrors: (errors: string[]) => void;
  setLoading: (loading: boolean) => void;
  setFiltering: (filtering: boolean) => void;
  setFilterResult: (result: FilterResult | null) => void;
  setSearchText: (text: string) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  setGridFilteredCount: (count: number | null) => void;
  updateFileRows: (filePath: string, rows: CsvRow[]) => void;
  renameFile: (fileId: string, newName: string) => void;
  reset: () => void;
}

// Selector to get filterResult for active file
export const selectFilterResult = (state: AppState): FilterResult | null => {
  const id = state.activeFileId;
  return id ? (state.filterResults[id] ?? null) : null;
};

export const useAppStore = create<AppState>((set) => ({
  openFiles: [],
  activeFileId: null,
  parseErrors: [],
  isLoading: false,
  isFiltering: false,
  filterResults: {},
  searchText: '',
  themeMode: 'light',
  gridFilteredCount: null,

  addFile: (file) => set((state) => ({
    openFiles: [...state.openFiles, file],
    activeFileId: file.id,
    parseErrors: [],
    gridFilteredCount: null,
  })),

  removeFile: (fileId) => set((state) => {
    const newFiles = state.openFiles.filter(f => f.id !== fileId);
    let newActiveId = state.activeFileId;

    if (state.activeFileId === fileId) {
      if (newFiles.length > 0) {
        const removedIndex = state.openFiles.findIndex(f => f.id === fileId);
        newActiveId = newFiles[Math.min(removedIndex, newFiles.length - 1)]?.id || null;
      } else {
        newActiveId = null;
      }
    }

    const { [fileId]: _, ...remainingResults } = state.filterResults;

    return {
      openFiles: newFiles,
      activeFileId: newActiveId,
      filterResults: remainingResults,
      gridFilteredCount: null,
    };
  }),

  setActiveFile: (fileId) => set({ activeFileId: fileId, gridFilteredCount: null }),

  setParseErrors: (errors) => set({ parseErrors: errors }),

  setLoading: (loading) => set({ isLoading: loading }),

  setFiltering: (filtering) => set({ isFiltering: filtering }),

  setFilterResult: (result) => set((state) => {
    const id = state.activeFileId;
    if (!id) return {};
    if (result) {
      return { filterResults: { ...state.filterResults, [id]: result } };
    } else {
      const { [id]: _, ...rest } = state.filterResults;
      return { filterResults: rest };
    }
  }),

  setSearchText: (text) => set({ searchText: text }),

  setThemeMode: (mode) => set({ themeMode: mode }),

  setGridFilteredCount: (count) => set({ gridFilteredCount: count }),

  updateFileRows: (filePath, rows) => set((state) => {
    const file = state.openFiles.find(f => f.filePath === filePath);
    const newFilterResults = { ...state.filterResults };
    // Clear stale filter for this file — conditions in FilterBuilder remain visible for re-run
    if (file && newFilterResults[file.id]) {
      delete newFilterResults[file.id];
    }
    return {
      openFiles: state.openFiles.map(f =>
        f.filePath === filePath ? { ...f, rows } : f
      ),
      filterResults: newFilterResults,
    };
  }),

  renameFile: (fileId, newName) => set((state) => ({
    openFiles: state.openFiles.map(f =>
      f.id === fileId ? { ...f, fileName: newName } : f
    ),
  })),

  reset: () => set({
    openFiles: [],
    activeFileId: null,
    parseErrors: [],
    isLoading: false,
    isFiltering: false,
    filterResults: {},
    searchText: '',
    themeMode: 'light',
    gridFilteredCount: null,
  }),
}));
