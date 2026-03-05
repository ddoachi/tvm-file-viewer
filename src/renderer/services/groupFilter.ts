import type { CsvRow, FilterCondition, FilterResult } from '../types';

/**
 * Evaluates a single filter condition against a row
 */
export function evaluateCondition(row: CsvRow, condition: FilterCondition): boolean {
  const fieldValue = row[condition.field] || '';
  const filterValue = condition.value || '';

  // Case-insensitive comparison
  const fieldLower = fieldValue.toLowerCase();
  const filterLower = filterValue.toLowerCase();

  switch (condition.operator) {
    case 'equals':
      return fieldLower === filterLower;

    case 'notEquals':
      return fieldLower !== filterLower;

    case 'contains':
      return fieldLower.includes(filterLower);

    case 'notContains':
      return !fieldLower.includes(filterLower);

    case 'startsWith':
      return fieldLower.startsWith(filterLower);

    case 'endsWith':
      return fieldLower.endsWith(filterLower);

    case 'isEmpty':
      return fieldValue.trim() === '';

    case 'isNotEmpty':
      return fieldValue.trim() !== '';

    default:
      return true;
  }
}

/**
 * Two-phase group-aware filtering:
 * Phase 1: Find direct matches and collect their groups
 * Phase 2: Include all rows that belong to matched groups
 */
export function applyGroupFilter(
  rows: CsvRow[],
  conditions: FilterCondition[]
): FilterResult {
  // If no conditions, return empty result (no filter active)
  if (conditions.length === 0) {
    return {
      directMatches: new Set<number>(),
      matchedGroups: new Set<string>(),
      visibleRowIndices: new Set<number>(),
    };
  }

  // Phase 1: Direct matches - find rows that match ALL conditions
  const directMatches = new Set<number>();
  const matchedGroups = new Set<string>();

  for (const row of rows) {
    const allConditionsMatch = conditions.every(condition =>
      evaluateCondition(row, condition)
    );

    if (allConditionsMatch) {
      directMatches.add(row._rowIndex);
      matchedGroups.add(row.Group);
    }
  }

  // Phase 2: Group expansion - include all rows with matched groups
  const visibleRowIndices = new Set<number>();

  for (const row of rows) {
    if (matchedGroups.has(row.Group)) {
      visibleRowIndices.add(row._rowIndex);
    }
  }

  return {
    directMatches,
    matchedGroups,
    visibleRowIndices,
  };
}
