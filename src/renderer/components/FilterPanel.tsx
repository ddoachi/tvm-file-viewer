import React, { useMemo, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { CsvRow, FilterCondition } from '../types';
import { useAppStore } from '../store/appStore';
import { parseFilterExpression } from '../services/expressionParser';
import { applyGroupFilter } from '../services/groupFilter';
import { FilterBuilder } from './FilterBuilder';
import { parseFormula } from '../services/formulaParser';

interface FilterPanelProps {
  disabled?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ disabled }) => {
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

          const result = applyGroupFilter(rows, conditions, parseResult.evaluate);
          setFilterResult(result);
        } else {
          const parsed = parseFilterExpression(expression);
          if (!parsed) { setFiltering(false); return; }

          const result = applyGroupFilter(rows, parsed.conditions, undefined, parsed.operator);
          setFilterResult(result);
        }
      } finally {
        setFiltering(false);
      }
    }, 50);
  }, [rows, setFilterResult, setFiltering]);

  const handleVisualClear = () => {
    setFilterResult(null);
  };

  return (
    <Box sx={{ flexShrink: 0, opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto', maxWidth: 1000, mx: 'auto', width: '100%' }}>
      {/* Global search */}
      <Box sx={{ mb: 1 }}>
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

      {/* Collapsible Filter Panel */}
      <Accordion
        defaultExpanded
        disableGutters
        sx={{
          mb: 1,
          '&:before': { display: 'none' },
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px !important',
          '& .MuiAccordionSummary-root': {
            minHeight: 36,
            '&.Mui-expanded': { minHeight: 36 },
          },
          '& .MuiAccordionSummary-content': {
            my: 0.5,
            '&.Mui-expanded': { my: 0.5 },
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
          sx={{
            '&:hover': { bgcolor: 'action.hover' },
            transition: 'background-color 0.15s',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <FilterListIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="subtitle2" sx={{ fontSize: 12, fontWeight: 600 }}>
              Filter
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
          <FilterBuilder
            rows={rows}
            onApply={handleVisualApply}
            onClear={handleVisualClear}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
