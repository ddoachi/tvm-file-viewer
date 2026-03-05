# BH-Support CSV Viewer

A desktop application for importing and viewing CSV files in a hierarchical tree format with intelligent group-based filtering.

## Features

- 📁 **CSV Import**: Native file dialog for importing CSV files
- 🌲 **Tree View**: Hierarchical display based on Net column structure
- 🔍 **Group-Aware Filtering**: Custom filter that shows entire groups when any member matches
- 🎨 **Material Design**: Professional UI with MUI components
- ⚡ **High Performance**: AG Grid with virtualization for large datasets

## Tech Stack

- **Electron** 33.x - Desktop application framework
- **React** 19.x - UI library
- **TypeScript** 5.7 - Type safety
- **Vite** 6.x - Fast build tool
- **AG Grid Community** 33.x - Data grid with tree support
- **MUI** 6.x - Material Design components
- **Zustand** 5.x - State management
- **Papa Parse** 5.x - CSV parsing

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20.x)
- npm 9+

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

The app will launch in an Electron window with the Vite dev server running on port 5173 (configurable in `.env.development`).

### Build

```bash
# Type check
npm run typecheck

# Build for production
npm run build
```

## CSV Data Format

The application expects CSV files with the following columns:

```csv
Net,Group,Vnet1,Vnet2
_INST1.net1,1,VDD,VEXT
_INST2.net1,1,VDD,VEXT
_INST_TEST.net3,2,VDDQ,VON
```

### Column Descriptions

- **Net**: Hierarchical net identifier (e.g., `_INST1.net1` where `_INST1` is parent, `net1` is child)
- **Group**: Grouping identifier (numeric or string)
- **Vnet1**: First voltage net
- **Vnet2**: Second voltage net

### Tree Hierarchy

The tree structure is automatically derived from the **Net** column by splitting on `.`:
- `_INST1.net1` → Tree path: `['_INST1', 'net1']`
- `_BLOCK1.SUB1.net5` → Tree path: `['_BLOCK1', 'SUB1', 'net5']`

## Group-Aware Filtering

The custom filter system uses a two-phase algorithm:

### Phase 1: Direct Match
Evaluates the filter condition against all rows and collects matching rows.

### Phase 2: Group Expansion
Finds all `Group` values from matched rows, then includes **all rows** with those Group values.

### Example

Given this data:
```csv
Net,Group,Vnet1,Vnet2
_INST1.net1,1,VDD,VEXT
_INST2.net1,1,VDD,VEXT
_INST_TEST.net3,2,VDDQ,VON
```

**Filter**: `Vnet1` equals `VDD`

**Result**:
- Direct matches: `_INST1.net1` (Group=1)
- Group expansion: Shows **all** rows with Group=1 (both `_INST1.net1` and `_INST2.net1`)
- Hidden: `_INST_TEST.net3` (Group=2, no match)

### Supported Operators

- **Equals**: Exact match (case-insensitive)
- **Not Equals**: Does not match (case-insensitive)
- **Contains**: Substring match
- **Not Contains**: Does not contain substring
- **Starts With**: Prefix match
- **Ends With**: Suffix match
- **Is Empty**: Field is empty or whitespace
- **Is Not Empty**: Field has content

## Project Structure

```
bh-support/
├── src/
│   ├── main/              # Electron main process
│   │   └── index.ts       # Window lifecycle, IPC handlers
│   ├── preload/           # Electron preload script
│   │   └── index.ts       # IPC bridge (contextBridge)
│   └── renderer/          # React renderer process
│       ├── components/    # React components
│       │   ├── AppHeader.tsx
│       │   ├── DataGrid.tsx
│       │   ├── FilterPanel.tsx
│       │   └── StatusBar.tsx
│       ├── hooks/         # Custom React hooks
│       │   ├── useCsvImport.ts
│       │   └── useGroupFilter.ts
│       ├── services/      # Business logic
│       │   ├── csvParser.ts
│       │   ├── groupFilter.ts
│       │   └── treeTransformer.ts
│       ├── store/         # State management
│       │   └── appStore.ts
│       ├── theme/         # MUI theming
│       │   └── muiTheme.ts
│       ├── types/         # TypeScript types
│       │   └── index.ts
│       ├── App.tsx        # Root component
│       ├── main.tsx       # React entry point
│       └── index.html     # HTML template
├── electron-vite.config.ts
├── package.json
├── tsconfig.json
└── sample-data.csv        # Sample CSV for testing
```

## Development Notes

### Environment Variables

- `VITE_DEV_SERVER_PORT`: Dev server port (default: 5173)
- `ELECTRON_DISABLE_SANDBOX`: Set to `1` for Linux development (avoids SUID sandbox issues)

### TypeScript Configuration

- `tsconfig.json`: Base config with project references
- `tsconfig.node.json`: Node.js target for main/preload processes
- `tsconfig.web.json`: DOM target for renderer process

### Security

The app follows Electron security best practices:
- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Sandbox enabled
- ✅ IPC through preload contextBridge only
- ✅ No remote code execution

## Troubleshooting

### Linux: "The SUID sandbox helper binary was found, but is not configured correctly"

This is handled automatically by the `ELECTRON_DISABLE_SANDBOX=1` env var in the dev script. For production, either:
- Run `sudo chown root:root node_modules/electron/dist/chrome-sandbox`
- Run `sudo chmod 4755 node_modules/electron/dist/chrome-sandbox`
- Or keep sandbox disabled (not recommended for production)

### Missing X server or $DISPLAY

This occurs in headless environments. The app requires a display server (X11, Wayland) to run.

## License

MIT

## Credits

Built with [Claude Code](https://claude.com/claude-code) - Anthropic's AI-powered coding assistant.
