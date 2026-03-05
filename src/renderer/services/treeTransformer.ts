import type { CsvRow } from '../types';

export function computeTreePaths(rows: CsvRow[]): CsvRow[] {
  // Build a map of Net name to row for parent lookup
  const netToRow = new Map<string, CsvRow>();

  return rows.map(row => {
    // Split Net column on '.' to determine hierarchy
    const netParts = row.Net.split('.');

    let parentId: string | null = null;

    // If this is not a root node, find parent
    if (netParts.length > 1) {
      // Parent is the Net with one less segment
      const parentNetParts = netParts.slice(0, -1);
      const parentNet = parentNetParts.join('.');

      // Look up parent row
      const parentRow = netToRow.get(parentNet);
      if (parentRow) {
        parentId = parentRow.id;
      }
    }

    const updatedRow = {
      ...row,
      parentId,
    };

    // Store this row for future parent lookups
    netToRow.set(row.Net, updatedRow);

    return updatedRow;
  });
}
