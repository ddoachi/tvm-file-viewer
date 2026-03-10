export interface ElectronAPI {
  openFileDialog(): Promise<string | null>;
  readFile(filePath: string): Promise<string>;
  onRowClick(rowData: any): Promise<void>;
  openInEditor(filePath: string): Promise<void>;
  watchFile(filePath: string): Promise<void>;
  unwatchFile(filePath: string): Promise<void>;
  onFileChanged(callback: (filePath: string) => void): () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export type CsvRow = {
  tree: string;
  hier_LV: number;
  parent_master: string;
  master: string;
  multiple: number;
  xprobe: string;
  assigned: string;
  vnets: string;
  "D/S/B": number;
  DNW: number;
  G: number;
  switch_type: number;
  psw_detected: number;
  psw_used: number;
  tg: number;
  cmos_drv: string;
  vnets_group: string;
  is_short: number;
  _rowIndex: number;
};

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
  field: keyof Omit<CsvRow, '_rowIndex'>;
  operator: FilterOperator;
  value: string;
}

export interface FilterResult {
  directMatches: Set<number>;
  matchedGroups: Set<string>;
  visibleRowIndices: Set<number>;
}
