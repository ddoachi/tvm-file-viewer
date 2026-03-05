import React, { useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, IRowNode } from 'ag-grid-community';
import { useAppStore } from '../store/appStore';
import type { CsvRow } from '../types';
import { FilterPanel } from './FilterPanel';

// Register AG Grid modules
const modules = [ClientSideRowModelModule];

export const DataGrid: React.FC = () => {
  const { rows, filterResult } = useAppStore();
  const gridRef = useRef<AgGridReact<CsvRow>>(null);

  // Column definitions
  const columnDefs = useMemo<ColDef<CsvRow>[]>(() => [
    {
      field: 'Net',
      headerName: 'Net',
      flex: 1,
      sortable: true,
      resizable: true,
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

  // Get data path for tree structure
  const getDataPath = (data: CsvRow) => {
    return data._treePath;
  };

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

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <FilterPanel gridRef={gridRef} />
      <div
        className="ag-theme-alpine"
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <AgGridReact<CsvRow>
          ref={gridRef}
          modules={modules}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          treeData={true}
          getDataPath={getDataPath}
          autoGroupColumnDef={autoGroupColumnDef}
          animateRows={true}
          groupDefaultExpanded={0}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
        />
      </div>
    </>
  );
};
