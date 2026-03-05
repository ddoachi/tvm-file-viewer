import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  TextField,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ConditionBlock, type Condition } from './ConditionBlock';
import type { CsvRow } from '../types/index';
import { parseFormula, indexToVariable } from '../services/formulaParser';

// Simple UUID generator
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

  // Extract unique values for each column
  const columnValues = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const columns: Array<keyof Omit<CsvRow, 'id' | 'parentId' | '_rowIndex'>> = ['Net', 'Group', 'Vnet1', 'Vnet2'];

    columns.forEach(col => {
      map.set(col, new Set());
    });

    if (!rows || rows.length === 0) {
      console.log('FilterBuilder: No rows data');
      return map;
    }

    console.log(`FilterBuilder: Processing ${rows.length} rows`);

    rows.forEach(row => {
      columns.forEach(col => {
        const value = row[col];
        if (value !== null && value !== undefined && value !== '') {
          map.get(col)?.add(String(value));
        }
      });
    });

    console.log('FilterBuilder: columnValues populated:', Array.from(map.entries()).map(([k, v]) => `${k}=${v.size}`));

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
      // Remove the connector before this condition
      if (index > 0) {
        return prev.filter((_, i) => i !== index - 1);
      }
      // Or remove the connector after if it's the first condition
      return prev.filter((_, i) => i !== 0);
    });
  }, []);

  const handleConnectorChange = useCallback((index: number, value: 'AND' | 'OR') => {
    setConnectors(prev => {
      const newConnectors = [...prev];
      newConnectors[index] = value;
      return newConnectors;
    });
  }, []);

  const handleApply = useCallback(() => {
    // Convert visual conditions to expression
    const validConditions = conditions.filter(
      c => c.column && c.operator && c.value
    );

    if (validConditions.length === 0) {
      return;
    }

    // If formula is provided, validate it
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

      // Build expression with formula
      const expressionParts = validConditions.map((c) => {
        return `${c.column}${c.operator}${c.value}`;
      });

      // Pass formula to parent (parent will need to handle formula evaluation)
      onApply(`FORMULA:${formula}:${expressionParts.join('|||')}`);
    } else {
      // No formula - use simple AND/OR connectors
      const expressionParts = validConditions.map((c, index) => {
        const condStr = `${c.column}${c.operator}${c.value}`;
        if (index === 0) {
          return condStr;
        }
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

  const isValid = conditions.some(c => c.column && c.value);

  return (
    <Box>
      {/* Condition Blocks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {conditions.map((condition, index) => (
          <Box key={condition.id} sx={{ mb: 1 }}>
            <ConditionBlock
              condition={condition}
              onChange={(c) => handleConditionChange(index, c)}
              onDelete={() => handleDeleteCondition(index)}
              columnValues={columnValues}
              showDragHandle={false}
              variable={indexToVariable(index)}
            />
          </Box>
        ))}
      </Box>

      {/* AND/OR toggles removed - use formula input below instead */}

      {/* Boolean Formula */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Boolean Formula (Optional)"
          placeholder="e.g., A || (B && C)"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          error={!!formulaError}
          helperText={
            formulaError ||
            "Use A, B, C for conditions. Operators: && (AND), || (OR), ! (NOT), () for grouping"
          }
          sx={{
            '& .MuiInputBase-input': { fontSize: 12, fontFamily: 'monospace' },
            '& .MuiInputBase-input::placeholder': { fontSize: '11px', opacity: 0.6 },
            '& .MuiFormHelperText-root': { fontSize: 10 },
            '& .MuiInputLabel-root': { fontSize: 12 },
          }}
        />
      </Box>

      {/* Formula Error Alert */}
      {formulaError && (
        <Alert severity="error" sx={{ mb: 2, fontSize: 12 }}>
          {formulaError}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddCondition}
          sx={{ height: 28, fontSize: 12 }}
        >
          Add Condition
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleApply}
          disabled={!isValid}
          sx={{ height: 28, fontSize: 12 }}
        >
          Apply Filter
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          onClick={handleClear}
          sx={{ height: 28, fontSize: 12 }}
        >
          Clear
        </Button>
      </Box>

      {/* Helper text */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: 11 }}>
        Build filters visually. Use AND/OR connectors or enter a custom boolean formula above.
      </Typography>
    </Box>
  );
};
