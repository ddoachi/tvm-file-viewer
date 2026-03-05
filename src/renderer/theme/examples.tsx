/**
 * Design System Examples
 *
 * Reference implementations showing how to use the design system
 * These are examples only - not meant for production use
 */

import React from 'react';
import { colors, typography, spacing, gridConfig } from './designSystem';

/**
 * Example 1: Voltage Cell Renderer
 * Shows how to apply semantic colors based on voltage values
 */
export const VoltageCellRenderer: React.FC<{ value: number }> = ({ value }) => {
  const getVoltageClass = (voltage: number): string => {
    if (voltage < 0.9) return 'voltage-error';
    if (voltage < 1.0) return 'voltage-warning';
    return 'voltage-normal';
  };

  return (
    <span
      className={getVoltageClass(value)}
      style={{
        fontFamily: typography.fontFamily.mono,
        fontSize: typography.fontSize.sm,
        fontVariantNumeric: 'tabular-nums',
        fontWeight: typography.fontWeight.medium,
      }}
    >
      {value.toFixed(3)}V
    </span>
  );
};

/**
 * Example 2: Tree Node with Depth Indicator
 * Shows how to implement tree hierarchy visualization
 */
interface TreeNodeProps {
  label: string;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle?: () => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  depth,
  isExpanded,
  hasChildren,
  onToggle,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: `calc(${depth} * ${spacing[6]})`, // 24px per level
        height: `${gridConfig.row.height}px`,
        gap: spacing[2],
      }}
    >
      {/* Expand/collapse icon */}
      {hasChildren && (
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '16px',
            height: '16px',
            padding: 0,
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        >
          ▶
        </button>
      )}

      {/* Node label */}
      <span
        style={{
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.regular,
        }}
      >
        {label}
      </span>
    </div>
  );
};

/**
 * Example 3: Status Badge
 * Shows semantic color usage for status indicators
 */
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getStatusColor = (status: StatusBadgeProps['status']) => {
    switch (status) {
      case 'success':
        return colors.semantic.success;
      case 'warning':
        return colors.semantic.warning;
      case 'error':
        return colors.semantic.error;
      case 'info':
        return colors.semantic.info;
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[1]} ${spacing[3]}`,
        borderRadius: '6px',
        backgroundColor: `${getStatusColor(status)}15`, // 15 = 8% opacity in hex
        color: getStatusColor(status),
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        fontFamily: typography.fontFamily.sans,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(status),
        }}
      />
      {label}
    </span>
  );
};

/**
 * Example 4: Data Table Header
 * Shows typography hierarchy and spacing
 */
export const DataTableHeader: React.FC<{ title: string; count: number }> = ({
  title,
  count,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${spacing[4]} ${spacing[6]}`,
        borderBottom: `2px solid ${colors.light.border.default}`,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.light.text.primary,
        }}
      >
        {title}
      </h3>
      <span
        style={{
          fontFamily: typography.fontFamily.mono,
          fontSize: typography.fontSize.sm,
          color: colors.light.text.secondary,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {count.toLocaleString()} rows
      </span>
    </div>
  );
};

/**
 * Example 5: Custom AG Grid Column Definition
 * Shows how to configure AG Grid columns with design system
 */
export const getVoltageColumnDef = () => ({
  field: 'voltage',
  headerName: 'Voltage',
  cellStyle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    fontVariantNumeric: 'tabular-nums',
  },
  cellClassRules: {
    'voltage-normal': (params: any) => params.value >= 1.0,
    'voltage-warning': (params: any) => params.value >= 0.9 && params.value < 1.0,
    'voltage-error': (params: any) => params.value < 0.9,
  },
  valueFormatter: (params: any) => `${params.value?.toFixed(3)}V`,
});

/**
 * Example 6: Themed Card Component
 * Shows how to use design system tokens for custom components
 */
interface ThemedCardProps {
  title: string;
  children: React.ReactNode;
  mode?: 'light' | 'dark';
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  title,
  children,
  mode = 'light',
}) => {
  const theme = mode === 'light' ? colors.light : colors.dark;

  return (
    <div
      style={{
        backgroundColor: theme.bg.elevated,
        border: `1px solid ${theme.border.subtle}`,
        borderRadius: '8px',
        padding: spacing[6],
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <h4
        style={{
          margin: 0,
          marginBottom: spacing[4],
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: theme.text.primary,
        }}
      >
        {title}
      </h4>
      <div
        style={{
          color: theme.text.secondary,
          fontSize: typography.fontSize.sm,
          lineHeight: typography.lineHeight.normal,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Example 7: AG Grid Auto Group Column Configuration
 * Shows proper tree column setup with design system
 */
export const getAutoGroupColumnDef = () => ({
  headerName: 'Net Hierarchy',
  minWidth: 300,
  cellRendererParams: {
    suppressCount: false,
    innerRenderer: (params: any) => {
      return params.value;
    },
  },
  cellStyle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
  },
});
