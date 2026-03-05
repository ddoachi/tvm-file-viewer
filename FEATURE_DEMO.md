# Boolean Formula Feature - Visual Demo

## Visual Layout

### Condition Blocks with Variable Labels

```
┌─────────────────────────────────────────────────────────────┐
│  [A]  Column: Vnet1  │  ==  │  Value: VDD        [Delete]  │
└─────────────────────────────────────────────────────────────┘
                            AND / OR
┌─────────────────────────────────────────────────────────────┐
│  [B]  Column: Vnet2  │  ==  │  Value: VEXT       [Delete]  │
└─────────────────────────────────────────────────────────────┘
                            AND / OR
┌─────────────────────────────────────────────────────────────┐
│  [C]  Column: Group  │  ==  │  Value: 1          [Delete]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Boolean Formula (Optional)                                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ A || (B && C)                                         │   │
│ └───────────────────────────────────────────────────────┘   │
│ Use A, B, C for conditions. Operators: && (AND), || (OR),  │
│ ! (NOT), () for grouping                                    │
└─────────────────────────────────────────────────────────────┘

[Add Condition]                     [Apply Filter]  [Clear]
```

### Variable Badge Design

```
 ┌──┐
 │ A │  Blue circle (#2D7FF9)
 └──┘  White text, 24px diameter, 12px bold font
```

## Usage Examples

### Example 1: Simple OR
**Goal**: Show rows where Vnet1==VDD OR Vnet2==VEXT

**Setup**:
- Condition A: `Vnet1 == VDD`
- Condition B: `Vnet2 == VEXT`
- Formula: `A || B`

**Result**: Displays rows matching either condition

### Example 2: Complex AND/OR
**Goal**: Show rows where Vnet1==VDD OR (Vnet2==VEXT AND Group==1)

**Setup**:
- Condition A: `Vnet1 == VDD`
- Condition B: `Vnet2 == VEXT`
- Condition C: `Group == 1`
- Formula: `A || (B && C)`

**Logic**:
```
IF Vnet1 is VDD
  → Include row
ELSE IF (Vnet2 is VEXT AND Group is 1)
  → Include row
ELSE
  → Exclude row
```

### Example 3: NOT Operator
**Goal**: Show rows where Vnet1 is NOT VDD

**Setup**:
- Condition A: `Vnet1 == VDD`
- Formula: `!A`

**Result**: Displays all rows except those where Vnet1==VDD

### Example 4: Complex Nested Logic
**Goal**: (A OR B) AND (C OR D)

**Setup**:
- Condition A: `Vnet1 == VDD`
- Condition B: `Vnet1 == VEXT`
- Condition C: `Group == 1`
- Condition D: `Group == 2`
- Formula: `(A || B) && (C || D)`

**Logic**:
```
Must satisfy BOTH:
1. Vnet1 is either VDD OR VEXT
2. Group is either 1 OR 2
```

## Error Handling

### Invalid Formula Examples

**Missing Operator**:
```
Formula: A B
Error: Expected operator between variables
```

**Undefined Variable**:
```
Conditions: A, B, C
Formula: A || D
Error: Invalid variables: D. Available: A, B, C
```

**Unmatched Parentheses**:
```
Formula: A || (B && C
Error: Expected ) but got EOF at position 13
```

**Invalid Operator**:
```
Formula: A & B
Error: Expected && but got &
```

## Operator Precedence

The parser follows standard boolean logic precedence:
1. **NOT** (`!`) - Highest precedence
2. **AND** (`&&`) - Medium precedence
3. **OR** (`||`) - Lowest precedence
4. **Parentheses** (`()`) - Override precedence

### Examples:

```
A || B && C
→ Evaluated as: A || (B && C)

!A || B
→ Evaluated as: (!A) || B

(A || B) && C
→ Parentheses override, evaluated left to right
```

## Comparison: Simple vs Formula

### Simple Mode (No Formula)
- Uses AND/OR toggle buttons between conditions
- All conditions use same connector
- Limited to simple patterns

**Example**: `A && B && C` (all must be true)

### Formula Mode
- Flexible boolean logic with parentheses
- Mix AND/OR operators
- Support for NOT operator
- Complex nested conditions

**Example**: `A || (B && C) || (!D && E)`

## Integration with Group Expansion

The formula feature works seamlessly with group expansion:

1. **Evaluate Formula**: Determine which parent rows match
2. **Apply Group Expansion**: Include all child rows of matched groups
3. **Display Result**: Show matched rows + expanded children

**Example**:
```
Formula matches: Row 5 (Group 1, parent)
Group expansion includes:
  - Row 5 (parent)
  - Row 6 (child of Group 1)
  - Row 7 (child of Group 1)
```

## Performance Considerations

- Formula parsing: O(n) where n = formula length
- Evaluation per row: O(m) where m = number of conditions
- Total filter time: O(rows × conditions)
- Typical performance: <100ms for 10,000 rows with 5 conditions

## Browser Compatibility

The formula parser uses standard JavaScript features:
- String manipulation
- Map/Set for variable tracking
- Closures for evaluation functions
- No external dependencies

Works in all modern browsers supporting ES6+.

## Accessibility

- Keyboard navigation supported
- Screen reader compatible
- Clear error messages
- High contrast variable badges
- Focus indicators on all inputs
