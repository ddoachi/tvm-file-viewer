import React, { useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, IRowNode } from 'ag-grid-community';
import { useAppStore } from '../store/appStore';
import type { CsvRow } from '../types';
import { FilterPanel } from './FilterPanel';
import { colors, typography } from '../theme/designSystem';

// Register AG Grid modules
const modules = [ClientSideRowModelModule];

export const DataGrid: React.FC = () => {
  const { rows, filterResult, searchText } = useAppStore();
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

  return (
    <>
      {rows.length > 0 && <FilterPanel gridRef={gridRef} />}
      <div
        className="ag-theme-tvm-light"
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
          dataTypeDefinitions={dataTypeDefinitions}
          getDataPath={(data: CsvRow) => {
            // Build path by traversing up the parentId chain
            const path: string[] = [];
            let current: CsvRow | undefined = data;
            const rowMap = new Map(rows.map(r => [r.id, r]));

            while (current) {
              path.unshift(current.Net);
              current = current.parentId ? rowMap.get(current.parentId) : undefined;
            }

            return path;
          }}
          autoGroupColumnDef={autoGroupColumnDef}
          animateRows={true}
          groupDefaultExpanded={0}
          quickFilterText={searchText}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
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
