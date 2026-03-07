import { useState, useCallback, useMemo, RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { CsvRow, FilterCondition, FilterOperator } from '../types';
import { useAppStore } from '../store/appStore';
import { applyGroupFilter } from '../services/groupFilter';

export function useGroupFilter(gridRef: RefObject<AgGridReact<CsvRow> | null>) {
  const { openFiles, activeFileId, setFilterResult } = useAppStore();

  // Get rows from active file (fixes: 'rows' doesn't exist on AppState)
  const rows = useMemo(() => {
    const activeFile = openFiles.find(f => f.id === activeFileId);
    return activeFile?.rows || [];
  }, [openFiles, activeFileId]);

  const [column, setColumn] = useState<keyof Omit<CsvRow, 'id' | 'parentId' | '_rowIndex'>>('Net');
  const [operator, setOperator] = useState<FilterOperator>('contains');
  const [value, setValue] = useState('');
  const [activeConditions, setActiveConditions] = useState<FilterCondition[]>([]);

  const applyFilter = useCallback(() => {
    const condition: FilterCondition = { field: column, operator, value };
    const conditions = [condition];
    const result = applyGroupFilter(rows, conditions);
    setActiveConditions(conditions);
    setFilterResult(result);
    gridRef.current?.api?.onFilterChanged();
  }, [column, operator, value, rows, setFilterResult, gridRef]);

  const clearFilter = useCallback(() => {
    setColumn('Net');
    setOperator('contains');
    setValue('');
    setActiveConditions([]);
    setFilterResult(null);
    gridRef.current?.api?.onFilterChanged();
  }, [setFilterResult, gridRef]);

  const matchedGroupCount = useAppStore(state =>
    state.filterResult?.matchedGroups.size ?? 0
  );

  return {
    column, setColumn, operator, setOperator, value, setValue,
    applyFilter, clearFilter, activeConditions, matchedGroupCount,
  };
}
