import type { CsvRow, FilterCondition, FilterResult } from '../types';

/**
 * Evaluates a single filter condition against a row
 */
export function evaluateCondition(row: CsvRow, condition: FilterCondition): boolean {
  const fieldValue = row[condition.field] || '';
  const filterValue = condition.value || '';

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
 * Row-level filtering: find all rows matching the conditions (AND by default),
 * or use a custom evaluate function for boolean formula support.
 */
export function applyGroupFilter(
  rows: CsvRow[],
  conditions: FilterCondition[],
  evaluate?: (varMap: Map<string, boolean>) => boolean
): FilterResult {
  if (conditions.length === 0) {
    return {
      directMatches: new Set<number>(),
      matchedGroups: new Set<string>(),
      visibleRowIndices: new Set<number>(),
    };
  }

  const directMatches = new Set<number>();
  const matchedGroups = new Set<string>();

  for (const row of rows) {
    let matched: boolean;

    if (evaluate) {
      const varMap = new Map<string, boolean>();
      conditions.forEach((cond, i) => {
        varMap.set(String.fromCharCode(65 + i), evaluateCondition(row, cond));
      });
      matched = evaluate(varMap);
    } else {
      matched = conditions.every(cond => evaluateCondition(row, cond));
    }

    if (matched) {
      directMatches.add(row._rowIndex);
      matchedGroups.add(row.Group);
    }
  }

  return {
    directMatches,
    matchedGroups,
    visibleRowIndices: directMatches,
  };
}
