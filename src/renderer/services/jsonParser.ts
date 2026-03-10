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

const REQUIRED_FIELDS = ['tree', 'master', 'vnets'];

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
        tree: item.tree || '',
        hier_LV: Number(item.hier_LV) || 0,
        parent_master: item.parent_master || '',
        master: item.master || '',
        multiple: Number(item.multiple) || 0,
        xprobe: item.xprobe || '',
        assigned: item.assigned || '',
        vnets: item.vnets || '',
        "D/S/B": Number(item["D/S/B"]) || 0,
        DNW: Number(item.DNW) || 0,
        G: Number(item.G) || 0,
        switch_type: Number(item.switch_type) || 0,
        psw_detected: Number(item.psw_detected) || 0,
        psw_used: Number(item.psw_used) || 0,
        tg: Number(item.tg) || 0,
        cmos_drv: item.cmos_drv || '',
        vnets_group: item.vnets_group || '',
        is_short: Number(item.is_short) || 0,
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
