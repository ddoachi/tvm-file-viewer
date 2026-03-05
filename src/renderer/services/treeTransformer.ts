import type { CsvRow } from '../types';

export function computeTreePaths(rows: CsvRow[]): CsvRow[] {
  return rows.map(row => {
    // Split Net column on '.' to create tree path
    const treePath = row.Net.split('.').map((_, index, arr) => index);

    return {
      ...row,
      _treePath: treePath,
    };
  });
}
