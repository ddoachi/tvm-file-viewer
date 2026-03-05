# Boolean Formula Feature - Implementation Summary

## Overview
Enhanced Visual Filter Builder with variable labels and advanced boolean logic support.

## Features Implemented

### 1. Variable Labels on Condition Blocks
- **File**: `src/renderer/components/ConditionBlock.tsx`
- **Changes**:
  - Added `variable?: string` prop to ConditionBlockProps
  - Displays variable in a blue circle badge (24px diameter)
  - Style: `#2D7FF9` background, white text, 12px bold font
  - Positioned at the left of each condition block

### 2. Formula Input Field
- **File**: `src/renderer/components/FilterBuilder.tsx`
- **Changes**:
  - Auto-assigns variables: A, B, C, D, ..., Z, AA, AB, etc.
  - Added TextField for boolean formula input
  - Label: "Boolean Formula (Optional)"
  - Placeholder: "e.g., A || (B && C)"
  - Helper text: "Use A, B, C for conditions. Operators: && (AND), || (OR), ! (NOT), () for grouping"
  - Error validation and display

### 3. Formula Parser Service
- **File**: `src/renderer/services/formulaParser.ts`
- **Features**:
  - Parses boolean formulas like "A || (B && C)"
  - Supports operators: `&&` (AND), `||` (OR), `!` (NOT)
  - Supports parentheses for grouping
  - Validates variable names against available conditions
  - Returns evaluation function for runtime filtering
  - Includes `indexToVariable()` for A, B, C, ..., Z, AA, AB generation

### 4. Filter Integration
- **File**: `src/renderer/components/FilterPanel.tsx`
- **Changes**:
  - Handles formula-based filtering in `handleVisualApply()`
  - Evaluates each condition (A, B, C) for each row
  - Applies boolean formula to determine row inclusion
  - Applies group expansion to final result
  - Shows error messages for invalid formulas

## Formula Syntax

### Operators
- `&&` - AND (both conditions must be true)
- `||` - OR (at least one condition must be true)
- `!` - NOT (negates a condition)
- `()` - Parentheses for grouping

### Examples
```
A || (B && C)
(A || B) && (C || D)
A && !B
!(A || B) && C
```

## Example Workflow

### Scenario
Create filter: Show rows where (Vnet1==VDD) OR (Vnet2==VEXT AND Group==1)

### Steps
1. Add Condition A: `Vnet1 == VDD`
2. Add Condition B: `Vnet2 == VEXT`
3. Add Condition C: `Group == 1`
4. Enter formula: `A || (B && C)`
5. Click "Apply Filter"

### Result
- Condition A is evaluated: Vnet1 == VDD → boolean
- Condition B is evaluated: Vnet2 == VEXT → boolean
- Condition C is evaluated: Group == 1 → boolean
- Formula is evaluated: A OR (B AND C) → final boolean
- Rows matching the formula are shown
- Group expansion is applied to include child rows

## Visual Design

### Variable Badges
```css
{
  width: 24px,
  height: 24px,
  borderRadius: '50%',
  backgroundColor: '#2D7FF9',
  color: 'white',
  fontSize: 12px,
  fontWeight: 700
}
```

### Formula Input
- Full width below condition blocks
- Monospace font for better readability
- Real-time error validation
- Red error message when formula is invalid

## Technical Details

### Formula Encoding
When formula is used, the filter expression is encoded as:
```
FORMULA:{formula}:{cond1}|||{cond2}|||{cond3}
```

Example:
```
FORMULA:A || (B && C):Vnet1==VDD|||Vnet2==VEXT|||Group==1
```

### Evaluation Process
1. Parse formula string into AST
2. For each row:
   - Evaluate each condition (A, B, C) against row data
   - Create variable map: `Map<"A"|"B"|"C", boolean>`
   - Evaluate formula AST with variable map
   - Include row if formula evaluates to true
3. Apply group expansion to matched rows

### Parser Implementation
- **Lexer**: Tokenizes formula string
- **Parser**: Builds evaluation function using recursive descent
- **Grammar**:
  ```
  expression := orExpr
  orExpr := andExpr ('||' andExpr)*
  andExpr := notExpr ('&&' notExpr)*
  notExpr := '!' notExpr | primary
  primary := '(' expression ')' | VAR
  ```

## Testing

### Unit Tests
- **File**: `tests/formulaParser.test.ts`
- **Coverage**:
  - Variable name generation (A-Z, AA-ZZ)
  - Simple formulas (A, A && B, A || B)
  - Complex formulas with parentheses
  - NOT operator
  - Invalid formula detection
  - Formula evaluation with different truth values

### Test Results
```
✅ ALL FORMULA PARSER TESTS PASSED
- Variable generation: A, B, C, ..., Z, AA, AB
- Simple formulas: A, A && B, A || B
- Complex formulas: A || (B && C), (A || B) && C
- NOT operator: !A, !(A || B)
- Invalid detection: incomplete, wrong operators, undefined variables
- Evaluation: All truth table combinations verified
```

## Files Modified

1. **src/renderer/services/formulaParser.ts** - NEW
   - Formula parser implementation
   - Variable name generation
   - Evaluation function creation

2. **src/renderer/components/ConditionBlock.tsx**
   - Added variable prop
   - Added variable badge display

3. **src/renderer/components/FilterBuilder.tsx**
   - Added formula state and error handling
   - Added formula TextField
   - Integrated variable assignment
   - Updated apply logic for formulas

4. **src/renderer/components/FilterPanel.tsx**
   - Added formula parsing logic
   - Added formula evaluation for rows
   - Integrated with group expansion

5. **tests/formulaParser.test.ts** - NEW
   - Comprehensive test suite for formula parser

## Verification

### Build Status
```bash
npm run build
# ✓ built in 2.05s
# No TypeScript errors
```

### Test Status
```bash
npm run test
# ✅ ALL TESTS PASSED
```

### Formula Parser Tests
```bash
npx tsx tests/formulaParser.test.ts
# ✅ ALL FORMULA PARSER TESTS PASSED
```

## Future Enhancements

Possible improvements:
1. Syntax highlighting for formula operators
2. Autocomplete for variable names
3. Formula validation in real-time
4. Visual formula builder (drag-and-drop logic gates)
5. Save/load common formulas
6. Formula history/templates
