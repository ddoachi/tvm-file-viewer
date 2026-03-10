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

const REQUIRED_COLUMNS = ['tree', 'master', 'vnets'];

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
    tree: row.tree || '',
    hier_LV: Number(row.hier_LV) || 0,
    parent_master: row.parent_master || '',
    master: row.master || '',
    multiple: Number(row.multiple) || 0,
    xprobe: row.xprobe || '',
    assigned: row.assigned || '',
    vnets: row.vnets || '',
    "D/S/B": Number(row["D/S/B"]) || 0,
    DNW: Number(row.DNW) || 0,
    G: Number(row.G) || 0,
    switch_type: Number(row.switch_type) || 0,
    psw_detected: Number(row.psw_detected) || 0,
    psw_used: Number(row.psw_used) || 0,
    tg: Number(row.tg) || 0,
    cmos_drv: row.cmos_drv || '',
    vnets_group: row.vnets_group || '',
    is_short: Number(row.is_short) || 0,
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
