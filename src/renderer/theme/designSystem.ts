/**
 * Design System for Total Voltage Manager
 *
 * Target Audience: DRAM design engineers
 * Design Philosophy: Technical precision, visual clarity, reduced cognitive load
 * Inspiration: VSCode tree views, technical dashboards
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary - Blue accent from Dribbble reference #25521744
  primary: {
    main: '#2D7FF9',
    light: '#5C9FFA',
    dark: '#1E5FD9',
    contrast: '#FFFFFF',
  },

  // Semantic colors for voltage states
  semantic: {
    success: '#10B981',      // Green - normal voltage
    warning: '#F59E0B',      // Amber - voltage deviation
    error: '#EF4444',        // Red - voltage violation
    info: '#3B82F6',         // Blue - informational
  },

  // Light theme
  light: {
    // Backgrounds
    bg: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#F1F3F5',
      elevated: '#FFFFFF',
    },
    // Borders
    border: {
      subtle: '#E5E7EB',
      default: '#D1D5DB',
      strong: '#9CA3AF',
    },
    // Text
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
      link: '#2D7FF9',
    },
    // Interactive states
    interactive: {
      hover: '#F3F4F6',
      active: '#E5E7EB',
      selected: '#EBF4FF',
      selectedHover: '#DBEAFE',
    },
  },

  // Dark theme
  dark: {
    // Backgrounds
    bg: {
      primary: '#0F1419',
      secondary: '#1A1F2A',
      tertiary: '#242A35',
      elevated: '#2A303D',
    },
    // Borders
    border: {
      subtle: '#2A303D',
      default: '#374151',
      strong: '#4B5563',
    },
    // Text
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
      inverse: '#1F2937',
      link: '#5C9FFA',
    },
    // Interactive states
    interactive: {
      hover: '#1F2937',
      active: '#2A303D',
      selected: '#1E3A5F',
      selectedHover: '#2D5080',
    },
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
  },

  // Font sizes (rem-based for accessibility)
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
  },

  // Font weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

// ============================================================================
// SPACING SYSTEM
// ============================================================================

/**
 * Base-4 spacing system
 * All spacing values are multiples of 4px for consistency
 */
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ============================================================================
// TREE VISUALIZATION
// ============================================================================

export const treeConfig = {
  // Indentation per hierarchy level
  indentPerLevel: spacing[6], // 24px

  // Tree line styles
  lines: {
    width: '1px',
    style: 'solid',
    color: {
      light: colors.light.border.subtle,
      dark: colors.dark.border.subtle,
    },
  },

  // Expand/collapse icon sizes
  iconSize: {
    small: '16px',
    medium: '20px',
    large: '24px',
  },

  // Tree node padding
  nodePadding: {
    vertical: spacing[2],   // 8px
    horizontal: spacing[3], // 12px
  },

  // Depth indicator bar
  depthBar: {
    width: '3px',
    offset: spacing[2], // 8px from left
  },
} as const;

// ============================================================================
// AG GRID CONFIGURATION
// ============================================================================

export const gridConfig = {
  // Row configuration
  row: {
    height: 40,              // px
    heightCompact: 32,       // px
    heightComfortable: 48,   // px
  },

  // Cell configuration
  cell: {
    paddingHorizontal: spacing[3], // 12px
    paddingVertical: spacing[2],   // 8px
  },

  // Header configuration
  header: {
    height: 44,              // px
    paddingHorizontal: spacing[3], // 12px
    paddingVertical: spacing[2],   // 8px
  },

  // Border configuration
  border: {
    width: '1px',
    style: 'solid',
    color: {
      light: colors.light.border.subtle,
      dark: colors.dark.border.subtle,
    },
  },

  // Tree cell configuration
  treeCell: {
    indentPerLevel: 24,      // px
    iconGutter: 8,           // px
    expandIconSize: 16,      // px
  },
} as const;

// ============================================================================
// SHADOWS & ELEVATION
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ColorMode = 'light' | 'dark';
export type SemanticColor = keyof typeof colors.semantic;
export type SpacingKey = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
