# Total Voltage Manager - Filter Guide

## Overview

The Total Voltage Manager provides two filter modes plus global search for powerful data analysis.

---

## Global Search

Located at the top of the filter panel.

**Usage**: Type any text to search across all columns instantly.

```
🔍 [Search across all columns...]
```

**Examples**:
- Type "VDD" → Shows all rows containing "VDD" in any column
- Type "BANK0" → Shows all rows with "BANK0" in any column

---

## Filter Modes

### **Simple Mode** (Default)

Use dropdown selectors for basic filtering.

**Steps**:
1. Select **Column**: Net, Group, Vnet1, or Vnet2
2. Select **Operator**: Equals, Contains, Starts With, etc.
3. Enter **Value**: The text to match
4. Click **Apply Filter**

**Example**:
- Column: `Vnet1`
- Operator: `Equals`
- Value: `VDD`
- Result: Shows all rows where Vnet1 = "VDD" **and all other rows in the same Group**

---

### **Expression Mode** (Advanced)

Use code-like expressions for complex filtering.

**Syntax**:
```
Column Operator Value
```

**Operators**:
| Operator | Symbol | Example |
|----------|--------|---------|
| Equals | `==` | `Vnet1==VDD` |
| Not Equals | `!=` | `Group!=1` |
| Contains | `~=` | `Net~=BANK` |
| Starts With | `^=` | `Net^=_DRAM` |
| Ends With | `$=` | `Net$=.net1` |

**Combine Conditions**:
| Logic | Symbol | Example |
|-------|--------|---------|
| AND | `&&` | `Vnet1==VDD && Vnet2==VEXT` |
| OR | `\|\|` | `Group==1 \|\| Group==2` |

---

## Expression Examples

### **Example 1: Exact Match with AND**
```
Vnet1==VDD && Vnet2==VEXT
```
**Result**: Shows all rows where Vnet1="VDD" AND Vnet2="VEXT", plus all other rows in the same Groups

### **Example 2: Multiple Groups with OR**
```
Group==1 || Group==2
```
**Result**: Shows all rows in Group 1 OR Group 2

### **Example 3: Partial Match**
```
Net~=BANK0
```
**Result**: Shows all rows with "BANK0" anywhere in the Net column, plus their entire Groups

### **Example 4: Prefix Match**
```
Net^=_DRAM.CH0
```
**Result**: Shows all rows where Net starts with "_DRAM.CH0", plus their entire Groups

### **Example 5: Combined Complex Filter**
```
Vnet1==VDD && Net~=RANK
```
**Result**: Shows all rows where Vnet1="VDD" AND Net contains "RANK", plus all other rows sharing those Groups

---

## Group Expansion Behavior

**All filters automatically expand to show entire Groups!**

### How It Works:

1. **Phase 1 - Direct Match**: Find rows matching your filter expression
2. **Phase 2 - Group Expansion**: Find the `Group` values from matched rows
3. **Result**: Show ALL rows that have any of those Group values

### Example:

**Data**:
```
Net             Group   Vnet1   Vnet2
_DRAM.net1      1       VDD     VEXT
_DRAM.net2      1       VDD     VSS
_DRAM.net3      2       VDDQ    VON
```

**Filter**: `Vnet1==VDD && Vnet2==VEXT`

**Direct Match**:
- `_DRAM.net1` (Group 1)

**Group Expansion**:
- Group 1 matched
- Also show: `_DRAM.net2` (Group 1)

**Result**: Both rows visible even though net2 doesn't match Vnet2==VEXT

---

## Tips

### **Quick Filter Workflow**
1. Use **Global Search** for quick text matching
2. Use **Simple Mode** for single-condition filters
3. Use **Expression Mode** for complex AND/OR logic

### **Switch Between Modes**
Click the tabs at the top of the Filter panel:
- `Simple` - Dropdown-based
- `Expression` - Code-based

Switching modes automatically clears the previous filter.

### **Clear Filters**
- Simple Mode: Click "Clear Filter" button
- Expression Mode: Click "Clear" button
- Global Search: Delete text from search box

---

## Visual Hierarchy

The **Net column** shows tree depth with visual connectors:

```
Net
├─ _DRAM              (depth 0, root)
│  └─ BANK0           (depth 1, child)
│     └─ net1         (depth 2, grandchild)
├─ _IO                (depth 0, root)
   └─ PAD0            (depth 1, child)
```

- **Indentation**: 24px per level
- **Connector**: Blue └─ symbol for children
- **Font**: JetBrains Mono (monospace)

---

## Keyboard Shortcuts

- `Enter` in Expression input → Apply filter
- `Ctrl+Shift+R` → Hard refresh (if Electron API errors occur)

---

## Troubleshooting

### "Electron API not available"
**Solution**: Restart dev server
```bash
npm run dev
```

### "Invalid expression"
**Check**:
- Column names must be: Net, Group, Vnet1, Vnet2 (case-sensitive)
- Operators must be: ==, !=, ~=, ^=, $=
- No spaces around operators (correct: `Vnet1==VDD`, wrong: `Vnet1 == VDD`)
- Use && for AND, || for OR

### Filter not working
**Check**:
1. Click "Apply Filter" or "Apply Expression" button
2. Check if any Groups were matched (shown in status)
3. Clear and reapply if needed

---

## Advanced Usage

### **Multi-Condition AND**
```
Vnet1==VDD && Vnet2==VEXT && Group==1
```
All three conditions must match for direct hit, then Group expansion applies.

### **Multi-Condition OR**
```
Net^=_DRAM || Net^=_IO
```
Rows starting with "_DRAM" OR "_IO", plus their Groups.

### **Combining with Search**
1. Type in **Global Search**: `BANK`
2. Then apply **Expression Filter**: `Vnet1==VDD`
3. Result: Rows must match BOTH search text AND expression filter

---

## Examples for DRAM Engineers

### **Find all VDD nets in channel 0**
```
Vnet1==VDD && Net~=CH0
```

### **Find all nets in specific banks**
```
Net~=BANK0 || Net~=BANK1
```

### **Find voltage mismatches**
```
Vnet1!=Vnet2
```
(Note: This requires adding support for column-to-column comparison - currently not supported)

---

**For more information, see the main README.md**
