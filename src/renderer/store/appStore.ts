import { create } from 'zustand';
import type { CsvRow } from '../types';

interface AppState {
  rows: CsvRow[];
  fileName: string | null;
  parseErrors: string[];
  isLoading: boolean;
  setRows: (rows: CsvRow[], fileName: string) => void;
  setParseErrors: (errors: string[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  rows: [],
  fileName: null,
  parseErrors: [],
  isLoading: false,

  setRows: (rows, fileName) => set({ rows, fileName, parseErrors: [] }),

  setParseErrors: (errors) => set({ parseErrors: errors }),

  setLoading: (loading) => set({ isLoading: loading }),

  reset: () => set({ rows: [], fileName: null, parseErrors: [], isLoading: false }),
}));
