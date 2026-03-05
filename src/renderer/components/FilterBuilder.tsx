import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ConditionBlock, type Condition } from './ConditionBlock';
import type { CsvRow } from '../types/index';

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
    { id: uuidv4(), column: '', operator: '==', value: '' },
  ]);
  const [connectors, setConnectors] = useState<Array<'AND' | 'OR'>>([]);

  // Extract unique values for each column
  const columnValues = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const columns: Array<keyof Omit<CsvRow, 'id' | 'parentId' | '_rowIndex'>> = ['Net', 'Group', 'Vnet1', 'Vnet2'];

    columns.forEach(col => {
      map.set(col, new Set());
    });

    rows.forEach(row => {
      columns.forEach(col => {
        const value = row[col];
        if (value !== null && value !== undefined && value !== '') {
          map.get(col)?.add(String(value));
        }
      });
    });

    return map;
  }, [rows]);

  const handleAddCondition = useCallback(() => {
    setConditions(prev => [
      ...prev,
      { id: uuidv4(), column: '', operator: '==', value: '' },
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
  }, [conditions, connectors, onApply]);

  const handleClear = useCallback(() => {
    setConditions([{ id: uuidv4(), column: '', operator: '==', value: '' }]);
    setConnectors([]);
    onClear();
  }, [onClear]);

  const isValid = conditions.some(c => c.column && c.value);

  return (
    <Box>
      {/* Condition Blocks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {conditions.map((condition, index) => (
          <Box key={condition.id}>
            <ConditionBlock
              condition={condition}
              onChange={(c) => handleConditionChange(index, c)}
              onDelete={() => handleDeleteCondition(index)}
              columnValues={columnValues}
              showDragHandle={false}
            />

            {/* Connector (AND/OR) between blocks */}
            {index < conditions.length - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                <ToggleButtonGroup
                  value={connectors[index] || 'AND'}
                  exclusive
                  onChange={(_e, value) => {
                    if (value !== null) {
                      handleConnectorChange(index, value);
                    }
                  }}
                  size="small"
                  sx={{ height: 24 }}
                >
                  <ToggleButton
                    value="AND"
                    sx={{
                      fontSize: 11,
                      px: 1.5,
                      py: 0.25,
                      fontWeight: 600,
                      backgroundColor: connectors[index] === 'AND' ? '#1976d2' : undefined,
                      color: connectors[index] === 'AND' ? 'white' : undefined,
                      '&.Mui-selected': {
                        backgroundColor: '#1976d2',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#1565c0',
                        },
                      },
                    }}
                  >
                    AND
                  </ToggleButton>
                  <ToggleButton
                    value="OR"
                    sx={{
                      fontSize: 11,
                      px: 1.5,
                      py: 0.25,
                      fontWeight: 600,
                      backgroundColor: connectors[index] === 'OR' ? '#388e3c' : undefined,
                      color: connectors[index] === 'OR' ? 'white' : undefined,
                      '&.Mui-selected': {
                        backgroundColor: '#388e3c',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#2e7d32',
                        },
                      },
                    }}
                  >
                    OR
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}
          </Box>
        ))}
      </Box>

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
        Build filters visually. Use AND to match all conditions, OR to match any condition.
      </Typography>
    </Box>
  );
};
