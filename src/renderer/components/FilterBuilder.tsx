import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  TextField,
  Alert,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { ConditionBlock, type Condition } from './ConditionBlock';
import type { CsvRow } from '../types/index';
import { parseFormula, indexToVariable } from '../services/formulaParser';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

interface FilterBuilderProps {
  rows: CsvRow[];
  onApply: (expression: string) => void;
  onClear: () => void;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  rows,
  onApply,
  onClear,
}) => {
  const [conditions, setConditions] = useState<Condition[]>([
    { id: generateId(), column: '', operator: '==', value: '' },
  ]);
  const [connectors, setConnectors] = useState<Array<'AND' | 'OR'>>([]);
  const [formula, setFormula] = useState<string>('');
  const [formulaError, setFormulaError] = useState<string>('');

  // Extract unique values for each column (sample for large datasets)
  const columnValues = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const columns: Array<keyof Omit<CsvRow, 'id' | 'parentId' | '_rowIndex'>> = ['Net', 'Group', 'Vnet1', 'Vnet2'];

    columns.forEach(col => map.set(col, new Set()));

    if (!rows || rows.length === 0) return map;

    const sampleSize = Math.min(rows.length, 10000);
    const step = Math.max(1, Math.floor(rows.length / sampleSize));

    for (let i = 0; i < rows.length; i += step) {
      const row = rows[i];
      columns.forEach(col => {
        const value = row[col];
        if (value !== null && value !== undefined && value !== '') {
          map.get(col)?.add(String(value));
        }
      });
    }

    return map;
  }, [rows]);

  const handleAddCondition = useCallback(() => {
    setConditions(prev => [
      ...prev,
      { id: generateId(), column: '', operator: '==', value: '' },
    ]);
    setConnectors(prev => [...prev, 'AND']);
  }, []);

  const handleConditionChange = useCallback((index: number, condition: Condition) => {
    setConditions(prev => {
      const newConditions = [...prev];
      newConditions[index] = condition;
      return newConditions;
    });
  }, []);

  const handleDeleteCondition = useCallback((index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
    setConnectors(prev => {
      if (index > 0) {
        return prev.filter((_, i) => i !== index - 1);
      }
      return prev.filter((_, i) => i !== 0);
    });
  }, []);

  const handleApply = useCallback(() => {
    const validConditions = conditions.filter(
      c => c.column && c.operator && c.value
    );

    if (validConditions.length === 0) return;

    if (formula.trim()) {
      const variables = new Set(
        validConditions.map((_, index) => indexToVariable(index))
      );
      const parseResult = parseFormula(formula, variables);

      if (!parseResult.isValid) {
        setFormulaError(parseResult.error || 'Invalid formula');
        return;
      }

      setFormulaError('');

      const expressionParts = validConditions.map((c) => {
        return `${c.column}${c.operator}${c.value}`;
      });

      onApply(`FORMULA:${formula}:${expressionParts.join('|||')}`);
    } else {
      const expressionParts = validConditions.map((c, index) => {
        const condStr = `${c.column}${c.operator}${c.value}`;
        if (index === 0) return condStr;
        const connector = connectors[index - 1] === 'OR' ? ' || ' : ' && ';
        return `${connector}${condStr}`;
      });

      const expression = expressionParts.join('');
      onApply(expression);
    }
  }, [conditions, connectors, formula, onApply]);

  const handleClear = useCallback(() => {
    setConditions([{ id: generateId(), column: '', operator: '==', value: '' }]);
    setConnectors([]);
    setFormula('');
    setFormulaError('');
    onClear();
  }, [onClear]);

  const hasValidCondition = conditions.some(c => c.column && c.value);
  const isValid = hasValidCondition && formula.trim() !== '';

  return (
    <Box>
      {/* Condition Blocks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {conditions.map((condition, index) => (
          <ConditionBlock
            key={condition.id}
            condition={condition}
            onChange={(c) => handleConditionChange(index, c)}
            onDelete={() => handleDeleteCondition(index)}
            columnValues={columnValues}
            showDragHandle={false}
            variable={indexToVariable(index)}
          />
        ))}
      </Box>

      {/* Add Condition button */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Tooltip title="Add Condition">
          <IconButton
            onClick={handleAddCondition}
            color="primary"
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              px: 3,
              py: 0.75,
              fontSize: 13,
              gap: 0.5,
            }}
          >
            <AddIcon />
            <span style={{ fontSize: 12, fontWeight: 500 }}>Add</span>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Boolean Formula + Action buttons on same row */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          size="small"
          label="Boolean Formula"
          placeholder="e.g., A || (B && C)"
          value={formula}
          onChange={(e) => { setFormula(e.target.value); setFormulaError(''); }}
          error={!!formulaError}
          helperText={
            formulaError ||
            "Use A, B, C... for conditions. Operators: && (AND), || (OR), ! (NOT)"
          }
          sx={{
            flex: 1,
            '& .MuiInputBase-input': { fontSize: 12, fontFamily: 'monospace' },
            '& .MuiInputBase-input::placeholder': { fontSize: '11px', opacity: 0.6 },
            '& .MuiFormHelperText-root': { fontSize: 10 },
            '& .MuiInputLabel-root': { fontSize: 12 },
          }}
        />

        {/* Apply and Clear buttons next to formula */}
        <Tooltip title="Run Filter">
          <span>
            <IconButton
              size="small"
              onClick={handleApply}
              disabled={!isValid}
              sx={{
                mt: 0.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 1,
                p: 0.75,
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
              }}
            >
              <PlayArrowIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Clear Filter">
          <span>
            <IconButton
              size="small"
              onClick={handleClear}
              disabled={!isValid}
              sx={{ mt: 0.5, borderRadius: 1, p: 0.75 }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Formula Error Alert */}
      {formulaError && (
        <Alert severity="error" sx={{ mt: 1, fontSize: 12, py: 0 }}>
          {formulaError}
        </Alert>
      )}

      {/* Help note */}
      <Box sx={{
        mt: 1.5, p: 1, bgcolor: 'action.hover', borderRadius: 1,
        display: 'flex', gap: 1, alignItems: 'flex-start',
      }}>
        <InfoOutlinedIcon sx={{ fontSize: 14, mt: 0.25, color: 'text.secondary', flexShrink: 0 }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, lineHeight: 1.5 }}>
          Each condition (A, B, C...) filters rows by column value.
          Without a formula, conditions combine with AND.
          Use a boolean formula like{' '}
          <code style={{ fontSize: 10, background: 'rgba(0,0,0,0.06)', padding: '1px 3px', borderRadius: 2 }}>
            A || (B &amp;&amp; !C)
          </code>{' '}
          for custom logic. Matching rows expand their entire group.
        </Typography>
      </Box>
    </Box>
  );
};
