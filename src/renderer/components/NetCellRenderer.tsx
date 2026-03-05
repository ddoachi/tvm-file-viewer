import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { CsvRow } from '../types';

interface NetCellRendererProps extends ICellRendererParams<CsvRow> {
  getTreeDepth: (row: CsvRow) => number;
}

export const NetCellRenderer: React.FC<NetCellRendererProps> = (props) => {
  if (!props.data) return null;

  const depth = props.getTreeDepth(props.data);
  const indent = depth * 24;

  return (
    <div
      style={{
        paddingLeft: `${indent}px`,
        fontFamily: "'JetBrains Mono', monospace",
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {depth > 0 && (
        <span style={{ color: '#2D7FF9', marginRight: '8px' }}>
          └─
        </span>
      )}
      <span>{props.value}</span>
    </div>
  );
};
