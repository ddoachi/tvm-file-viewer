import { useState, useCallback, useMemo } from 'react';
import type { CsvRow, FilterCondition, FilterOperator } from '../types';
import { useAppStore } from '../store/appStore';
import { applyGroupFilter } from '../services/groupFilter';

export function useGroupFilter() {
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
  }, [column, operator, value, rows, setFilterResult]);

  const clearFilter = useCallback(() => {
    setColumn('Net');
    setOperator('contains');
    setValue('');
    setActiveConditions([]);
    setFilterResult(null);
  }, [setFilterResult]);

  const matchedGroupCount = useAppStore(state => {
    const id = state.activeFileId;
    const result = id ? state.filterResults[id] : null;
    return result?.matchedGroups.size ?? 0;
  });

  return {
    column, setColumn, operator, setOperator, value, setValue,
    applyFilter, clearFilter, activeConditions, matchedGroupCount,
  };
}
