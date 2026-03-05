import type { CsvRow } from '../types';

export interface ParseError {
  row: number;
  message: string;
}

export interface ParseResult {
  rows: CsvRow[];
  errors: ParseError[];
  rowCount: number;
}

const REQUIRED_FIELDS = ['Net', 'Group', 'Vnet1', 'Vnet2'];

export function parseJson(jsonText: string): ParseResult {
  const errors: ParseError[] = [];

  try {
    const data = JSON.parse(jsonText);

    if (!Array.isArray(data)) {
      throw new Error('JSON must contain an array of objects');
    }

    // Validate and convert to CsvRow format
    const rows: CsvRow[] = data.map((item, index) => {
      // Check for missing required fields
      const missingFields = REQUIRED_FIELDS.filter(field => !(field in item));
      if (missingFields.length > 0) {
        errors.push({
          row: index,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      return {
        id: item.id || `row-${index}`,
        parentId: item.parentId || null,
        Net: item.Net || '',
        Group: item.Group || '',
        Vnet1: item.Vnet1 || '',
        Vnet2: item.Vnet2 || '',
        _rowIndex: index,
      };
    });

    return {
      rows,
      errors,
      rowCount: rows.length,
    };
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
