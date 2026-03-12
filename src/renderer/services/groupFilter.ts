import type { CsvRow, FilterCondition, FilterResult } from '../types';

/**
 * Evaluates a single filter condition against a row
 */
export function evaluateCondition(row: CsvRow, condition: FilterCondition): boolean {
  const rawValue = row[condition.field];
  const fieldValue = rawValue !== null && rawValue !== undefined ? String(rawValue) : '';
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
 * Group-level filtering: evaluate each condition independently per row,
 * then check at the Group level (grouped by `tree` column) whether ALL
 * conditions (or a boolean formula) are satisfied by at least one row
 * each within that Group.
 *
 * When a Group qualifies, ALL rows in that Group are shown (not just
 * the matching rows).
 */
export function applyGroupFilter(
  rows: CsvRow[],
  conditions: FilterCondition[],
  evaluate?: (varMap: Map<string, boolean>) => boolean,
  combineOperator?: 'AND' | 'OR'
): FilterResult {
  if (conditions.length === 0) {
    return {
      directMatches: new Set<number>(),
      matchedGroups: new Set<string>(),
      visibleRowIndices: new Set<number>(),
    };
  }

  // Phase 1: For each condition, find which Groups (by tree) have matching rows
  const conditionMatchesByGroup: Map<string, number[]>[] = conditions.map(condition => {
    const groupMatches = new Map<string, number[]>();
    rows.forEach(row => {
      if (evaluateCondition(row, condition)) {
        const group = row.tree;
        let indices = groupMatches.get(group);
        if (!indices) {
          indices = [];
          groupMatches.set(group, indices);
        }
        indices.push(row._rowIndex);
      }
    });
    return groupMatches;
  });

  // Collect all Groups that have at least one match for any condition
  const allGroups = new Set<string>();
  conditionMatchesByGroup.forEach(groupMatches => {
    groupMatches.forEach((_, group) => {
      allGroups.add(group);
    });
  });

  // Phase 2: For each Group, evaluate formula/operator at Group level
  const matchedGroups = new Set<string>();
  const directMatches = new Set<number>();

  allGroups.forEach(group => {
    let groupQualifies: boolean;

    if (evaluate) {
      // Formula mode: each variable = "this Group has >=1 row matching this condition"
      const varMap = new Map<string, boolean>();
      conditions.forEach((_, i) => {
        varMap.set(String.fromCharCode(65 + i), conditionMatchesByGroup[i].has(group));
      });
      groupQualifies = evaluate(varMap);
    } else if (combineOperator === 'OR') {
      // OR: at least one condition has a match in this Group
      groupQualifies = conditionMatchesByGroup.some(gm => gm.has(group));
    } else {
      // Default AND: all conditions must have at least one match in this Group
      groupQualifies = conditionMatchesByGroup.every(gm => gm.has(group));
    }

    if (groupQualifies) {
      matchedGroups.add(group);
      // Collect direct matches: rows that matched any condition in this Group
      conditionMatchesByGroup.forEach(groupMatches => {
        const indices = groupMatches.get(group);
        if (indices) {
          indices.forEach(idx => {
            directMatches.add(idx);
          });
        }
      });
    }
  });

  // Phase 3: visibleRowIndices = ALL rows in matched Groups (by tree)
  const visibleRowIndices = new Set<number>();
  rows.forEach(row => {
    if (matchedGroups.has(row.tree)) {
      visibleRowIndices.add(row._rowIndex);
    }
  });

  return {
    directMatches,
    matchedGroups,
    visibleRowIndices,
  };
}
