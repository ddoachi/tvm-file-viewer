# Fix Filtering Logic & AG Grid v35 Upgrade

**Branch**: `fix-filtering-logic`
**Date**: 2026-03-13

---

## Overview

This changeset covers 4 requirements:

1. AG Grid v32 → v35 upgrade with module registration, license, and `withParams` theming
2. Autocomplete value options: pre-compute all values at load time (no sampling)
3. Replace all `for()` loops with `forEach`/`map`
4. Fix group-level filtering logic (was grouping by wrong column)

---

## 1. AG Grid v35 Upgrade

### What changed

| File | Change |
|------|--------|
| `package.json` | `ag-grid-community`, `ag-grid-enterprise`, `ag-grid-react` → `^35.0.0` |
| `src/renderer/main.tsx` | Module registration + license key setup |
| `src/renderer/theme/agGridTheme.ts` | **New file** — light/dark themes via `themeQuartz.withParams()` |
| `src/renderer/theme/agGridTheme.css` | Trimmed to structural-only CSS (scrollbar, animations, semantic classes) |
| `src/renderer/components/DataGrid.tsx` | Uses `theme` prop, `rowSelection={{ mode: 'multiRow' }}` (v35 API) |

### Module Registration (`main.tsx`)

```typescript
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
LicenseManager.setLicenseKey('MOCK_LICENSE_KEY_FOR_DEVELOPMENT_ONLY');
```

### Theme with `withParams` (`agGridTheme.ts`)

Both light and dark themes are created using design tokens from `designSystem.ts`:

```typescript
import { themeQuartz } from 'ag-grid-community';
import { colors, typography, borderRadius } from './designSystem';

export const agGridThemeLight = themeQuartz.withParams({
  accentColor: colors.primary.main,
  backgroundColor: colors.light.bg.primary,
  foregroundColor: colors.light.text.primary,
  chromeBackgroundColor: colors.light.bg.secondary,
  headerTextColor: colors.light.text.primary,
  // ... full list in file
});
```

Applied via the `theme` prop on `<AgGridReact>` instead of the old CSS class approach:

```tsx
// Before (v32): className="ag-theme-quartz ag-theme-tvm-light"
// After (v35):  theme={agGridThemeLight}
```

### CSS Changes

The old `agGridTheme.css` had two full theme blocks (`.ag-theme-tvm-light`, `.ag-theme-tvm-dark`) with CSS variable overrides. These are now handled by `withParams` in JS. The CSS file was trimmed to a single `.ag-theme-tvm` class containing only structural overrides that can't be expressed via `withParams`:

- Header border/resize styling
- Row/cell transitions
- Group expand/collapse animation
- Focus ring styling
- Scrollbar customization
- Semantic voltage color classes (`.voltage-normal`, `.voltage-warning`, `.voltage-error`)
- GPU acceleration (`translateZ(0)`)

### v35 API Changes in `DataGrid.tsx`

- `rowSelection="multiple"` → `rowSelection={{ mode: 'multiRow' }}`
- `autoGroupColumnDef` typed as `ColDef<CsvRow>` (stricter generic in v35)
- Removed `rowHeight`, `headerHeight`, `floatingFiltersHeight` props (now in theme)

---

## 2. Autocomplete Options — Full Value Collection

### Problem

`FilterBuilder.tsx` was computing `columnValues` with **sampling** (max 10,000 rows, stepping through with `Math.floor(rows.length / sampleSize)`). This meant some values were missing from the autocomplete dropdown.

### Solution

Pre-compute all unique values per column at file load time, store them alongside the rows.

| File | Change |
|------|--------|
| `src/renderer/services/columnValues.ts` | **New file** — `buildColumnValueSets(rows)` iterates all rows |
| `src/renderer/store/appStore.ts` | `OpenFile` now has `columnValues: Map<string, Set<string>>` |
| `src/renderer/hooks/useCsvImport.ts` | Calls `buildColumnValueSets()` on load and file-reload |
| `src/renderer/components/FilterPanel.tsx` | Reads `columnValues` from store, passes as prop |
| `src/renderer/components/FilterBuilder.tsx` | Accepts `columnValues` prop, removed sampling `useMemo` |

### Data flow

```
File load (useCsvImport)
  → parseCsv/parseJson → rows
  → buildColumnValueSets(rows) → columnValues
  → addFile({ rows, columnValues }) → store

FilterPanel
  → reads activeFile.columnValues from store
  → passes to <FilterBuilder columnValues={columnValues} />

ConditionBlock
  → reads valueOptions from columnValues.get(selectedColumn)
  → displays in <Autocomplete> dropdown
```

### `buildColumnValueSets` (`columnValues.ts`)

```typescript
export function buildColumnValueSets(rows: CsvRow[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  COLUMNS.forEach(col => map.set(col, new Set()));
  rows.forEach(row => {
    COLUMNS.forEach(col => {
      const value = row[col];
      if (value !== null && value !== undefined && value !== '') {
        map.get(col)!.add(String(value));
      }
    });
  });
  return map;
}
```

---

## 3. `for()` → `forEach` / `map`

All `for` statements (including `for...of`) replaced across the entire `src/` directory.

| File | Before | After |
|------|--------|-------|
| `FilterBuilder.tsx` | `for (let i = 0; i < formula.length; i++)` | `Array.from(formula).map((ch, i) => ...)` |
| `FilterBuilder.tsx` | `for (let i = 0; i < rows.length; i += step)` | Removed (replaced by pre-computed columnValues) |
| `groupFilter.ts` | 7× `for...of` | `rows.forEach()`, `allGroups.forEach()`, etc. |
| `expressionParser.ts` | `for (const condStr of ...)` | `conditionStrings.forEach()` |
| `expressionParser.ts` | `for (const { regex, op } of ...)` | `patterns.some()` |
| `useCsvImport.ts` | `for (const file of openFiles)` | `openFiles.forEach()` |
| `main/index.ts` | `for (const watcher of ...)` | `fileWatchers.forEach()` |

**Verification**: `grep -r '\bfor\s*(' src/` returns zero matches.

---

## 4. Filtering Logic Fix

### The Bug

The filter builder groups rows and checks whether a group qualifies based on filter conditions. However, **it was grouping by `row.master` while AG Grid groups by `row.tree`**.

Example with the user's data:

| tree | parent_master | vnets |
|------|--------------|-------|
| NOT_ASSIGNED_000000 | \<tree_top\> | VLAG1_N_1B |
| NOT_ASSIGNED_000000 | MY_FULLCHIP | |
| NOT_ASSIGNED_000000 | MY_FULLCHIP | |
| NOT_ASSIGNED_000000 | B_MY_SUPERCELL... | |
| NOT_ASSIGNED_000000 | MY_SUPERCELL... | VLAG1_N_1B |
| NOT_ASSIGNED_000000 | L_R_RD_1BLK | |

With filter `vnets == VLAG1_N_1B`:

- **Old behavior** (group by `master`): Rows 0 and 4 match, but they have different `master` values (`<tree_top>` and `MY_SUPERCELL...`), so only rows within those specific master groups were shown → **2 rows visible**
- **New behavior** (group by `tree`): Both matching rows belong to `NOT_ASSIGNED_000000` tree group, so the entire group qualifies → **all 6 rows visible**

### Changes in `groupFilter.ts`

Two lines changed:

```typescript
// Phase 1: group key when collecting matches
// Before: const group = row.master;
const group = row.tree;

// Phase 3: collecting visible rows
// Before: if (matchedGroups.has(row.master))
if (matchedGroups.has(row.tree))
```

### How group filtering works (unchanged logic, corrected key)

1. **Phase 1** — For each condition, iterate all rows. If a row matches, record it under its `tree` group.
2. **Phase 2** — For each group, evaluate the formula/operator:
   - **Formula mode** (e.g., `A && B`): Variable A = "does this group have ≥1 row matching condition A?", etc. Evaluate the boolean formula.
   - **AND mode** (empty formula): Group qualifies only if ALL conditions have ≥1 matching row in it.
   - **OR mode**: Group qualifies if ANY condition has ≥1 matching row.
3. **Phase 3** — For every qualifying group, include **ALL rows** in that group (not just the matched rows).

### Empty Formula Behavior

When the Formula field is empty, conditions are combined with `AND` (hardcoded in `handleAddCondition`). A help text hint now shows dynamically:

- Formula empty → `Empty = all conditions AND`
- Formula has content → `e.g. A && B   A || (B && !C)`

---

## Files Changed Summary

| File | Status |
|------|--------|
| `package.json` | Modified (ag-grid versions) |
| `src/main/index.ts` | Modified (for→forEach) |
| `src/renderer/main.tsx` | Rewritten (module registration) |
| `src/renderer/theme/agGridTheme.ts` | **New** (withParams themes) |
| `src/renderer/theme/agGridTheme.css` | Rewritten (structural CSS only) |
| `src/renderer/services/columnValues.ts` | **New** (buildColumnValueSets) |
| `src/renderer/services/groupFilter.ts` | Rewritten (tree grouping, forEach) |
| `src/renderer/services/expressionParser.ts` | Modified (forEach/some) |
| `src/renderer/store/appStore.ts` | Modified (columnValues in OpenFile) |
| `src/renderer/hooks/useCsvImport.ts` | Modified (compute columnValues) |
| `src/renderer/components/DataGrid.tsx` | Modified (v35 theme/API) |
| `src/renderer/components/FilterPanel.tsx` | Modified (pass columnValues) |
| `src/renderer/components/FilterBuilder.tsx` | Modified (prop, no sampling, forEach) |
| `src/renderer/components/ConditionBlock.tsx` | Modified (null→undefined fix) |
