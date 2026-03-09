import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, RowClickedEvent, GetDataPath, FilterChangedEvent, IRowNode, GetContextMenuItemsParams, MenuItemDef } from 'ag-grid-community';
import { Box, CircularProgress, Snackbar } from '@mui/material';
import { useAppStore, selectFilterResult } from '../store/appStore';
import type { CsvRow } from '../types';
import { FilterPanel } from './FilterPanel';

function formatRowForClipboard(row: CsvRow): string {
  return `${row.Net}\t${row.Group}\t${row.Vnet1}\t${row.Vnet2}`;
}

function formatRowsForClipboard(rows: CsvRow[]): string {
  const header = 'Net\tGroup\tVnet1\tVnet2';
  const lines = rows.map(formatRowForClipboard);
  return [header, ...lines].join('\n');
}

export const DataGrid: React.FC = () => {
  const { openFiles, activeFileId, searchText, themeMode, isLoading, isFiltering, setGridFilteredCount } = useAppStore();
  const filterResult = useAppStore(selectFilterResult);
  const gridRef = useRef<AgGridReact<CsvRow>>(null);
  const filterResultRef = useRef(filterResult);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Keep ref in sync for use in AG Grid callbacks (which capture closures)
  filterResultRef.current = filterResult;

  const activeFile = openFiles.find(f => f.id === activeFileId);
  const allRows = activeFile?.rows || [];

  const totalCount = allRows.length;
  const matchedCount = filterResult ? filterResult.directMatches.size : 0;

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Clipboard write failed:', err);
    }
  }, []);

  const columnDefs = useMemo<ColDef<CsvRow>[]>(() => [
    { field: 'Group', headerName: 'Group', flex: 1, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true },
    { field: 'Vnet1', headerName: 'Vnet1', flex: 1, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true },
    { field: 'Vnet2', headerName: 'Vnet2', flex: 1, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true },
  ], []);

  const autoGroupColumnDef = useMemo<ColDef>(() => ({
    headerName: 'Net',
    flex: 2,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    resizable: true,
    cellRendererParams: { suppressCount: true },
  }), []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true, resizable: true, flex: 1, filter: true, suppressHeaderMenuButton: false,
  }), []);

  const getDataPath = useCallback<GetDataPath<CsvRow>>((data) => data.Net.split('.'), []);

  // External filter: AG Grid calls these instead of rebuilding the tree
  const isExternalFilterPresent = useCallback(() => {
    return filterResultRef.current !== null;
  }, []);

  const doesExternalFilterPass = useCallback((node: IRowNode<CsvRow>) => {
    const fr = filterResultRef.current;
    if (!fr || !node.data) return true;
    return fr.visibleRowIndices.has(node.data._rowIndex);
  }, []);

  // Trigger AG Grid external filter re-evaluation when filterResult changes
  useEffect(() => {
    const api = gridRef.current?.api;
    if (api) {
      api.onFilterChanged();
    }
  }, [filterResult]);

  const handleRowClick = useCallback((event: RowClickedEvent<CsvRow>) => {
    if (event.data && window.electronAPI) {
      window.electronAPI.onRowClick(event.data);
    }
  }, []);

  const handleFilterChanged = useCallback((_event: FilterChangedEvent<CsvRow>) => {
    const api = gridRef.current?.api;
    if (!api) return;
    let count = 0;
    api.forEachNodeAfterFilter(() => { count++; });
    setGridFilteredCount(count < allRows.length ? count : null);
  }, [allRows.length, setGridFilteredCount]);

  // Context menu with copy options
  const getContextMenuItems = useCallback((params: GetContextMenuItemsParams<CsvRow>): (string | MenuItemDef)[] => {
    const items: (string | MenuItemDef)[] = [];

    const api = params.api;
    const selectedRows = api.getSelectedRows() as CsvRow[];

    if (selectedRows.length > 1) {
      // Multiple rows selected: show bulk copy
      items.push({
        name: `Copy ${selectedRows.length} Rows`,
        action: () => copyToClipboard(formatRowsForClipboard(selectedRows)),
        icon: '<span style="font-size:14px">&#128203;</span>',
      });
    } else if (params.node?.data) {
      // Single row: copy the right-clicked row
      const rowData = params.node.data;
      items.push({
        name: 'Copy Row',
        action: () => copyToClipboard(formatRowForClipboard(rowData)),
        icon: '<span style="font-size:14px">&#128203;</span>',
      });
    }

    if (items.length > 0) {
      items.push('separator');
    }

    // Default AG Grid items
    items.push('copy', 'copyWithHeaders', 'separator', 'export');

    return items;
  }, [copyToClipboard]);

  // Clear AG Grid column filters when switching tabs
  useEffect(() => {
    const api = gridRef.current?.api;
    if (api) {
      api.setFilterModel(null);
    }
  }, [activeFileId]);

  const isBusy = isLoading || isFiltering;
  const themeClass = themeMode === 'light'
    ? 'ag-theme-quartz ag-theme-tvm-light'
    : 'ag-theme-quartz-dark ag-theme-tvm-dark';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 0.5 }}>
      <FilterPanel disabled={isBusy} />

      <div
        className={themeClass}
        style={{ flex: '1 1 0', width: '100%', position: 'relative', overflow: 'hidden' }}
      >
        {isBusy && (
          <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.7)', zIndex: 10,
          }}>
            <CircularProgress />
          </Box>
        )}
        <AgGridReact<CsvRow>
          ref={gridRef}
          rowData={allRows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          treeData={true}
          getDataPath={getDataPath}
          autoGroupColumnDef={autoGroupColumnDef}
          groupDefaultExpanded={0}
          rowSelection="multiple"
          rowHeight={28}
          headerHeight={32}
          floatingFiltersHeight={28}
          animateRows={false}
          quickFilterText={searchText}
          onRowClicked={handleRowClick}
          onFilterChanged={handleFilterChanged}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          getContextMenuItems={getContextMenuItems}
          allowContextMenuWithControlKey={true}
          rowBuffer={20}
          suppressColumnVirtualisation={false}
          overlayNoRowsTemplate={
            '<div style="padding: 40px 20px; text-align: center; color: #6B7280;">' +
            '<p style="font-size: 13px; font-weight: 500; margin: 0; color: #1F2937;">No data loaded</p>' +
            '<p style="font-size: 12px; margin-top: 8px;">Click the import icon to load a CSV or JSON file</p>' +
            '</div>'
          }
        />
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1500}
        onClose={() => setSnackbarOpen(false)}
        message="Copied!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};
