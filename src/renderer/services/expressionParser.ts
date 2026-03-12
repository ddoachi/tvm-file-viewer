/**
 * Expression Parser for Advanced Filtering
 *
 * Parses filter expressions like:
 * - "vnets==VDD"
 * - "vnets==VDD && cmos_drv==PMOS"
 * - "master==M1 || master==M2"
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

  conditionStrings.forEach(condStr => {
    const condition = parseSingleCondition(condStr);
    if (condition) {
      conditions.push(condition);
    }
  });

  if (conditions.length === 0) {
    return null;
  }

  return {
    conditions,
    operator: combineOperator,
  };
}

/**
 * Parse a single condition like "vnets==VDD"
 */
function parseSingleCondition(condStr: string): FilterCondition | null {
  const patterns = [
    { regex: /^(\w+)\s*==\s*(.+)$/, op: 'equals' as FilterOperator },
    { regex: /^(\w+)\s*!=\s*(.+)$/, op: 'notEquals' as FilterOperator },
    { regex: /^(\w+)\s*~=\s*(.+)$/, op: 'contains' as FilterOperator },
    { regex: /^(\w+)\s*\^=\s*(.+)$/, op: 'startsWith' as FilterOperator },
    { regex: /^(\w+)\s*\$=\s*(.+)$/, op: 'endsWith' as FilterOperator },
  ];

  let result: FilterCondition | null = null;

  patterns.some(({ regex, op }) => {
    const match = condStr.match(regex);
    if (match) {
      const field = match[1];
      const value = match[2].trim();

      // Validate field is a valid column
      const validColumns: Array<keyof Omit<CsvRow, '_rowIndex'>> = [
        'tree', 'hier_LV', 'parent_master', 'master', 'multiple', 'xprobe',
        'assigned', 'vnets', 'D/S/B', 'DNW', 'G', 'switch_type',
        'psw_detected', 'psw_used', 'tg', 'cmos_drv', 'vnets_group', 'is_short',
      ];
      if (!validColumns.includes(field as any)) {
        console.warn(`Invalid column name: ${field}`);
        return false;
      }

      result = {
        field: field as keyof Omit<CsvRow, '_rowIndex'>,
        operator: op,
        value,
      };
      return true; // stop iteration
    }
    return false;
  });

  return result;
}

/**
 * Evaluate parsed expression against a row
 */
export function evaluateExpression(row: CsvRow, parsed: ParsedExpression): boolean {
  if (parsed.operator === 'AND') {
    return parsed.conditions.every(cond => evaluateSingleCondition(row, cond));
  } else {
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
