import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, RowClickedEvent, FilterChangedEvent, CellContextMenuEvent } from 'ag-grid-community';
import { Box, CircularProgress, Snackbar, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAppStore, selectFilterResult } from '../store/appStore';
import type { CsvRow } from '../types';
import { FilterPanel } from './FilterPanel';
import { agGridThemeLight, agGridThemeDark } from '../theme/agGridTheme';

function formatRowForClipboard(row: CsvRow): string {
  return [
    row.tree, row.hier_LV, row.parent_master, row.master, row.multiple,
    row.xprobe, row.assigned, row.vnets, row["D/S/B"], row.DNW, row.G,
    row.switch_type, row.psw_detected, row.psw_used, row.tg,
    row.cmos_drv, row.vnets_group, row.is_short,
  ].join('\t');
}

function formatRowsForClipboard(rows: CsvRow[]): string {
  const header = [
    'tree', 'hier_LV', 'parent_master', 'master', 'multiple',
    'xprobe', 'assigned', 'vnets', 'D/S/B', 'DNW', 'G',
    'switch_type', 'psw_detected', 'psw_used', 'tg',
    'cmos_drv', 'vnets_group', 'is_short',
  ].join('\t');
  const lines = rows.map(formatRowForClipboard);
  return [header, ...lines].join('\n');
}

export const DataGrid: React.FC = () => {
  const { openFiles, activeFileId, searchText, themeMode, isLoading, isFiltering, setGridFilteredCount } = useAppStore();
  const filterResult = useAppStore(selectFilterResult);
  const gridRef = useRef<AgGridReact<CsvRow>>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const contextRowRef = useRef<CsvRow | null>(null);

  const activeFile = openFiles.find(f => f.id === activeFileId);
  const allRows = activeFile?.rows || [];

  // Filter rowData — show only rows matching the filter
  const rows = useMemo(() => {
    if (!filterResult) return allRows;
    return allRows.filter(row => filterResult.visibleRowIndices.has(row._rowIndex));
  }, [allRows, filterResult]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Clipboard write failed:', err);
    }
  }, []);

  // AG Grid cell right-click handler
  const handleCellContextMenu = useCallback((event: CellContextMenuEvent<CsvRow>) => {
    const browserEvent = event.event as MouseEvent;
    if (!browserEvent) return;
    browserEvent.preventDefault();
    contextRowRef.current = event.data || null;
    setContextMenu({ mouseX: browserEvent.clientX, mouseY: browserEvent.clientY });
  }, []);

  const handleCopyRows = useCallback(() => {
    const api = gridRef.current?.api;
    const selectedRows = api ? api.getSelectedRows() as CsvRow[] : [];

    if (selectedRows.length > 1) {
      copyToClipboard(formatRowsForClipboard(selectedRows));
    } else if (contextRowRef.current) {
      copyToClipboard(formatRowForClipboard(contextRowRef.current));
    }
    setContextMenu(null);
  }, [copyToClipboard]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const getCopyLabel = useCallback((): string => {
    const api = gridRef.current?.api;
    const selectedRows = api ? api.getSelectedRows() : [];
    if (selectedRows.length > 1) {
      return `Copy ${selectedRows.length} Rows`;
    }
    return 'Copy Row';
  }, []);

  const columnDefs = useMemo<ColDef<CsvRow>[]>(() => [
    { field: 'tree', headerName: 'tree', flex: 2, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true, enableRowGroup: true },
    { field: 'hier_LV', headerName: 'hier_LV', flex: 1, sortable: true, resizable: true, filter: 'agNumberColumnFilter', floatingFilter: true },
    { field: 'parent_master', headerName: 'parent_master', flex: 1, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true },
    { field: 'master', headerName: 'master', flex: 1, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true },
    { field: 'multiple', headerName: 'multiple', flex: 1, sortable: true, resizable: true, filter: 'agNumberColumnFilter', floatingFilter: true },
    { field: 'xprobe', headerName: 'xprobe', flex: 1, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true },
    { field: 'assigned', headerName: 'assigned', flex: 1, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true },
    { field: 'vnets', headerName: 'vnets', flex: 1, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true },
    { field: 'D/S/B', headerName: 'D/S/B', flex: 1, sortable: true, resizable: true, filter: 'agNumberColumnFilter', floatingFilter: true },
    { field: 'DNW', headerName: 'DNW', flex: 1, sortable: true, resizable: true, filter: 'agNumberColumnFilter', floatingFilter: true },
    { field: 'G', headerName: 'G', flex: 1, sortable: true, resizable: true, filter: 'agNumberColumnFilter', floatingFilter: true },
    { field: 'switch_type', headerName: 'switch_type', flex: 1, sortable: true, resizable: true, filter: 'agNumberColumnFilter', floatingFilter: true },
    { field: 'psw_detected', headerName: 'psw_detected', flex: 1, sortable: true, resizable: true, filter: 'agNumberColumnFilter', floatingFilter: true },
    { field: 'psw_used', headerName: 'psw_used', flex: 1, sortable: true, resizable: true, filter: 'agNumberColumnFilter', floatingFilter: true },
    { field: 'tg', headerName: 'tg', flex: 1, sortable: true, resizable: true, filter: 'agNumberColumnFilter', floatingFilter: true },
    { field: 'cmos_drv', headerName: 'cmos_drv', flex: 1, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true },
    { field: 'vnets_group', headerName: 'vnets_group', flex: 1, sortable: true, resizable: true, filter: 'agTextColumnFilter', floatingFilter: true },
    { field: 'is_short', headerName: 'is_short', flex: 1, sortable: true, resizable: true, filter: 'agNumberColumnFilter', floatingFilter: true },
  ], []);

  const autoGroupColumnDef = useMemo<ColDef<CsvRow>>(() => ({
    flex: 2,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    resizable: true,
  }), []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true, resizable: true, flex: 1, filter: true, suppressHeaderMenuButton: false, enableRowGroup: true,
  }), []);

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
    setGridFilteredCount(count < rows.length ? count : null);
  }, [rows.length, setGridFilteredCount]);

  // Clear AG Grid column filters when switching tabs
  useEffect(() => {
    const api = gridRef.current?.api;
    if (api) {
      api.setFilterModel(null);
    }
  }, [activeFileId]);

  const isBusy = isLoading || isFiltering;
  const theme = themeMode === 'light' ? agGridThemeLight : agGridThemeDark;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 0.5 }}>
      <FilterPanel disabled={isBusy} />

      <div
        className="ag-theme-tvm"
        style={{ flex: '1 1 0', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
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
          theme={theme}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          rowGroupPanelShow="always"
          groupDefaultExpanded={0}
          rowSelection={{ mode: 'multiRow' }}
          suppressContextMenu={true}
          animateRows={false}
          quickFilterText={searchText}
          onRowClicked={handleRowClick}
          onFilterChanged={handleFilterChanged}
          onCellContextMenu={handleCellContextMenu}
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

      {/* Right-click context menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        <MenuItem onClick={handleCopyRows} sx={{ fontSize: 13 }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{contextMenu ? getCopyLabel() : 'Copy Row'}</ListItemText>
        </MenuItem>
      </Menu>

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
