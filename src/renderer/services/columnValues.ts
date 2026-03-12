import type { CsvRow } from '../types';

const COLUMNS: Array<keyof Omit<CsvRow, '_rowIndex'>> = [
  'tree', 'hier_LV', 'parent_master', 'master', 'multiple', 'xprobe',
  'assigned', 'vnets', 'D/S/B', 'DNW', 'G', 'switch_type',
  'psw_detected', 'psw_used', 'tg', 'cmos_drv', 'vnets_group', 'is_short',
];

/**
 * Build a Map of column -> Set<string> containing all unique values per column.
 * Called once at file load time so all values are captured (no sampling).
 */
export function buildColumnValueSets(rows: CsvRow[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  COLUMNS.forEach(col => map.set(col, new Set()));

  rows.forEach(row => {
    COLUMNS.forEach(col => {
      const value = row[col];
      if (value !== null && value !== undefined && value !== '') {
        map.get(col)!.add(String(value));
      }
    });
  });

  return map;
}
