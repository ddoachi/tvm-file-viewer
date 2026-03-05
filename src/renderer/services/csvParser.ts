import Papa from 'papaparse';
import type { CsvRow } from '../types';

export interface ParseError {
  row: number;
  message: string;
}

export interface ParseResult {
  rows: CsvRow[];
  errors: ParseError[];
  rowCount: number;
}

const REQUIRED_COLUMNS = ['Net', 'Group', 'Vnet1', 'Vnet2'];

export function parseCsv(csvText: string): ParseResult {
  const parseResult = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  // Validate required columns
  const headers = parseResult.meta.fields || [];
  const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Convert to CsvRow format with _rowIndex
  const rows: CsvRow[] = parseResult.data.map((row, index) => ({
    Net: row.Net || '',
    Group: row.Group || '',
    Vnet1: row.Vnet1 || '',
    Vnet2: row.Vnet2 || '',
    _treePath: [],
    _rowIndex: index,
  }));

  // Convert Papa Parse errors to ParseError format
  const errors: ParseError[] = parseResult.errors.map(err => ({
    row: err.row || 0,
    message: err.message,
  }));

  return {
    rows,
    errors,
    rowCount: rows.length,
  };
}
