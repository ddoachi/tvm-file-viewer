# BH-Support: CSV Tree Viewer Implementation Plan

**Source Spec:** `.omc/autopilot/spec.md`
**Created:** 2026-03-05
**Complexity:** MEDIUM (greenfield Electron + React app, ~15-20 files)

---

## Context

Build a desktop application that imports CSV files containing circuit net data and displays them in a hierarchical AG Grid tree view with group-aware filtering. The app uses Electron + React + TypeScript + Vite, with MUI for design and Zustand for state management.

---

## Work Objectives

1. Scaffold an Electron + React + Vite + TypeScript project from scratch
2. Implement CSV file import via native Electron file dialog with IPC bridge
3. Display parsed CSV data in AG Grid tree data mode (hierarchy from `Net` column)
4. Implement custom two-phase group-aware filtering algorithm
5. Apply MUI design system for a polished desktop UI
6. Produce incremental git commits at each milestone

---

## Guardrails

### Must Have
- AG Grid **Community** edition (not Enterprise) for tree data
- Two-phase filter: direct match, then group expansion
- Tree hierarchy derived by splitting `Net` column on `.`
- Electron IPC via `contextBridge` (no `nodeIntegration: true`)
- TypeScript strict mode throughout
- All four columns displayed: `Net`, `Group`, `Vnet1`, `Vnet2`

### Must NOT Have
- No AG Grid Enterprise features (no license)
- No remote/network data fetching -- local CSV files only
- No database or persistent storage beyond the loaded CSV
- No `nodeIntegration: true` in renderer (security)

---

## Task Flow

```
T1 (Project Scaffold)
 |
 v
T2 (Electron Shell) ──depends on── T1
 |
 v
T3 (CSV Import + Parse) ──depends on── T2
 |
 ├──> T4 (AG Grid Tree View) ──depends on── T3
 |         |
 |         v
 |    T5 (Group Filter System) ──depends on── T4
 |
 └──> T6 (MUI Layout + Polish) ──depends on── T3, can parallelize with T4/T5
```

**Parallelization opportunities:**
- T4 and T6 can start concurrently once T3 is complete (grid work and UI layout are independent)
- Within T1, `package.json` creation and config files can be written in parallel

---

## Detailed Tasks

### T1: Project Scaffold and Configuration

**Description:** Initialize the project with all dependencies, TypeScript config, Vite config, and base file structure.

**Files to create:**
- `package.json` -- dependencies: `react`, `react-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`, `ag-grid-community`, `ag-grid-react`, `papaparse`, `zustand`; devDeps: `electron`, `electron-vite` (or `vite` + `vite-plugin-electron`), `typescript`, `@types/react`, `@types/react-dom`, `@types/papaparse`
- `tsconfig.json` -- strict mode, target ES2022, moduleResolution bundler
- `tsconfig.node.json` -- for Electron main/preload (Node target)
- `electron-vite.config.ts` (or `vite.config.ts` with electron plugin) -- main, preload, renderer entries
- `index.html` -- minimal HTML with `<div id="root">`
- `.gitignore` -- `node_modules/`, `dist/`, `out/`, `.vite/`

**Acceptance Criteria:**
- `npm install` completes without errors
- Project directory structure matches spec layout
- TypeScript compiles with zero errors (`npx tsc --noEmit`)

**Git Commit:** `feat: scaffold Electron + React + Vite + TypeScript project`

---

### T2: Electron Main Process and IPC Bridge

**Description:** Create the Electron main process with window lifecycle, preload script with `contextBridge`, and minimal React renderer entry point. Wire up IPC for file dialog and file reading.

**Files to create:**
- `electron/main.ts` -- `BrowserWindow` creation, `app.whenReady()`, window close handling, IPC handlers: `dialog:openFile` (calls `dialog.showOpenDialog` with CSV filter), `file:read` (reads file with `fs.readFileSync`)
- `electron/preload.ts` -- `contextBridge.exposeInMainWorld('electronAPI', { openFile, readFile })` with typed IPC invoke wrappers
- `src/main.tsx` -- React 19 `createRoot` entry point
- `src/App.tsx` -- minimal shell component (placeholder text)
- `src/types/index.ts` -- `CsvRow`, `FilterCondition`, `FilterResult`, `ElectronAPI` type definitions

**Acceptance Criteria:**
- `npm run dev` launches an Electron window showing the React app
- Hot module reload works in the renderer
- `window.electronAPI` is available in the renderer console
- No `nodeIntegration` in renderer

**Git Commit:** `feat: add Electron main process with IPC bridge and React renderer`

---

### T3: CSV Import and Parsing

**Description:** Implement the CSV file import flow: user clicks a button, native file dialog opens, selected CSV is read and parsed with Papa Parse, data is stored in Zustand, and tree paths are computed.

**Files to create:**
- `src/services/csvParser.ts` -- wraps `Papa.parse()` with typed output, validates four-column schema, returns `CsvRow[]`
- `src/services/treeTransformer.ts` -- takes `CsvRow[]`, splits `Net` on `.` to compute `_treePath`, assigns `_rowIndex`
- `src/store/appStore.ts` -- Zustand store: `rawData: CsvRow[]`, `treeData: CsvRow[]`, `fileName: string | null`, `isLoading: boolean`, `error: string | null`, actions: `importCsv(filePath)`, `clearData()`
- `src/hooks/useCsvImport.ts` -- hook that orchestrates: call `electronAPI.openFile()`, get path, call `electronAPI.readFile(path)`, parse with `csvParser`, transform with `treeTransformer`, update store

**Acceptance Criteria:**
- Clicking "Import CSV" opens native OS file dialog filtered to `.csv`
- Valid CSV file loads and populates the Zustand store with parsed + tree-transformed data
- Invalid/malformed CSV shows an error message (not a crash)
- `_treePath` correctly splits: `_INST1.net1` becomes `['_INST1', 'net1']`

**Git Commit:** `feat: implement CSV import with Papa Parse and tree path transformation`

---

### T4: AG Grid Tree View Display

**Description:** Integrate AG Grid Community with tree data mode to display the parsed CSV data as a hierarchical tree. Configure columns for `Net`, `Group`, `Vnet1`, `Vnet2`.

**Files to create:**
- `src/components/DataGrid.tsx` -- AG Grid React wrapper configured with: `treeData: true`, `getDataPath: (row) => row._treePath`, column definitions for all four columns, `autoGroupColumnDef` for the tree expand/collapse column, default sorting, row selection, grid sizing

**Files to modify:**
- `src/App.tsx` -- integrate `DataGrid` component, pass data from store

**Acceptance Criteria:**
- CSV data renders as a tree in AG Grid (parent nodes expand/collapse)
- `_INST1.net1` and `_INST1.net2` appear as children under `_INST1` parent node
- All four columns (`Net`, `Group`, `Vnet1`, `Vnet2`) are visible and populated
- Grid resizes responsively with the window
- AG Grid Community CSS is properly imported (no unstyled grid)

**Git Commit:** `feat: integrate AG Grid with tree data mode for hierarchical display`

---

### T5: Group-Aware Filter System

**Description:** Implement the custom two-phase filtering algorithm and a filter panel UI. When a filter matches rows, expand visibility to include ALL rows sharing the same `Group` values as matched rows.

**Files to create:**
- `src/services/groupFilter.ts` -- implements two-phase algorithm: Phase 1 (direct match against `FilterCondition[]`), Phase 2 (group expansion). Returns `FilterResult` with `directMatches`, `matchedGroups`, `visibleRowIndices`
- `src/hooks/useGroupFilter.ts` -- hook managing filter state, calls `groupFilter` service, integrates with AG Grid's `isExternalFilterPresent` and `doesExternalFilterPass` APIs
- `src/components/FilterPanel.tsx` -- MUI-based filter UI: column selector dropdown, operator dropdown (`equals`, `notEquals`, `contains`, `startsWith`, `endsWith`), value text input, apply/clear buttons. Displays active filter info and matched group count

**Files to modify:**
- `src/store/appStore.ts` -- add `filterConditions: FilterCondition[]`, `filterResult: FilterResult | null`, `setFilter()`, `clearFilter()` actions
- `src/components/DataGrid.tsx` -- wire up `isExternalFilterPresent`, `doesExternalFilterPass` callbacks using the filter result from store

**Acceptance Criteria:**
- User can set a filter condition (e.g., `Vnet1 equals VDD`)
- Filter Phase 1: rows matching the condition are identified
- Filter Phase 2: all rows sharing `Group` values with matched rows become visible
- Non-matching groups are hidden from the tree
- Clearing the filter restores all rows
- Filter status shows: "Showing X rows (Y direct matches, Z groups)" or similar
- Parent nodes in the tree remain visible when any child matches

**Git Commit:** `feat: implement two-phase group-aware filtering with AG Grid integration`

---

### T6: MUI Design System and UI Polish

**Description:** Apply Material UI theming and layout components to create a polished desktop application feel. Add header, status bar, loading states, and error handling.

**Files to create:**
- `src/theme/muiTheme.ts` -- custom MUI theme (can be minimal: palette, typography defaults)
- `src/components/AppHeader.tsx` -- MUI `AppBar` with app title, "Import CSV" button, loaded file name display
- `src/components/StatusBar.tsx` -- bottom bar showing: row count, filter status, file name, any error messages

**Files to modify:**
- `src/App.tsx` -- wrap in `ThemeProvider`, compose layout: `AppHeader` at top, `FilterPanel` + `DataGrid` in main area, `StatusBar` at bottom
- `src/main.tsx` -- add MUI `CssBaseline` for global resets

**Acceptance Criteria:**
- App has a consistent Material Design appearance
- AppHeader shows the app title and provides the CSV import action
- StatusBar displays current state (row counts, filter info, errors)
- Loading spinner appears during CSV parsing
- Error states display user-friendly messages (not raw stack traces)
- Layout fills the window with the grid taking remaining vertical space

**Git Commit:** `feat: apply MUI design system with AppHeader, StatusBar, and theming`

---

## Success Criteria

1. App launches via `npm run dev` without errors
2. User can import a CSV file through the native file dialog
3. Data displays in AG Grid tree mode with correct parent/child hierarchy
4. Group-aware filter correctly expands visibility to all rows in matched groups
5. UI is polished with MUI components (AppBar, theme, status bar)
6. TypeScript compiles with zero errors
7. Six incremental git commits track each milestone

---

## Sample Test Data

Save as `test-data.csv` for manual QA:

```csv
Net,Group,Vnet1,Vnet2
_INST1.net1,1,VDD,VEXT
_INST1.net2,1,VDD,VEXT
_INST2.net1,1,VDD,VEXT
_INST2.net2,2,VDDQ,VON
_INST_TEST.net3,2,VDDQ,VON
_INST_TEST.net4,3,VCORE,VINT
_INST3.net1,3,VCORE,VINT
_INST3.net2,4,VIO,VEXT
```

**Filter test case:** Filter `Vnet1 equals VDD` should show Group 1 rows (first 3 rows), hiding Groups 2, 3, 4.

---

## Notes

- AG Grid Community edition supports tree data via `treeData: true` and `getDataPath`. No Enterprise license needed for basic tree display.
- The `electron-vite` package (or `vite-plugin-electron`) handles the Electron + Vite integration. Choose whichever has better current support.
- Zustand v5 uses the `create` API without middleware for simple stores.
- Papa Parse runs in the renderer process (no need for worker threads for typical CSV sizes in this use case).
