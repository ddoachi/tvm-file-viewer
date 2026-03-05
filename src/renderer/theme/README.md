# Total Voltage Manager - Design System

Professional design system for DRAM design engineers.

## Overview

**Philosophy**: Technical precision with visual clarity. Designed for engineers analyzing voltage hierarchies.

**Aesthetic**: VSCode meets technical dashboards - clean lines, deliberate hierarchy, monospace data presentation.

**Target Audience**: DRAM design engineers who need clarity over decoration.

---

## Color Palette

### Primary Color
- **Main**: `#2D7FF9` - Blue accent (from Dribbble reference #25521744)
- **Light**: `#5C9FFA` - Hover states in dark mode
- **Dark**: `#1E5FD9` - Pressed states

### Semantic Colors (Voltage States)
- **Success**: `#10B981` - Normal voltage readings
- **Warning**: `#F59E0B` - Voltage deviation
- **Error**: `#EF4444` - Voltage violation
- **Info**: `#3B82F6` - Informational states

### Light Theme
```typescript
bg.primary: '#FFFFFF'       // Main background
bg.secondary: '#F8F9FA'     // Header, secondary surfaces
bg.tertiary: '#F1F3F5'      // Subtle backgrounds

border.subtle: '#E5E7EB'    // Light borders
border.default: '#D1D5DB'   // Standard borders
border.strong: '#9CA3AF'    // Emphasized borders

text.primary: '#1F2937'     // Main text
text.secondary: '#6B7280'   // Secondary text
text.tertiary: '#9CA3AF'    // Disabled text
```

### Dark Theme
```typescript
bg.primary: '#0F1419'       // Main background
bg.secondary: '#1A1F2A'     // Header, secondary surfaces
bg.tertiary: '#242A35'      // Subtle backgrounds

border.subtle: '#2A303D'    // Light borders
border.default: '#374151'   // Standard borders
border.strong: '#4B5563'    // Emphasized borders

text.primary: '#F9FAFB'     // Main text
text.secondary: '#D1D5DB'   // Secondary text
text.tertiary: '#9CA3AF'    // Disabled text
```

---

## Typography

### Font Families
- **Sans-serif**: `Inter` - UI elements, headers, body text
- **Monospace**: `JetBrains Mono` - Voltage values, NetList IDs, technical data

### Font Sizes (rem-based)
```typescript
xs: 0.75rem    // 12px - Captions
sm: 0.875rem   // 14px - Body, buttons
base: 1rem     // 16px - Primary body
lg: 1.125rem   // 18px - Subheadings
xl: 1.25rem    // 20px - Headings
2xl: 1.5rem    // 24px - Large headings
3xl: 1.875rem  // 30px - Page titles
```

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Buttons, emphasized text
- **Semibold**: 600 - Headings, labels
- **Bold**: 700 - Major headings

### Usage Guidelines
- Use **Inter** for all UI elements (buttons, labels, headers)
- Use **JetBrains Mono** for data values (voltage readings, IDs)
- Apply `font-variant-numeric: tabular-nums` for numeric data alignment

---

## Spacing System

Base-4 system (all values are multiples of 4px):

```typescript
0: 0px      // No spacing
1: 4px      // Minimal padding
2: 8px      // Tight spacing
3: 12px     // Standard padding
4: 16px     // Default spacing
6: 24px     // Section spacing
8: 32px     // Large gaps
12: 48px    // Major sections
```

**Usage**:
- Cell padding: `12px` horizontal, `8px` vertical
- Tree indentation: `24px` per level
- Section margins: `16px` - `32px`

---

## Tree Visualization

Inspired by VSCode file explorer and Dribbble shot #15449727.

### Configuration
- **Indentation per level**: `24px`
- **Vertical connector lines**: `1px` solid, subtle border color
- **Depth indicator**: Left bar, `3px` wide, `8px` offset
- **Expand/collapse icons**: `16px` size, smooth `150ms` rotation

### Implementation
```css
/* Vertical lines connecting nodes */
.ag-row-group-indent::before {
  content: '';
  position: absolute;
  left: 8px;
  width: 1px;
  background-color: var(--border-subtle);
}

/* Expand icon rotation */
.ag-group-expanded {
  transform: rotate(90deg);
  transition: transform 150ms ease;
}
```

---

## AG Grid Styling

### Theme Classes
- **Light mode**: `ag-theme-tvm-light`
- **Dark mode**: `ag-theme-tvm-dark`

### Grid Configuration
```typescript
row.height: 40px           // Standard row height
header.height: 44px        // Header height
cell.padding: 12px H, 8px V
treeCell.indentPerLevel: 24px
```

### Cell Types
- **Tree cells**: Sans-serif, with expand icons and indentation
- **Voltage cells** (`Vnet1`, `Vnet2`): Monospace, tabular nums
- **Group cells**: Standard sans-serif
- **Net cells**: Sans-serif with tree structure

### Hover & Selection States
```css
row:hover {
  background-color: var(--row-hover);
  transition: background-color 150ms ease;
}

row.selected {
  background-color: var(--selected-bg);
}

cell:focus {
  border: 2px solid var(--primary-color);
}
```

---

## Usage Examples

### Import Design System
```typescript
import { colors, typography, spacing, gridConfig } from './theme/designSystem';
```

### Using Colors
```typescript
// In styled components
const Button = styled.button`
  background-color: ${colors.primary.main};
  color: ${colors.primary.contrast};
  border: 1px solid ${colors.light.border.default};
`;

// In inline styles
<div style={{ color: colors.light.text.primary }}>
```

### Using Typography
```typescript
const DataValue = styled.span`
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.sm};
  font-variant-numeric: tabular-nums;
`;
```

### Using Spacing
```typescript
const Container = styled.div`
  padding: ${spacing[4]};
  margin-bottom: ${spacing[6]};
`;
```

### AG Grid Theme
```tsx
import './theme/agGridTheme.css';

<div className="ag-theme-tvm-light" style={{ height: '100%' }}>
  <AgGridReact {...gridProps} />
</div>
```

### Semantic Voltage Classes
```tsx
// Apply semantic colors to voltage cells
const getCellClass = (value: number) => {
  if (value < 0.9) return 'voltage-error';
  if (value < 1.0) return 'voltage-warning';
  return 'voltage-normal';
};
```

---

## MUI Theme Integration

The MUI theme (`muiTheme.ts`) is fully integrated with the design system:

```typescript
import { lightTheme, darkTheme } from './theme/muiTheme';

<ThemeProvider theme={lightTheme}>
  <App />
</ThemeProvider>
```

Both `lightTheme` and `darkTheme` use design system tokens for:
- Color palette (primary, semantic, backgrounds, text)
- Typography (font families, sizes, weights)
- Spacing (MUI spacing units = 4px base)
- Shadows & borders
- Component overrides (buttons, cards, inputs)

---

## Design Principles

### 1. Clarity Over Decoration
Engineers need to focus on data, not visual noise. Every design decision serves function.

### 2. Hierarchy Through Typography
- Monospace for data values (easy scanning)
- Sans-serif for UI (clean, modern)
- Clear size/weight hierarchy (headers → body → captions)

### 3. Consistent Spacing
Base-4 system ensures visual rhythm and alignment across all components.

### 4. Semantic Color
Colors carry meaning:
- Blue = primary actions, focus
- Green = normal/success
- Amber = warning/deviation
- Red = error/violation

### 5. Performance
- GPU-accelerated scrolling (`transform: translateZ(0)`)
- Smooth transitions (`150ms` for hovers, `200ms` for state changes)
- Optimized tree rendering

---

## File Structure

```
src/renderer/theme/
├── designSystem.ts      # Core design tokens
├── agGridTheme.css      # AG Grid custom styles
├── muiTheme.ts          # MUI theme integration
└── README.md            # This file
```

---

## Extending the Design System

### Adding New Colors
```typescript
// In designSystem.ts
export const colors = {
  ...existing,
  custom: {
    myColor: '#HEX',
  },
};
```

### Adding Custom AG Grid Styles
```css
/* In agGridTheme.css */
.ag-theme-tvm-light .my-custom-cell {
  /* Your styles */
}
```

### Adding MUI Component Overrides
```typescript
// In muiTheme.ts
components: {
  MuiMyComponent: {
    styleOverrides: {
      root: {
        // Your overrides using design system tokens
      },
    },
  },
}
```

---

## Accessibility

- All colors meet WCAG AA contrast ratios
- Focus states use 2px solid primary color border
- Font sizes use rem units for user scaling
- Interactive elements have clear hover/active states
- Keyboard navigation fully supported in AG Grid

---

## References

- **Dribbble #15449727**: Vertical hierarchy inspiration
- **Dribbble #25521744**: Blue accent color (`#2D7FF9`)
- **VSCode**: Tree view pattern, monospace usage
- **AG Grid Alpine Theme**: Base grid styling
