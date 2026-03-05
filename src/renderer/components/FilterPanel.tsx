import React, { useState } from 'react';
import {
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Typography,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import type { SelectChangeEvent } from '@mui/material';
import type { AgGridReact } from 'ag-grid-react';
import type { CsvRow, FilterOperator } from '../types';
import { useGroupFilter } from '../hooks/useGroupFilter';
import { useAppStore } from '../store/appStore';
import { parseFilterExpression } from '../services/expressionParser';
import { applyGroupFilter } from '../services/groupFilter';
import { FilterBuilder } from './FilterBuilder';

interface FilterPanelProps {
  gridRef: React.RefObject<AgGridReact<CsvRow>>;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ gridRef }) => {
  const { searchText, setSearchText, rows, setFilterResult } = useAppStore();
  const {
    column,
    setColumn,
    operator,
    setOperator,
    value,
    setValue,
    applyFilter,
    clearFilter,
    activeConditions,
    matchedGroupCount,
  } = useGroupFilter(gridRef);

  // Expression filter mode
  const [filterMode, setFilterMode] = useState<'simple' | 'expression' | 'visual'>('simple');
  const [expressionText, setExpressionText] = useState('');
  const [expressionError, setExpressionError] = useState<string | null>(null);

  const handleColumnChange = (event: SelectChangeEvent) => {
    setColumn(event.target.value as keyof Omit<CsvRow, '_treePath' | '_rowIndex'>);
  };

  const handleOperatorChange = (event: SelectChangeEvent) => {
    setOperator(event.target.value as FilterOperator);
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleExpressionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExpressionText(event.target.value);
    setExpressionError(null);
  };

  const handleApplyExpression = () => {
    const parsed = parseFilterExpression(expressionText);
    if (!parsed) {
      setExpressionError('Invalid expression. Use: Vnet1==VDD && Vnet2==VEXT');
      return;
    }

    // Apply group filter with parsed conditions
    const result = applyGroupFilter(rows, parsed.conditions);
    setFilterResult(result);
    gridRef.current?.api.onFilterChanged();
    setExpressionError(null);
  };

  const handleClearExpression = () => {
    setExpressionText('');
    setExpressionError(null);
    setFilterResult(null);
    gridRef.current?.api.onFilterChanged();
  };

  const handleModeChange = (_event: React.SyntheticEvent, newMode: 'simple' | 'expression' | 'visual') => {
    setFilterMode(newMode);
    // Clear filters when switching modes
    if (newMode === 'simple') {
      handleClearExpression();
    } else if (newMode === 'expression' || newMode === 'visual') {
      clearFilter();
    }
  };

  const handleVisualApply = (expression: string) => {
    setExpressionText(expression);
    const parsed = parseFilterExpression(expression);
    if (!parsed) {
      setExpressionError('Invalid expression generated from visual builder');
      return;
    }

    // Apply group filter with parsed conditions
    const result = applyGroupFilter(rows, parsed.conditions);
    setFilterResult(result);
    gridRef.current?.api.onFilterChanged();
    setExpressionError(null);
  };

  const handleVisualClear = () => {
    setExpressionText('');
    setExpressionError(null);
    setFilterResult(null);
    gridRef.current?.api.onFilterChanged();
  };

  const isValueDisabled = operator === 'isEmpty' || operator === 'isNotEmpty';

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filter
      </Typography>

      {/* Global search input */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search across all columns..."
          value={searchText}
          inputProps={{ style: { fontSize: '12px' } }}
          InputLabelProps={{ style: { fontSize: '12px' } }}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Filter mode tabs */}
      <Tabs value={filterMode} onChange={handleModeChange} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', minHeight: 32 }}>
        <Tab label="Simple" value="simple" sx={{ minHeight: 32, py: 0.5 }} />
        <Tab label="Expression" value="expression" icon={<CodeIcon fontSize="small" />} iconPosition="start" sx={{ minHeight: 32, py: 0.5 }} />
        <Tab label="Visual Builder" value="visual" icon={<ViewModuleIcon fontSize="small" />} iconPosition="start" sx={{ minHeight: 32, py: 0.5 }} />
      </Tabs>

      {/* Visual Builder mode */}
      {filterMode === 'visual' && (
        <Box sx={{ mb: 2 }}>
          <FilterBuilder
            rows={rows}
            onApply={handleVisualApply}
            onClear={handleVisualClear}
          />
        </Box>
      )}

      {/* Expression filter mode */}
      {filterMode === 'expression' && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g., Vnet1==VDD && Vnet2==VEXT"
            value={expressionText}
            onChange={handleExpressionChange}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyExpression()}
            error={!!expressionError}
            helperText={expressionError || "Operators: == (equals), != (not equals), ~= (contains), ^= (starts with), $= (ends with). Combine with && (AND) or || (OR)"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CodeIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleApplyExpression}
              disabled={!expressionText.trim()}
              sx={{ height: 28 }}
            >
              Apply Expression
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={handleClearExpression}
              sx={{ height: 28 }}
            >
              Clear
            </Button>
          </Box>
        </Box>
      )}

      {/* Simple filter mode */}
      {filterMode === 'simple' && (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Column selector */}
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="filter-column-label" sx={{ fontSize: '12px' }}>Column</InputLabel>
          <Select
            labelId="filter-column-label"
            id="filter-column"
            value={column}
            label="Column"
            onChange={handleColumnChange}
          >
            <MenuItem value="Net">Net</MenuItem>
            <MenuItem value="Group">Group</MenuItem>
            <MenuItem value="Vnet1">Vnet1</MenuItem>
            <MenuItem value="Vnet2">Vnet2</MenuItem>
          </Select>
        </FormControl>

        {/* Operator selector */}
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="filter-operator-label" sx={{ fontSize: '12px' }}>Operator</InputLabel>
          <Select
            labelId="filter-operator-label"
            id="filter-operator"
            value={operator}
            label="Operator"
            onChange={handleOperatorChange}
          >
            <MenuItem value="equals">Equals</MenuItem>
            <MenuItem value="notEquals">Not Equals</MenuItem>
            <MenuItem value="contains">Contains</MenuItem>
            <MenuItem value="notContains">Not Contains</MenuItem>
            <MenuItem value="startsWith">Starts With</MenuItem>
            <MenuItem value="endsWith">Ends With</MenuItem>
            <MenuItem value="isEmpty">Is Empty</MenuItem>
            <MenuItem value="isNotEmpty">Is Not Empty</MenuItem>
          </Select>
        </FormControl>

        {/* Value input */}
        <TextField
          id="filter-value"
          label="Value"
          variant="outlined"
          size="small"
          value={value}
          onChange={handleValueChange}
          disabled={isValueDisabled}
          sx={{ minWidth: 200 }}
        />

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={applyFilter}
          >
            Apply Filter
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={clearFilter}
            disabled={activeConditions.length === 0}
          >
            Clear Filter
          </Button>
        </Box>
      </Box>
      )}

      {/* Active filter status - only show in simple mode */}
      {filterMode === 'simple' && activeConditions.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`${matchedGroupCount} group${matchedGroupCount !== 1 ? 's' : ''} matched`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
      )}
    </Paper>
  );
};
