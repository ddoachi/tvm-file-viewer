import React, { useMemo, useCallback } from 'react';
import {
  Paper,
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import type { AgGridReact } from 'ag-grid-react';
import type { CsvRow, FilterCondition } from '../types';
import { useAppStore } from '../store/appStore';
import { parseFilterExpression } from '../services/expressionParser';
import { applyGroupFilter } from '../services/groupFilter';
import { FilterBuilder } from './FilterBuilder';
import { parseFormula } from '../services/formulaParser';

interface FilterPanelProps {
  gridRef: React.RefObject<AgGridReact<CsvRow> | null>;
  disabled?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ gridRef, disabled }) => {
  const { searchText, setSearchText, openFiles, activeFileId, setFilterResult, setFiltering } = useAppStore();

  const rows = useMemo(() => {
    const activeFile = openFiles.find(f => f.id === activeFileId);
    return activeFile?.rows || [];
  }, [openFiles, activeFileId]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  const handleVisualApply = useCallback((expression: string) => {
    setFiltering(true);

    // Use setTimeout to let the UI update with the loading spinner before the heavy computation
    setTimeout(() => {
      try {
        if (expression.startsWith('FORMULA:')) {
          const parts = expression.substring(8).split(':');
          if (parts.length !== 2) { setFiltering(false); return; }

          const formula = parts[0];
          const conditionStrings = parts[1].split('|||');

          const conditions = conditionStrings
            .map(condStr => {
              const parsed = parseFilterExpression(condStr);
              return parsed?.conditions[0];
            })
            .filter((c): c is FilterCondition => c !== undefined);

          if (conditions.length === 0) { setFiltering(false); return; }

          const variables = new Set(
            conditions.map((_, index) => String.fromCharCode(65 + index))
          );
          const parseResult = parseFormula(formula, variables);

          if (!parseResult.isValid || !parseResult.evaluate) { setFiltering(false); return; }

          const filteredIndices = new Set<number>();
          const matchedGroups = new Set<string>();

          for (const row of rows) {
            const varMap = new Map<string, boolean>();
            conditions.forEach((cond, index) => {
              const varName = String.fromCharCode(65 + index);
              const fieldValue = row[cond.field]?.toString().toLowerCase() || '';
              const targetValue = cond.value.toLowerCase();

              let matches = false;
              switch (cond.operator) {
                case 'equals': matches = fieldValue === targetValue; break;
                case 'notEquals': matches = fieldValue !== targetValue; break;
                case 'contains': matches = fieldValue.includes(targetValue); break;
                case 'startsWith': matches = fieldValue.startsWith(targetValue); break;
                case 'endsWith': matches = fieldValue.endsWith(targetValue); break;
                default: matches = false;
              }
              varMap.set(varName, matches);
            });

            if (parseResult.evaluate!(varMap)) {
              filteredIndices.add(row._rowIndex);
              matchedGroups.add(row.Group);
            }
          }

          const visibleRowIndices = new Set<number>();
          for (const row of rows) {
            if (matchedGroups.has(row.Group)) {
              visibleRowIndices.add(row._rowIndex);
            }
          }

          setFilterResult({ directMatches: filteredIndices, matchedGroups, visibleRowIndices });
          gridRef.current?.api?.onFilterChanged();
        } else {
          const parsed = parseFilterExpression(expression);
          if (!parsed) { setFiltering(false); return; }

          const result = applyGroupFilter(rows, parsed.conditions);
          setFilterResult(result);
          gridRef.current?.api?.onFilterChanged();
        }
      } finally {
        setFiltering(false);
      }
    }, 50);
  }, [rows, setFilterResult, setFiltering, gridRef]);

  const handleVisualClear = () => {
    setFilterResult(null);
    gridRef.current?.api?.onFilterChanged();
  };

  return (
    <Paper sx={{ p: 2, mb: 2, opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      {/* Global search at top */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search across all columns..."
          value={searchText}
          inputProps={{ style: { fontSize: '12px' } }}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchText ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch} edge="end" sx={{ p: 0.25 }}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      {/* Filter title */}
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Filter
      </Typography>

      {/* Visual Builder directly - no tabs */}
      <FilterBuilder
        rows={rows}
        onApply={handleVisualApply}
        onClear={handleVisualClear}
      />
    </Paper>
  );
};
