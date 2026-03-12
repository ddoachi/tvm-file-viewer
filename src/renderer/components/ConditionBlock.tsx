import React, { useMemo } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CsvRow } from '../types/index';

export interface Condition {
  id: string;
  column: keyof Omit<CsvRow, '_rowIndex'> | '';
  operator: string;
  value: string;
}

interface ConditionBlockProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onDelete: () => void;
  columnValues: Map<string, Set<string>>;
  showDragHandle?: boolean;
  variable?: string;
  variableColor?: string;
}

const COLUMNS: Array<keyof Omit<CsvRow, '_rowIndex'>> = [
  'tree', 'hier_LV', 'parent_master', 'master', 'multiple', 'xprobe',
  'assigned', 'vnets', 'D/S/B', 'DNW', 'G', 'switch_type',
  'psw_detected', 'psw_used', 'tg', 'cmos_drv', 'vnets_group', 'is_short',
];

const OPERATORS = [
  { value: '==', label: 'equals' },
  { value: '!=', label: 'not equals' },
  { value: '~=', label: 'contains' },
  { value: '^=', label: 'starts with' },
  { value: '$=', label: 'ends with' },
];

export const ConditionBlock: React.FC<ConditionBlockProps> = ({
  condition,
  onChange,
  onDelete,
  columnValues,
  variable,
  variableColor = '#2D7FF9',
}) => {
  const valueOptions = useMemo(() => {
    if (!condition.column) return [];
    const values = columnValues.get(condition.column);
    return values ? Array.from(values).sort() : [];
  }, [condition.column, columnValues]);

  const handleColumnChange = (_event: React.SyntheticEvent, value: string | null) => {
    onChange({ ...condition, column: (value || '') as Condition['column'], value: '' });
  };

  const handleOperatorChange = (_event: React.SyntheticEvent, value: string | null) => {
    onChange({ ...condition, operator: value || '==' });
  };

  const handleValueChange = (_event: React.SyntheticEvent, value: string | null) => {
    onChange({ ...condition, value: value || '' });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        py: 0.25,
        px: 0.5,
        borderRadius: 0.5,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {/* Variable badge */}
      {variable && (
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            bgcolor: variableColor,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {variable}
        </Box>
      )}

      {/* Column */}
      <Autocomplete
        size="small"
        options={COLUMNS}
        value={condition.column || undefined}
        onChange={handleColumnChange}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Col"
            sx={{ '& .MuiInputBase-input': { fontSize: 11, py: '2px !important' } }}
          />
        )}
        sx={{ flex: 2, minWidth: 80 }}
        disableClearable
      />

      {/* Operator */}
      <Autocomplete
        size="small"
        options={OPERATORS.map(op => op.value)}
        value={condition.operator}
        onChange={handleOperatorChange}
        getOptionLabel={(option) => {
          const op = OPERATORS.find(o => o.value === option);
          return op ? `${op.value}` : option;
        }}
        renderOption={({ key, ...optionProps }, option) => {
          const op = OPERATORS.find(o => o.value === option);
          return (
            <li key={key} {...optionProps} style={{ fontSize: 12 }}>
              <code style={{ marginRight: 6, fontWeight: 600 }}>{op?.value}</code>
              <span style={{ color: '#888' }}>{op?.label}</span>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{
              '& .MuiInputBase-input': { fontSize: 11, fontFamily: 'monospace', fontWeight: 600, py: '2px !important' },
            }}
          />
        )}
        sx={{ flex: 1, minWidth: 60 }}
        disableClearable
        slotProps={{ popper: { sx: { minWidth: 160 } } }}
      />

      {/* Value */}
      <Autocomplete
        size="small"
        freeSolo
        forcePopupIcon
        options={valueOptions}
        value={condition.value}
        onChange={handleValueChange}
        onInputChange={(_event, newValue) => {
          onChange({ ...condition, value: newValue });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Value"
            sx={{ '& .MuiInputBase-input': { fontSize: 11, py: '2px !important' } }}
          />
        )}
        ListboxProps={{ style: { maxHeight: 200 } }}
        sx={{ flex: 3, minWidth: 100 }}
      />

      {/* Delete */}
      <IconButton size="small" onClick={onDelete} sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
        <DeleteIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
};
