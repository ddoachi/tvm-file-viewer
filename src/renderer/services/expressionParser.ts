/**
 * Expression Parser for Advanced Filtering
 *
 * Parses filter expressions like:
 * - "Vnet1==VDD"
 * - "Vnet1==VDD && Vnet2==VEXT"
 * - "Group==1 || Group==2"
 */

import type { CsvRow, FilterCondition, FilterOperator } from '../types';

export interface ParsedExpression {
  conditions: FilterCondition[];
  operator: 'AND' | 'OR';
}

/**
 * Parse a filter expression string into FilterConditions
 *
 * Supported syntax:
 * - Column==Value (equals)
 * - Column!=Value (not equals)
 * - Column~=Value (contains)
 * - Column^=Value (starts with)
 * - Column$=Value (ends with)
 * - Multiple conditions with && (AND) or || (OR)
 *
 * Examples:
 * - "Vnet1==VDD"
 * - "Vnet1==VDD && Vnet2==VEXT"
 * - "Group==1 || Group==2"
 */
export function parseFilterExpression(expression: string): ParsedExpression | null {
  if (!expression || expression.trim() === '') {
    return null;
  }

  // Detect AND/OR operator
  let combineOperator: 'AND' | 'OR' = 'AND';
  let conditionStrings: string[];

  if (expression.includes('||')) {
    combineOperator = 'OR';
    conditionStrings = expression.split('||').map(s => s.trim());
  } else if (expression.includes('&&')) {
    combineOperator = 'AND';
    conditionStrings = expression.split('&&').map(s => s.trim());
  } else {
    conditionStrings = [expression.trim()];
  }

  // Parse each condition
  const conditions: FilterCondition[] = [];

  for (const condStr of conditionStrings) {
    const condition = parseSingleCondition(condStr);
    if (condition) {
      conditions.push(condition);
    }
  }

  if (conditions.length === 0) {
    return null;
  }

  return {
    conditions,
    operator: combineOperator,
  };
}

/**
 * Parse a single condition like "Vnet1==VDD"
 */
function parseSingleCondition(condStr: string): FilterCondition | null {
  // Regex to match: Column Operator Value
  const patterns = [
    { regex: /^(\w+)\s*==\s*(.+)$/, op: 'equals' as FilterOperator },
    { regex: /^(\w+)\s*!=\s*(.+)$/, op: 'notEquals' as FilterOperator },
    { regex: /^(\w+)\s*~=\s*(.+)$/, op: 'contains' as FilterOperator },
    { regex: /^(\w+)\s*\^=\s*(.+)$/, op: 'startsWith' as FilterOperator },
    { regex: /^(\w+)\s*\$=\s*(.+)$/, op: 'endsWith' as FilterOperator },
  ];

  for (const { regex, op } of patterns) {
    const match = condStr.match(regex);
    if (match) {
      const field = match[1];
      const value = match[2].trim();

      // Validate field is a valid column
      if (!['Net', 'Group', 'Vnet1', 'Vnet2'].includes(field)) {
        console.warn(`Invalid column name: ${field}`);
        return null;
      }

      return {
        field: field as keyof Omit<CsvRow, 'id' | 'parentId' | '_rowIndex'>,
        operator: op,
        value,
      };
    }
  }

  return null;
}

/**
 * Evaluate parsed expression against a row
 */
export function evaluateExpression(row: CsvRow, parsed: ParsedExpression): boolean {
  if (parsed.operator === 'AND') {
    // All conditions must match
    return parsed.conditions.every(cond => evaluateSingleCondition(row, cond));
  } else {
    // At least one condition must match
    return parsed.conditions.some(cond => evaluateSingleCondition(row, cond));
  }
}

/**
 * Evaluate a single condition
 */
function evaluateSingleCondition(row: CsvRow, condition: FilterCondition): boolean {
  const fieldValue = row[condition.field]?.toString().toLowerCase() || '';
  const targetValue = condition.value.toLowerCase();

  switch (condition.operator) {
    case 'equals':
      return fieldValue === targetValue;
    case 'notEquals':
      return fieldValue !== targetValue;
    case 'contains':
      return fieldValue.includes(targetValue);
    case 'notContains':
      return !fieldValue.includes(targetValue);
    case 'startsWith':
      return fieldValue.startsWith(targetValue);
    case 'endsWith':
      return fieldValue.endsWith(targetValue);
    case 'isEmpty':
      return fieldValue.trim() === '';
    case 'isNotEmpty':
      return fieldValue.trim() !== '';
    default:
      return true;
  }
}
