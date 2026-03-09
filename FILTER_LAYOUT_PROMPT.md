# Filter Panel Layout Redesign

## Context

This is an Electron + React + MUI + AG Grid Enterprise app (Total Voltage Manager) for DRAM design engineers. It displays voltage netlist data in a tree grid with ~1M rows. Above the grid is a **filter panel** where users build boolean filter conditions.

## Current Filter UI Components

Each filter condition has:
- **Variable badge** (A, B, C...) — small circle
- **Column** dropdown — one of: Net, Group, Vnet1, Vnet2
- **Operator** dropdown — ==, !=, ~=, ^=, $= (with colored symbol badges)
- **Value** autocomplete — free text or pick from column values (short values like VDD, VEXT, VSS)
- **Delete** button — remove this condition

Below the conditions:
- **[+ Add]** button — add another condition
- **Formula** text field — boolean expression using condition variables, e.g. `A && B`, `A || (B && !C)`
- **Run** button — execute the filter
- **Clear** button — reset

## Layout Problem

The current vertical layout wastes space and looks unbalanced:

```
(A) [Column ▼ ] [Operator ▼    ] [Value      ] [🗑]
[+ Add]
                                      Formula: [A && B] [▶] [✕]
```

Issues:
1. The condition row is full-width, but Column/Operator/Value fields are all short values — they don't need much width.
2. The `[+ Add]` button sits alone on its own row — wastes vertical space.
3. The `Formula` + action buttons are pushed to the far right of the bottom row, creating a visual gap between the `[+ Add]` and `Formula`.
4. With multiple conditions, the panel grows tall and pushes the AG Grid down.
5. Overall the layout feels sparse and disconnected.

## Constraints

- Must support 1-6+ conditions (variable height)
- Formula field uses short expressions (A, B, A && B, etc.)
- Column values are short (Net, Group, Vnet1, Vnet2)
- Operator values are short (==, !=, ~=, ^=, $=)
- Value field values are short (VDD, VEXT, VSS, etc.)
- Panel should be collapsible (currently using MUI Accordion)
- No page-level scrollbar — only AG Grid scrolls internally
- MUI components (Autocomplete, TextField, IconButton, etc.)
- The panel should be compact to maximize grid space

## What I'm Looking For

A better layout arrangement for the filter panel that:
- Is compact and visually balanced
- Groups related elements logically
- Minimizes vertical space usage
- Looks good with both 1 condition and 4+ conditions
- Uses the available horizontal space better

Please suggest a layout mockup (ASCII art or description) and explain the rationale.
