import { create } from 'zustand';
import type { CsvRow, FilterResult } from '../types';

interface AppState {
  rows: CsvRow[];
  fileName: string | null;
  parseErrors: string[];
  isLoading: boolean;
  filterResult: FilterResult | null;
  searchText: string;
  setRows: (rows: CsvRow[], fileName: string) => void;
  setParseErrors: (errors: string[]) => void;
  setLoading: (loading: boolean) => void;
  setFilterResult: (result: FilterResult | null) => void;
  setSearchText: (text: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  rows: [],
  fileName: null,
  parseErrors: [],
  isLoading: false,
  filterResult: null,
  searchText: '',

  setRows: (rows, fileName) => set({ rows, fileName, parseErrors: [] }),

  setParseErrors: (errors) => set({ parseErrors: errors }),

  setLoading: (loading) => set({ isLoading: loading }),

  setFilterResult: (result) => set({ filterResult: result }),

  setSearchText: (text) => set({ searchText: text }),

  reset: () => set({ rows: [], fileName: null, parseErrors: [], isLoading: false, filterResult: null, searchText: '' }),
}));
