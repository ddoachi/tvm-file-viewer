import React, { useMemo } from 'react';
import {
  Paper,
  Box,
  Autocomplete,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { CsvRow } from '../types/index';

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
}

const COLUMNS: Array<keyof Omit<CsvRow, 'id' | 'parentId' | '_rowIndex'>> = ['Net', 'Group', 'Vnet1', 'Vnet2'];

const OPERATORS = [
  { value: '==', label: '== (equals)', color: '#1976d2' },
  { value: '!=', label: '!= (not equals)', color: '#d32f2f' },
  { value: '~=', label: '~= (contains)', color: '#388e3c' },
  { value: '^=', label: '^= (starts with)', color: '#f57c00' },
  { value: '$=', label: '$= (ends with)', color: '#7b1fa2' },
];

export const ConditionBlock: React.FC<ConditionBlockProps> = ({
  condition,
  onChange,
  onDelete,
  columnValues,
  showDragHandle = false,
}) => {
  // Get unique values for selected column
  const valueOptions = useMemo(() => {
    if (!condition.column) return [];
    const values = columnValues.get(condition.column);
    return values ? Array.from(values).sort() : [];
  }, [condition.column, columnValues]);

  const handleColumnChange = (_event: React.SyntheticEvent, value: string | null) => {
    onChange({
      ...condition,
      column: (value || '') as Condition['column'],
      value: '', // Reset value when column changes
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
    <Paper
      elevation={1}
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {showDragHandle && (
        <DragIndicatorIcon
          sx={{
            cursor: 'grab',
            color: 'text.secondary',
            fontSize: 20,
          }}
        />
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
        disableClearable
      />

      {/* Operator Selector */}
      <Autocomplete
        size="small"
        options={OPERATORS.map(op => op.value)}
        value={condition.operator}
        onChange={handleOperatorChange}
        getOptionLabel={(option) => {
          const op = OPERATORS.find(o => o.value === option);
          return op?.label || option;
        }}
        renderOption={(props, option) => {
          const op = OPERATORS.find(o => o.value === option);
          return (
            <li {...props}>
              <Chip
                label={op?.label || option}
                size="small"
                sx={{
                  backgroundColor: op?.color || '#666',
                  color: 'white',
                  fontSize: 11,
                }}
              />
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
                <Chip
                  label={selectedOperator.value}
                  size="small"
                  sx={{
                    backgroundColor: selectedOperator.color,
                    color: 'white',
                    fontSize: 11,
                    height: 20,
                    ml: 0.5,
                  }}
                />
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
    </Paper>
  );
};
