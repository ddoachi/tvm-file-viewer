# BH-Support: CSV Tree Viewer Specification

## Product Overview

Desktop application for importing CSV files containing circuit net data and displaying them in a hierarchical tree view with intelligent group-based filtering.

---

## Requirements Analysis

### Functional Requirements

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-1 | CSV File Import | User can select `.csv` file via native dialog; app parses and displays data |
| FR-2 | AgGrid Tree Display | Data rendered in AG Grid tree format with expand/collapse controls |
| FR-3 | Four-Column Schema | Grid displays: `Net`, `Group`, `Vnet1`, `Vnet2` |
| FR-4 | Custom Group Filter | When filter matches rows, show ALL rows with same `Group` values |
| FR-5 | MUI Design System | UI uses Material UI components for consistent design |
| FR-6 | Electron Desktop App | Runs as native desktop application |
| FR-7 | Incremental Git Commits | Development produces atomic commits at each milestone |

### Data Schema

```csv
Net,Group,Vnet1,Vnet2
_INST1.net1,1,VDD,VEXT
_INST2.net1,1,VDD,VEXT
_INST_TEST.net3,2,VDDQ,VON
```

- **Net**: Hierarchical identifier (e.g., `_INST1.net1` - parent is `_INST1`, child is `net1`)
- **Group**: Numeric/string grouping identifier
- **Vnet1/Vnet2**: Voltage net identifiers

### Tree Hierarchy Logic

The tree structure is derived from the `Net` column by splitting on `.`:
- `_INST1.net1` → path: `['_INST1', 'net1']`
- `_INST1` becomes a parent node
- `net1` becomes a child node under `_INST1`

### Custom Filter Behavior

**Two-phase filtering algorithm:**

1. **Phase 1 - Direct Match**: Evaluate filter condition against all rows, collect matching rows
2. **Phase 2 - Group Expansion**: Find all `Group` values from matched rows, then include ALL rows with those Group values

**Example:**
- Filter: `Vnet1 == 'VDD'`
- Direct matches: rows with `Group=1` (both `_INST1.net1` and `_INST2.net1`)
- Group expansion: Show ALL rows where `Group=1`
- Result: Both rows visible even though filter only checked `Vnet1`

---

## Technical Architecture

### Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Electron | ^33.x | Desktop app framework |
| React | ^19.x | UI component library |
| Vite | ^6.x | Build tool with HMR |
| TypeScript | ^5.7 | Type safety |
| AG Grid Community | ^33.0 | Data grid with tree support |
| MUI | ^6.x | Material Design components |
| Papa Parse | ^5.x | CSV parsing |
| Zustand | ^5.x | State management |

### Process Architecture

```
┌─────────────────────────────────────┐
│         Main Process                │
│  - Window lifecycle                 │
│  - File dialog (showOpenDialog)     │
│  - File reading (fs.readFileSync)   │
│  - IPC handlers                     │
└──────────┬──────────────────────────┘
           │ contextBridge (preload)
┌──────────▼──────────────────────────┐
│       Renderer Process              │
│  - CSV parsing (Papa Parse)         │
│  - Tree transformation              │
│  - AG Grid rendering                │
│  - Group filter logic               │
│  - MUI layout                       │
└─────────────────────────────────────┘
```

### File Structure

```
bh-support/
├── electron/
│   ├── main.ts           # Main process entry
│   └── preload.ts        # IPC bridge
├── src/
│   ├── main.tsx          # React entry
│   ├── App.tsx           # Root component
│   ├── components/
│   │   ├── AppHeader.tsx
│   │   ├── DataGrid.tsx
│   │   ├── FilterPanel.tsx
│   │   └── StatusBar.tsx
│   ├── hooks/
│   │   ├── useCsvImport.ts
│   │   └── useGroupFilter.ts
│   ├── services/
│   │   ├── csvParser.ts
│   │   ├── treeTransformer.ts
│   │   └── groupFilter.ts
│   ├── store/
│   │   └── appStore.ts
│   ├── types/
│   │   └── index.ts
│   └── theme/
│       └── muiTheme.ts
├── index.html
├── electron-vite.config.ts
├── package.json
└── tsconfig*.json
```

### Core Data Types

```typescript
interface CsvRow {
  Net: string;
  Group: string;
  Vnet1: string;
  Vnet2: string;
  _treePath: string[];      // Computed from Net
  _rowIndex: number;        // Stable identity
}

interface FilterCondition {
  column: 'Net' | 'Group' | 'Vnet1' | 'Vnet2';
  operator: 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith';
  value: string;
}

interface FilterResult {
  directMatches: Set<number>;
  matchedGroups: Set<string>;
  visibleRowIndices: Set<number>;
}
```

### Key Algorithms

**Group-Aware Filter (O(n) time, O(n) space):**

```
Pass 1: Direct matching
  FOR each row:
    IF all conditions match:
      Add to directMatches
      Add row.Group to matchedGroups

Pass 2: Group expansion
  FOR each row:
    IF row.Group in matchedGroups:
      Add to visibleRowIndices
```

**Tree Path Computation:**

```
FOR each row:
  Split row.Net on '.'
  row._treePath = split result

Example:
  "_INST1.net1" → ['_INST1', 'net1']
  "_INST_TEST.net3" → ['_INST_TEST', 'net3']
```

---

## Implementation Plan

### Phase 1: Project Setup
- Initialize npm project with TypeScript
- Configure electron-vite
- Set up basic Electron main/preload/renderer structure
- Configure Git repository

### Phase 2: Basic Electron App
- Create main process with window lifecycle
- Implement IPC bridge in preload
- Create minimal React renderer
- Verify hot reload works

### Phase 3: CSV Import
- Implement file dialog in main process
- Add IPC handlers for file operations
- Integrate Papa Parse
- Create CSV import hook

### Phase 4: Data Display
- Set up Zustand store
- Integrate AG Grid Community
- Display parsed CSV data in flat grid
- Add basic MUI layout (AppBar, Container)

### Phase 5: Tree View
- Implement tree path transformation
- Configure AG Grid tree data mode
- Add expand/collapse functionality

### Phase 6: Filter System
- Create FilterPanel UI component
- Implement group-aware filter algorithm
- Integrate external filter with AG Grid
- Add filter status display

### Phase 7: Polish & Testing
- Add loading states and error handling
- Implement StatusBar component
- Create sample CSV for testing
- Manual QA of all features

### Phase 8: Documentation
- Write README with setup and usage instructions
- Document filter behavior
- Add inline code comments
