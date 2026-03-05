export interface ElectronAPI {
  openFileDialog(): Promise<string | null>;
  readFile(filePath: string): Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export interface CsvRow {
  Net: string;
  Group: string;
  Vnet1: string;
  Vnet2: string;
  _treePath: number[];
  _rowIndex: number;
}

export interface ParseResult {
  rows: CsvRow[];
  errors: ParseError[];
  rowCount: number;
}

export interface ParseError {
  row: number;
  message: string;
}

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith';

export interface FilterCondition {
  field: keyof Omit<CsvRow, '_treePath' | '_rowIndex'>;
  operator: FilterOperator;
  value: string;
}

export interface FilterResult {
  rows: CsvRow[];
  totalCount: number;
  filteredCount: number;
}
