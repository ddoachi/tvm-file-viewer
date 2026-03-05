import React, { useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, IRowNode, ICellRendererParams, RowClickedEvent } from 'ag-grid-community';
import { useAppStore } from '../store/appStore';
import type { CsvRow } from '../types';
import { FilterPanel } from './FilterPanel';
import { colors, typography } from '../theme/designSystem';

export const DataGrid: React.FC = () => {
  const { rows, filterResult, searchText } = useAppStore();
  const gridRef = useRef<AgGridReact<CsvRow>>(null);

  // Calculate tree depth for indentation
  const getTreeDepth = useCallback((row: CsvRow): number => {
    let depth = 0;
    let current = row;
    const rowMap = new Map(rows.map(r => [r.id, r]));

    while (current.parentId) {
      depth++;
      const parent = rowMap.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    return depth;
  }, [rows]);

  // Column definitions with Net column showing tree hierarchy
  const columnDefs = useMemo<ColDef<CsvRow>[]>(() => [
    {
      field: 'Net',
      headerName: 'Net',
      flex: 2,
      sortable: true,
      resizable: true,
      cellRenderer: (params: ICellRendererParams<CsvRow>) => {
        if (!params.data) return '';
        const depth = getTreeDepth(params.data);
        const indent = depth * 24;
        const connector = depth > 0 ? '<span style="color: #2D7FF9; margin-right: 8px;">└─</span>' : '';
        const netValue = params.value || '';

        return `<div style="padding-left: ${indent}px; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center;">${connector}${netValue}</div>`;
      },
    },
    {
      field: 'Group',
      headerName: 'Group',
      flex: 1,
      sortable: true,
      resizable: true,
    },
    {
      field: 'Vnet1',
      headerName: 'Vnet1',
      flex: 1,
      sortable: true,
      resizable: true,
    },
    {
      field: 'Vnet2',
      headerName: 'Vnet2',
      flex: 1,
      sortable: true,
      resizable: true,
    },
  ], []);

  // Default column definition
  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    flex: 1,
  }), []);

  // Auto group column definition for tree display
  const autoGroupColumnDef = useMemo<ColDef>(() => ({
    headerName: 'Net',
    minWidth: 300,
    cellRendererParams: {
      suppressCount: false,
    },
  }), []);

  // Data type definitions for tree structure
  const dataTypeDefinitions = useMemo(() => ({
    object: {
      baseDataType: 'object' as const,
      extendsDataType: 'object' as const,
    },
  }), []);

  // External filter callbacks
  const isExternalFilterPresent = useCallback(() => {
    return filterResult !== null;
  }, [filterResult]);

  const doesExternalFilterPass = useCallback(
    (node: IRowNode<CsvRow>) => {
      if (!filterResult || !node.data) {
        return true;
      }
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

  return (
    <>
      <FilterPanel gridRef={gridRef} />
      <div
        className="ag-theme-tvm-light"
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <AgGridReact<CsvRow>
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          quickFilterText={searchText}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          onRowClicked={handleRowClick}
          overlayNoRowsTemplate={
            '<div style="padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: ' + colors.light.text.secondary + ';">' +
            '<p style="font-family: ' + typography.fontFamily.sans + '; font-size: ' + typography.fontSize.base + '; font-weight: ' + typography.fontWeight.medium + '; margin: 0; color: ' + colors.light.text.primary + ';">No data loaded</p>' +
            '<p style="font-family: ' + typography.fontFamily.sans + '; font-size: ' + typography.fontSize.sm + '; margin-top: 8px; color: ' + colors.light.text.secondary + ';">Click "Import" to load a CSV or JSON file</p>' +
            '</div>'
          }
        />
      </div>
    </>
  );
};
