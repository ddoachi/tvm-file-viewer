import React, { useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, IRowNode, RowClickedEvent, GetDataPath } from 'ag-grid-community';
import 'ag-grid-enterprise';
import { Box, CircularProgress, Chip } from '@mui/material';
import { useAppStore } from '../store/appStore';
import type { CsvRow } from '../types';
import { FilterPanel } from './FilterPanel';

export const DataGrid: React.FC = () => {
  const { openFiles, activeFileId, filterResult, searchText, themeMode, isLoading, isFiltering } = useAppStore();
  const gridRef = useRef<AgGridReact<CsvRow>>(null);

  const activeFile = openFiles.find(f => f.id === activeFileId);
  const rows = activeFile?.rows || [];

  const totalCount = rows.length;
  const matchedCount = filterResult ? filterResult.directMatches.size : 0;

  // Column definitions (Net is handled by autoGroupColumnDef for tree)
  const columnDefs = useMemo<ColDef<CsvRow>[]>(() => [
    {
      field: 'Group',
      headerName: 'Group',
      flex: 1,
      sortable: true,
      resizable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    },
    {
      field: 'Vnet1',
      headerName: 'Vnet1',
      flex: 1,
      sortable: true,
      resizable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    },
    {
      field: 'Vnet2',
      headerName: 'Vnet2',
      flex: 1,
      sortable: true,
      resizable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    },
  ], []);

  // Auto group column for tree display
  const autoGroupColumnDef = useMemo<ColDef>(() => ({
    headerName: 'Net',
    flex: 2,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    resizable: true,
    cellRendererParams: {
      suppressCount: true,
    },
  }), []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    flex: 1,
    filter: true,
    suppressHeaderMenuButton: false,
  }), []);

  // Tree data path from dot-separated Net names
  const getDataPath = useCallback<GetDataPath<CsvRow>>((data) => {
    return data.Net.split('.');
  }, []);

  // External filter callbacks
  const isExternalFilterPresent = useCallback(() => {
    return filterResult !== null;
  }, [filterResult]);

  const doesExternalFilterPass = useCallback(
    (node: IRowNode<CsvRow>) => {
      if (!filterResult || !node.data) return true;
      return filterResult.visibleRowIndices.has(node.data._rowIndex);
    },
    [filterResult]
  );

  // Row click handler for crossprobing
  const handleRowClick = useCallback((event: RowClickedEvent<CsvRow>) => {
    if (event.data && window.electronAPI) {
      window.electronAPI.onRowClick(event.data);
    }
  }, []);

  const isBusy = isLoading || isFiltering;
  const themeClass = themeMode === 'light'
    ? 'ag-theme-quartz ag-theme-tvm-light'
    : 'ag-theme-quartz-dark ag-theme-tvm-dark';

  return (
    <>
      <FilterPanel gridRef={gridRef} disabled={isBusy} />

      {/* Count chips */}
      {totalCount > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Chip label={`Total: ${totalCount.toLocaleString()}`} size="small" variant="outlined" />
          {filterResult && (
            <Chip
              label={`Matched: ${matchedCount.toLocaleString()}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}

      <div
        className={themeClass}
        style={{ height: '100%', width: '100%', position: 'relative' }}
      >
        {isBusy && (
          <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.7)',
            zIndex: 10,
          }}>
            <CircularProgress />
          </Box>
        )}
        <AgGridReact<CsvRow>
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          treeData={true}
          getDataPath={getDataPath}
          autoGroupColumnDef={autoGroupColumnDef}
          groupDefaultExpanded={0}
          rowHeight={28}
          headerHeight={32}
          floatingFiltersHeight={28}
          animateRows={false}
          quickFilterText={searchText}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          onRowClicked={handleRowClick}
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
    </>
  );
};
