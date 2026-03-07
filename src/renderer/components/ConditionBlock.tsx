import React, { useMemo } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { CsvRow } from '../types/index';
import { colors } from '../theme/designSystem';

export interface Condition {
  id: string;
  column: keyof Omit<CsvRow, 'id' | 'parentId' | '_rowIndex'> | '';
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
}

const COLUMNS: Array<keyof Omit<CsvRow, 'id' | 'parentId' | '_rowIndex'>> = ['Net', 'Group', 'Vnet1', 'Vnet2'];

const OPERATORS = [
  { value: '==', label: 'equals', symbol: '=', color: colors.primary.main },
  { value: '!=', label: 'not equals', symbol: '≠', color: colors.semantic.error },
  { value: '~=', label: 'contains', symbol: '⊃', color: colors.semantic.success },
  { value: '^=', label: 'starts with', symbol: 'A…', color: colors.semantic.warning },
  { value: '$=', label: 'ends with', symbol: '…Z', color: colors.semantic.info },
];

export const ConditionBlock: React.FC<ConditionBlockProps> = ({
  condition,
  onChange,
  onDelete,
  columnValues,
  showDragHandle = false,
  variable,
}) => {
  const valueOptions = useMemo(() => {
    if (!condition.column) return [];
    const values = columnValues.get(condition.column);
    return values ? Array.from(values).sort() : [];
  }, [condition.column, columnValues]);

  const handleColumnChange = (_event: React.SyntheticEvent, value: string | null) => {
    onChange({
      ...condition,
      column: (value || '') as Condition['column'],
      value: '',
    });
  };

  const handleOperatorChange = (_event: React.SyntheticEvent, value: string | null) => {
    onChange({
      ...condition,
      operator: value || '==',
    });
  };

  const handleValueChange = (_event: React.SyntheticEvent, value: string | null) => {
    onChange({
      ...condition,
      value: value || '',
    });
  };

  const selectedOperator = OPERATORS.find(op => op.value === condition.operator);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {showDragHandle && (
        <DragIndicatorIcon
          sx={{ cursor: 'grab', color: 'text.secondary', fontSize: 20 }}
        />
      )}

      {/* Variable Label */}
      {variable && (
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: colors.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {variable}
        </Box>
      )}

      {/* Column Selector */}
      <Autocomplete
        size="small"
        options={COLUMNS}
        value={condition.column || null}
        onChange={handleColumnChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Column"
            placeholder="Select..."
            InputLabelProps={{ sx: { fontSize: 12 } }}
            sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}
          />
        )}
        sx={{ minWidth: 120 }}
      />

      {/* Operator Selector */}
      <Autocomplete
        size="small"
        options={OPERATORS.map(op => op.value)}
        value={condition.operator}
        onChange={handleOperatorChange}
        getOptionLabel={(option) => {
          const op = OPERATORS.find(o => o.value === option);
          return op ? `${op.value} ${op.label}` : option;
        }}
        renderOption={({ key, ...optionProps }, option) => {
          const op = OPERATORS.find(o => o.value === option);
          return (
            <li key={key} {...optionProps}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 24, height: 24, borderRadius: '4px',
                  bgcolor: op?.color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                  flexShrink: 0,
                }}>
                  {op?.symbol}
                </Box>
                <Typography sx={{ fontSize: 12 }}>{op?.label}</Typography>
              </Box>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Operator"
            InputLabelProps={{ sx: { fontSize: 12 } }}
            sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}
            InputProps={{
              ...params.InputProps,
              startAdornment: selectedOperator && (
                <Box sx={{
                  px: 0.75, py: 0.25, borderRadius: '4px',
                  bgcolor: `${selectedOperator.color}18`,
                  color: selectedOperator.color,
                  fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
                  ml: 0.5, lineHeight: 1.2,
                  border: `1px solid ${selectedOperator.color}40`,
                  whiteSpace: 'nowrap',
                }}>
                  {selectedOperator.value}
                </Box>
              ),
            }}
          />
        )}
        sx={{ minWidth: 140 }}
        disableClearable
      />

      {/* Value Input with Autocomplete */}
      <Autocomplete
        size="small"
        freeSolo
        options={valueOptions}
        value={condition.value}
        onChange={handleValueChange}
        onInputChange={(_event, newValue) => {
          onChange({
            ...condition,
            value: newValue,
          });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Value"
            placeholder="Enter or select..."
            InputLabelProps={{ sx: { fontSize: 12 } }}
            sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}
          />
        )}
        ListboxProps={{
          style: { maxHeight: 200 },
        }}
        sx={{ minWidth: 180, flex: 1 }}
      />

      {/* Delete Button */}
      <IconButton
        size="small"
        onClick={onDelete}
        color="error"
        sx={{ p: 0.5 }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
