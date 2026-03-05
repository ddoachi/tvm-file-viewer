import React from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { SelectChangeEvent } from '@mui/material';
import type { AgGridReact } from 'ag-grid-react';
import type { CsvRow, FilterOperator } from '../types';
import { useGroupFilter } from '../hooks/useGroupFilter';
import { useAppStore } from '../store/appStore';

interface FilterPanelProps {
  gridRef: React.RefObject<AgGridReact<CsvRow>>;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ gridRef }) => {
  const { searchText, setSearchText } = useAppStore();
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
          placeholder="Search across all columns..."
          value={searchText}
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

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Column selector */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="filter-column-label">Column</InputLabel>
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
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="filter-operator-label">Operator</InputLabel>
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
            onClick={applyFilter}
          >
            Apply Filter
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={clearFilter}
            disabled={activeConditions.length === 0}
          >
            Clear Filter
          </Button>
        </Box>
      </Box>

      {/* Active filter status */}
      {activeConditions.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`${matchedGroupCount} group${matchedGroupCount !== 1 ? 's' : ''} matched`}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}
    </Paper>
  );
};
