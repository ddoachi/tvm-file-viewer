import type { CsvRow } from '../types';

export function computeTreePaths(rows: CsvRow[]): CsvRow[] {
  // Tree paths are derived from the 'tree' column which is already hierarchical (dot-separated)
  // No transformation needed since CsvRow no longer has id/parentId — AG Grid uses getDataPath
  return rows;
}
