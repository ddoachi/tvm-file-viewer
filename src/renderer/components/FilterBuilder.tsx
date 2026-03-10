import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';
import { ConditionBlock, type Condition } from './ConditionBlock';
import type { CsvRow } from '../types/index';
import { parseFormula, indexToVariable } from '../services/formulaParser';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Variable badge colors
const VARIABLE_COLORS = [
  '#2D7FF9', // A - blue
  '#10B981', // B - green
  '#F59E0B', // C - amber
  '#EF4444', // D - red
  '#8B5CF6', // E - purple
  '#EC4899', // F - pink
  '#06B6D4', // G - cyan
  '#84CC16', // H - lime
];

export function getVariableColor(index: number): string {
  return VARIABLE_COLORS[index % VARIABLE_COLORS.length];
}

// Colored formula overlay component
const FormulaOverlay: React.FC<{ formula: string; conditionCount: number }> = ({ formula, conditionCount }) => {
  const parts: React.ReactNode[] = [];
  for (let i = 0; i < formula.length; i++) {
    const ch = formula[i];
    const varIndex = ch.charCodeAt(0) - 65; // A=0, B=1, ...
    if (varIndex >= 0 && varIndex < conditionCount && ch >= 'A' && ch <= 'Z') {
      parts.push(
        <span key={i} style={{ color: getVariableColor(varIndex), fontWeight: 700 }}>{ch}</span>
      );
    } else {
      parts.push(<span key={i}>{ch}</span>);
    }
  }
  return <>{parts}</>;
};

// Common hover transition for buttons
const hoverTransition = {
  transition: 'all 0.15s ease-in-out',
  '&:hover': { transform: 'translateY(-1px)', boxShadow: 2 },
  '&:active': { transform: 'translateY(0)' },
};

// Consistent row height for alignment
const ROW_HEIGHT = 32;

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
  const formulaRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);

  // Responsive: watch window width < 900px
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 900px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsNarrow(e.matches);
    handler(mql);
    mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    return () => mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
  }, []);

  // Sync overlay scroll with input scroll
  useEffect(() => {
    const input = formulaRef.current;
    const overlay = overlayRef.current;
    if (!input || !overlay) return;
    const handleScroll = () => {
      overlay.scrollLeft = input.scrollLeft;
    };
    input.addEventListener('scroll', handleScroll);
    return () => input.removeEventListener('scroll', handleScroll);
  }, []);

  const columnValues = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const columns: Array<keyof Omit<CsvRow, '_rowIndex'>> = [
      'tree', 'hier_LV', 'parent_master', 'master', 'multiple', 'xprobe',
      'assigned', 'vnets', 'D/S/B', 'DNW', 'G', 'switch_type',
      'psw_detected', 'psw_used', 'tg', 'cmos_drv', 'vnets_group', 'is_short',
    ];
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
    setConditions(prev => [...prev, { id: generateId(), column: '', operator: '==', value: '' }]);
    setConnectors(prev => [...prev, 'AND']);
  }, []);

  const handleConditionChange = useCallback((index: number, condition: Condition) => {
    setConditions(prev => {
      const next = [...prev];
      next[index] = condition;
      return next;
    });
  }, []);

  const handleDeleteCondition = useCallback((index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
    setConnectors(prev => {
      if (index > 0) return prev.filter((_, i) => i !== index - 1);
      return prev.filter((_, i) => i !== 0);
    });
  }, []);

  const handleApply = useCallback(() => {
    const validConditions = conditions.filter(c => c.column && c.operator && c.value);
    if (validConditions.length === 0) return;

    if (formula.trim()) {
      const variables = new Set(validConditions.map((_, index) => indexToVariable(index)));
      const parseResult = parseFormula(formula, variables);
      if (!parseResult.isValid) {
        setFormulaError(parseResult.error || 'Invalid formula');
        return;
      }
      setFormulaError('');
      const expressionParts = validConditions.map((c) => `${c.column}${c.operator}${c.value}`);
      onApply(`FORMULA:${formula}:${expressionParts.join('|||')}`);
    } else {
      const expressionParts = validConditions.map((c, index) => {
        const condStr = `${c.column}${c.operator}${c.value}`;
        if (index === 0) return condStr;
        const connector = connectors[index - 1] === 'OR' ? ' || ' : ' && ';
        return `${connector}${condStr}`;
      });
      onApply(expressionParts.join(''));
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
  const isValid = hasValidCondition;

  // Label style shared between both columns
  const labelSx = { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, height: 16, lineHeight: '16px', mb: '4px', display: 'block' };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isNarrow ? 'column' : 'row',
        gap: 2,
        alignItems: isNarrow ? 'stretch' : 'flex-start',
      }}
    >
      {/* LEFT: Conditions builder */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={labelSx}>
          Condition
        </Typography>

        {/* Condition rows */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          p: 0.5,
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}>
          {conditions.map((condition, index) => (
            <ConditionBlock
              key={condition.id}
              condition={condition}
              onChange={(c) => handleConditionChange(index, c)}
              onDelete={() => handleDeleteCondition(index)}
              columnValues={columnValues}
              variable={indexToVariable(index)}
              variableColor={getVariableColor(index)}
            />
          ))}
        </Box>

        {/* Add button */}
        <Button
          variant="outlined"
          onClick={handleAddCondition}
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          sx={{
            mt: 0.5,
            width: '100%',
            height: ROW_HEIGHT,
            borderStyle: 'dashed',
            borderColor: 'divider',
            borderRadius: 1,
            fontSize: 11,
            color: 'text.secondary',
            textTransform: 'none',
            justifyContent: 'center',
            ...hoverTransition,
          }}
        >
          Add Condition
        </Button>
      </Box>

      {/* RIGHT: Formula + actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', width: isNarrow ? '100%' : 300, flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={labelSx}>
          Formula
        </Typography>

        {/* Formula content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 0.5, borderRadius: 1 }}>
          {/* Formula input with colored overlay */}
          <Box sx={{ position: 'relative', height: ROW_HEIGHT }}>
            <TextField
              fullWidth
              size="small"
              placeholder="A && B"
              value={formula}
              onChange={(e) => { setFormula(e.target.value); setFormulaError(''); }}
              error={!!formulaError}
              inputRef={formulaRef}
              sx={{
                '& .MuiInputBase-root': { height: ROW_HEIGHT },
                '& .MuiInputBase-input': {
                  fontSize: 13,
                  fontFamily: 'monospace',
                  fontWeight: 500,
                  color: 'transparent',
                  caretColor: 'text.primary',
                  py: '4px !important',
                },
                '& .MuiInputBase-input::placeholder': { fontSize: 12, opacity: 0.5 },
              }}
            />
            {/* Colored overlay */}
            <Box
              ref={overlayRef}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                height: ROW_HEIGHT,
                px: '14px',
                fontSize: 13,
                fontFamily: 'monospace',
                fontWeight: 500,
                overflow: 'hidden',
                whiteSpace: 'pre',
              }}
            >
              <FormulaOverlay formula={formula} conditionCount={conditions.length} />
            </Box>
          </Box>

          {/* Help text */}
          <Box sx={{ borderRadius: 0.5, px: 1, height: ROW_HEIGHT, display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary', fontFamily: 'monospace' }}>
              e.g. <strong>A && B</strong> &nbsp; <span style={{ opacity: 0.7 }}>A || (B && !C)</span>
            </Typography>
          </Box>
        </Box>

        {/* Action buttons — aligned with Add Condition */}
        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleApply}
            disabled={!isValid}
            fullWidth
            startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 1,
              height: ROW_HEIGHT,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'none',
              ...hoverTransition,
            }}
          >
            Run
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={handleClear}
            fullWidth
            startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
            sx={{
              borderRadius: 1,
              height: ROW_HEIGHT,
              fontSize: 11,
              textTransform: 'none',
              ...hoverTransition,
            }}
          >
            Clear
          </Button>
        </Box>

        {formulaError && (
          <Alert severity="error" sx={{ fontSize: 11, py: 0, px: 1, mt: 0.5 }}>
            {formulaError}
          </Alert>
        )}
      </Box>
    </Box>
  );
};
