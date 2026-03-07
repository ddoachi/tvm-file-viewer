export interface ElectronAPI {
  openFileDialog(): Promise<string | null>;
  readFile(filePath: string): Promise<string>;
  onRowClick(rowData: any): Promise<void>;
  openInEditor(filePath: string): Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export interface CsvRow {
  id: string;
  parentId: string | null;
  Net: string;
  Group: string;
  Vnet1: string;
  Vnet2: string;
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
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty';

export interface FilterCondition {
  field: keyof Omit<CsvRow, 'id' | 'parentId' | '_rowIndex'>;
  operator: FilterOperator;
  value: string;
}

export interface FilterResult {
  directMatches: Set<number>;
  matchedGroups: Set<string>;
  visibleRowIndices: Set<number>;
}
