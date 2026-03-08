import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { CsvRow } from '../types';

// Depth colors matching the colored dot style
const DEPTH_COLORS = [
  '#2D7FF9', // Level 0 - blue
  '#10B981', // Level 1 - green
  '#F59E0B', // Level 2 - amber
  '#8B5CF6', // Level 3 - purple
  '#EC4899', // Level 4 - pink
  '#6366F1', // Level 5+ - indigo
];

export const NetCellRenderer: React.FC<ICellRendererParams<CsvRow>> = (props) => {
  if (!props.data || !props.value) return null;

  const netName: string = props.value;
  const parts = netName.split('.');
  const depth = parts.length - 1;
  const leafName = parts[parts.length - 1];
  const indent = depth * 20;
  const dotColor = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];

  return (
    <div
      style={{
        paddingLeft: `${indent}px`,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
      title={netName}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: dotColor,
          marginRight: 8,
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      <span style={{
        fontFamily: "'JetBrains Mono', 'Consolas', monospace",
        fontSize: '11px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {leafName}
      </span>
    </div>
  );
};
