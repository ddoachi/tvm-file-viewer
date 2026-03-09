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
 * Group-level filtering: evaluate each condition independently per row,
 * then check at the Group level whether ALL conditions (or a boolean formula)
 * are satisfied by at least one row each within that Group.
 *
 * Example: Vnet1=="VDD" && Vnet1=="VSS"
 *   - For each Group, check: does this Group have >=1 row with Vnet1==VDD
 *     AND >=1 row with Vnet1==VSS?
 *   - If yes, show ALL rows in that Group.
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

  // Phase 1: For each condition, find which Groups have matching rows
  // and collect matching row indices per condition per Group
  const conditionMatchesByGroup: Map<string, number[]>[] = conditions.map(condition => {
    const groupMatches = new Map<string, number[]>();
    for (const row of rows) {
      if (evaluateCondition(row, condition)) {
        const group = row.Group;
        let indices = groupMatches.get(group);
        if (!indices) {
          indices = [];
          groupMatches.set(group, indices);
        }
        indices.push(row._rowIndex);
      }
    }
    return groupMatches;
  });

  // Collect all Groups that have at least one match for any condition
  const allGroups = new Set<string>();
  for (const groupMatches of conditionMatchesByGroup) {
    for (const group of groupMatches.keys()) {
      allGroups.add(group);
    }
  }

  // Phase 2: For each Group, evaluate formula/operator at Group level
  const matchedGroups = new Set<string>();
  const directMatches = new Set<number>();

  for (const group of allGroups) {
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
      for (const groupMatches of conditionMatchesByGroup) {
        const indices = groupMatches.get(group);
        if (indices) {
          for (const idx of indices) {
            directMatches.add(idx);
          }
        }
      }
    }
  }

  // Phase 3: visibleRowIndices = all rows in matched Groups
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
