import { useState, useCallback, RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { CsvRow, FilterCondition, FilterOperator } from '../types';
import { useAppStore } from '../store/appStore';
import { applyGroupFilter } from '../services/groupFilter';

export function useGroupFilter(gridRef: RefObject<AgGridReact<CsvRow>>) {
  const { rows, setFilterResult } = useAppStore();

  // Filter state
  const [column, setColumn] = useState<keyof Omit<CsvRow, '_treePath' | '_rowIndex'>>('Net');
  const [operator, setOperator] = useState<FilterOperator>('contains');
  const [value, setValue] = useState('');

  // Active conditions (currently only one condition supported)
  const [activeConditions, setActiveConditions] = useState<FilterCondition[]>([]);

  // Apply filter
  const applyFilter = useCallback(() => {
    const condition: FilterCondition = {
      field: column,
      operator,
      value,
    };

    const conditions = [condition];
    const result = applyGroupFilter(rows, conditions);

    setActiveConditions(conditions);
    setFilterResult(result);

    // Notify AG Grid to re-apply external filter
    if (gridRef.current?.api) {
      gridRef.current.api.onFilterChanged();
    }
  }, [column, operator, value, rows, setFilterResult, gridRef]);

  // Clear filter
  const clearFilter = useCallback(() => {
    setColumn('Net');
    setOperator('contains');
    setValue('');
    setActiveConditions([]);
    setFilterResult(null);

    // Notify AG Grid to remove external filter
    if (gridRef.current?.api) {
      gridRef.current.api.onFilterChanged();
    }
  }, [setFilterResult, gridRef]);

  // Get matched group count
  const matchedGroupCount = useAppStore(state =>
    state.filterResult?.matchedGroups.size ?? 0
  );

  return {
    // Filter state
    column,
    setColumn,
    operator,
    setOperator,
    value,
    setValue,

    // Actions
    applyFilter,
    clearFilter,

    // Status
    activeConditions,
    matchedGroupCount,
  };
}
