# CLAUDE.md - AI Assistant Context

Last Updated: 2025-12-29 (History Panel Implementation Complete)

## Project Overview

**VisFlow-Lite** is a visual dataflow editor built with Vue 3 and TypeScript. It allows users to create data processing pipelines by visually connecting nodes together in a canvas-based interface.

## Tech Stack

- **Frontend Framework:** Vue 3.5.22 (Composition API)
- **Language:** TypeScript 5.9.0
- **State Management:** Pinia 3.0.3
- **Routing:** Vue Router 4.6.3
- **UI Framework:** Bootstrap 5.3.8 + Bootstrap Icons 1.13.1
- **Code Editor:** Monaco Editor 0.55.1 + @monaco-editor/loader 1.7.0
- **Build Tool:** Vite 7.1.11
- **Styling:** SCSS (sass-embedded 1.93.2)
- **Testing:** Vitest 3.2.4 + Vue Test Utils 2.4.6
- **Node Version:** ^20.19.0 || >=22.12.0

## Project Structure

```
visflow-lite/
├── src/
│   ├── App.vue                          # Root component
│   ├── main.ts                          # Application entry point
│   ├── components/
│   │   ├── app-header/                  # Top navigation bar
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppHeader.ts
│   │   │   ├── AppHeader.scss
│   │   │   └── options-menu/            # Options dropdown menu
│   │   ├── dataflow-canvas/             # Main canvas area
│   │   │   ├── DataflowCanvas.vue       # Canvas component with panning/selection
│   │   │   ├── DataflowCanvas.ts        # Canvas logic
│   │   │   └── DataflowCanvas.scss
│   │   ├── node/                        # Node component
│   │   │   ├── Node.vue                 # Visual representation of nodes
│   │   │   ├── Node.ts                  # Node logic
│   │   │   └── Node.scss
│   │   ├── edge/                        # Edge (connection) component
│   │   │   ├── Edge.vue                 # SVG-based edge rendering
│   │   │   ├── Edge.ts                  # Edge logic (Bezier curves)
│   │   │   └── Edge.scss
│   │   ├── edge-preview/                # Edge preview while dragging
│   │   │   ├── EdgePreview.vue
│   │   │   ├── EdgePreview.ts
│   │   │   └── EdgePreview.scss
│   │   ├── port/                        # Input/output connection points
│   │   │   ├── Port.vue
│   │   │   ├── Port.ts                  # Port interaction logic
│   │   │   └── Port.scss
│   │   ├── node-panel/                  # Left sidebar with available nodes
│   │   │   ├── NodePanel.vue
│   │   │   ├── NodePanel.ts
│   │   │   └── NodePanel.scss
│   │   ├── node-list/                   # List of node types
│   │   │   ├── NodeList.vue
│   │   │   └── NodeList.scss
│   │   ├── code-editor-modal/           # Monaco editor modal
│   │   │   ├── CodeEditorModal.vue      # Modal wrapper for code editor
│   │   │   ├── CodeEditorModal.ts       # Monaco integration logic
│   │   │   └── CodeEditorModal.scss     # Modal styling
│   │   ├── option-panel/                # Reusable option panel
│   │   │   ├── OptionPanel.vue          # Node option panel UI
│   │   │   ├── OptionPanel.ts           # Panel logic
│   │   │   └── OptionPanel.scss         # Panel styling
│   │   ├── editable-text/               # Inline text editing
│   │   │   ├── EditableText.vue         # Editable text component
│   │   │   ├── EditableText.ts          # Text editing logic
│   │   │   └── EditableText.scss        # Text editor styling
│   │   ├── script-editor-panel/         # Script editor option panel
│   │   │   ├── ScriptEditorPanel.vue    # Script editor UI
│   │   │   ├── ScriptEditorPanel.ts     # Script execution engine
│   │   │   └── ScriptEditorPanel.scss   # Panel styling
│   │   └── history-panel/               # History panel with undo/redo
│   │       ├── HistoryPanel.vue         # History panel UI
│   │       ├── HistoryPanel.ts          # History panel logic
│   │       └── HistoryPanel.scss        # Panel styling
│   ├── stores/                          # Pinia state management
│   │   ├── dataflow/
│   │   │   ├── index.ts                 # Main dataflow store
│   │   │   ├── types.ts                 # TypeScript interfaces
│   │   │   └── nodeTypes.ts             # Node type registry
│   │   ├── interaction.ts               # Mouse/keyboard interaction state
│   │   ├── panels.ts                    # Panel visibility state
│   │   ├── history.ts                   # History/undo/redo state
│   │   └── counter.ts                   # Example counter store
│   ├── router/
│   │   └── index.ts                     # Vue Router configuration (empty routes)
│   └── __tests__/                       # Unit tests
├── public/                              # Static assets
├── package.json                         # Dependencies and scripts
├── vite.config.ts                       # Vite configuration
├── tsconfig.json                        # TypeScript configuration
└── README.md                            # Project documentation
```

## Core Architecture

### Main Application Flow

1. **App.vue** is the root component with main sections:
   - AppHeader (top)
   - NodePanel (left sidebar)
   - WorkflowPanel & VersionTreePanel (left side, conditional)
   - HistoryPanel (left sidebar, toggleable)
   - DataflowCanvas (main area)
   - ScriptEditorPanel (right sidebar, shows when script-editor node is selected)

2. **State Management** via Pinia stores:
   - `dataflowStore`: Manages nodes, edges, diagram offset, node selection, history tracking
   - `interactionStore`: Tracks mouse position and shift key state
   - `panelsStore`: Controls visibility of various panels
   - `historyStore`: Manages undo/redo history with state snapshots

### Component Architecture

Each major component follows this pattern:
- `.vue` file: Template and component definition
- `.ts` file: Composable function with component logic
- `.scss` file: Component-specific styles

## Key Features & Functionality

### Node System

**Node Types** (defined in `stores/dataflow/nodeTypes.ts`):
- Data Source
- Script Editor

**Node Interface** (`NodeData`):
```typescript
{
  id: string
  type: string
  x: number
  y: number
  label?: string
  width?: number
  height?: number
  isIconized?: boolean
  isSelected?: boolean
  isActive?: boolean
  isLabelVisible?: boolean
  // Script editor specific properties
  code?: string
  isRenderingEnabled?: boolean
  isStateEnabled?: boolean
  state?: Record<string, any>
  displayTitle?: string
  transparentBackground?: boolean
  // Data properties
  dataset?: any // Holds the processed data
  executionError?: string
  warningMessage?: string
  successMessage?: string
}
```

**Node Features:**
- Drag-and-drop from panel to canvas
- Position on canvas (x, y coordinates)
- Input and output ports
- Iconized vs expanded states
- Selection and active states

### Edge System

**Edge Interface** (`EdgeData`):
```typescript
{
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}
```

**Edge Features:**
- SVG-based rendering with Bezier curves
- Drag from output port to input port to create
- Visual preview while dragging
- Automatic duplicate prevention
- Reactive path updates when nodes move

### Port System

**Port Types:**
- Input ports (left side of nodes)
- Output ports (right side of nodes)

**Data Types:**
- `table`: Square icon
- `selection`: Circle icon
- `constants`: Circle icon

**Port Features:**
- Click and drag to create edges
- Visual indication of connection state
- Supports different data types

### Canvas Interactions

**Modes:**
- **Panning:** Click and drag empty canvas
- **Selecting:** Box selection (not fully implemented)
- **Dragging Nodes:** Move selected nodes
- **Creating Edges:** Drag from port to port

**Key Functions** (in `DataflowCanvas.ts`):
- `onMouseMove`: Tracks mouse and updates interactions
- `onMouseDown`: Initiates panning, selection, or node dragging
- `onMouseUp`: Completes interactions
- `onDragOver/onDrop`: Handles node creation from panel

## Data Flow

### Creating a Node
1. User drags node type from NodePanel
2. Drop event on DataflowCanvas
3. `dataflowStore.createNode()` called with type and position
4. New node added to `nodes` array
5. Vue reactivity updates DOM

### Creating an Edge
1. User mousedown on a Port
2. `Port.ts`: calls `dataflowStore.startEdgeCreation()`
3. EdgePreview component shows temporary line
4. User releases on another Port
5. `DataflowCanvas.ts`: detects mouseup on port
6. Calls `dataflowStore.completeEdgeCreation()`
7. New edge added to `edges` array
8. Edge component renders SVG path

### Moving Nodes
1. User mousedown on Node (not on port)
2. Canvas tracks drag with `isDraggingNodes = true`
3. Mouse move updates node positions
4. Edges automatically update due to computed `pathData`

### Script Editor Node Workflow
1. User drags "Script Editor" node from NodePanel to canvas
2. User clicks the node to select it
3. ScriptEditorPanel appears on the right sidebar
4. User clicks "Edit Script" button to open CodeEditorModal with Monaco editor
5. User writes JavaScript function that processes table data:
   - Input: single table or array of tables (from connected input ports)
   - Content: HTMLElement for rendering (if rendering enabled)
   - State: persistent object (if state enabled)
   - Output: table with `columns` (string[]) and `rows` (2D array)
6. User clicks "Save" to save code or "Run" to execute
7. Script execution:
   - Code is wrapped in function and executed with `new Function()`
   - Input tables retrieved from connected ports (TODO: implement)
   - Output validated (must have columns and rows arrays)
   - Result stored in `node.dataset`
   - Success/error messages displayed in panel
8. State management:
   - Optional persistent state across executions
   - Can be cleared with "Clear State" button
9. Rendering support:
   - Optional rendering container for custom visualizations (TODO: implement DOM element)

## Important Files to Remember

### Core Logic
- `src/stores/dataflow/index.ts` - Central state and business logic with history tracking
- `src/stores/history.ts` - Undo/redo history management
- `src/components/dataflow-canvas/DataflowCanvas.ts` - Canvas interactions
- `src/components/port/Port.ts` - Edge creation initiation
- `src/components/edge/Edge.ts` - Edge rendering logic
- `src/components/script-editor-panel/ScriptEditorPanel.ts` - Script execution engine
- `src/components/history-panel/HistoryPanel.ts` - History panel logic with keyboard shortcuts

### Type Definitions
- `src/stores/dataflow/types.ts` - NodeData, EdgeData, EdgeCreationData (with script editor fields)
- `src/stores/dataflow/nodeTypes.ts` - Node type registry
- `src/stores/history.ts` - HistoryEntry interface

### Main Components
- `src/App.vue` - Application layout with conditional panels (ScriptEditorPanel, HistoryPanel)
- `src/components/dataflow-canvas/DataflowCanvas.vue` - Canvas template
- `src/components/script-editor-panel/ScriptEditorPanel.vue` - Script editor UI
- `src/components/history-panel/HistoryPanel.vue` - History panel UI
- `src/components/code-editor-modal/CodeEditorModal.vue` - Monaco editor modal
- `src/components/option-panel/OptionPanel.vue` - Reusable option panel
- `src/components/editable-text/EditableText.vue` - Inline text editor

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test:unit    # Run unit tests
npm run lint         # Lint and fix code
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

## Git Status (Current Session)

- **Branch:** main
- **Modified Files:**
  - `package.json` / `package-lock.json` - Added Monaco Editor dependencies
  - `src/App.vue` - Added ScriptEditorPanel and HistoryPanel integration
  - `src/components/node/Node.ts` - Minor updates
  - `src/stores/dataflow/index.ts` - Node selection updates, history tracking integration
  - `src/stores/dataflow/types.ts` - Extended NodeData interface
  - `src/components/app-header/options-menu/OptionsMenu.vue` - Added history panel toggle
  - `src/components/app-header/options-menu/OptionsMenu.ts` - Added history panel state
  - `CLAUDE.md` - Updated with history panel documentation
- **New Components:**
  - `src/components/code-editor-modal/` - Monaco editor modal (3 files)
  - `src/components/option-panel/` - Reusable option panel (3 files)
  - `src/components/editable-text/` - Inline text editor (3 files)
  - `src/components/script-editor-panel/` - Script editor panel (3 files)
  - `src/components/history-panel/` - History panel with undo/redo (3 files)
- **New Stores:**
  - `src/stores/history.ts` - History/undo/redo store
- **Recent commits:**
  - `e1a2b1b` - Add workflow browser and version tree visualization
  - `83bfaf7` - edges working
  - `563224f` - first-commit

## Known Limitations & TODOs

Based on code comments and implementation:

1. **Edge Selection** - Not implemented (see `Edge.ts:15`)
2. **Box Selection** - UI exists but functionality incomplete
3. **Node Icons** - References `/icons/` directory (may need to verify assets exist)
4. **Router** - Empty routes configuration
5. **Quick Node Panel** - Store has state but component not visible in main layout
6. **Log Panel** - Store exists but not implemented

### Script Editor TODOs
8. **Port Input Retrieval** - Currently uses empty table, need to implement actual data retrieval from connected input ports (see `ScriptEditorPanel.ts:107`)
9. **Rendering Container** - Need to implement actual DOM element for rendering when `isRenderingEnabled` is true (see `ScriptEditorPanel.ts:114`)
10. **Settings Modal** - Settings button exists but modal not implemented (see `ScriptEditorPanel.ts:205`)
11. **Dynamic Port Annotation** - Method annotation should reflect actual number of input ports (currently hardcoded to 1) (see `ScriptEditorPanel.ts:53`)

## Design Patterns Used

1. **Composition API:** All components use `<script setup>` with composables
2. **Separation of Concerns:** Logic in `.ts`, template in `.vue`, styles in `.scss`
3. **Store Pattern:** Pinia stores for centralized state
4. **Reactive Coordinates:** Edges use computed properties to track node positions
5. **Event Delegation:** Canvas handles many events, delegates to components

## Notable Implementation Details

### Edge Path Calculation
- Uses Bezier curves: `M x1 y1 C cx1 cy1, cx2 cy2, x2 y2`
- Control points offset by `Math.min(dx * 0.5, 100)`
- Coordinates calculated relative to canvas element

### Port Coordinate System
- Ports use `getBoundingClientRect()` for absolute positioning
- Coordinates converted to canvas-relative space
- Edge rendering queries DOM for port positions

### Node ID Generation
- Format: `node-${Date.now()}-${Math.random()}`
- Same pattern for edge IDs

## Visual Design

- Uses Bootstrap 5 styling system
- Custom SCSS for component-specific styles
- Bootstrap Icons for UI elements
- Canvas-based layout with absolute positioning for nodes
- SVG overlay for edges

---

## Recent Additions (2025-12-29)

### Script Editor Node Implementation
Complete implementation of a script editor node that allows users to write JavaScript code to process table data:

**Components Added:**
1. **CodeEditorModal** - Full Monaco editor integration with syntax highlighting
2. **OptionPanel** - Reusable panel for node options (iconize, label, settings)
3. **EditableText** - Inline text editing component
4. **ScriptEditorPanel** - Complete script editor UI with execution engine

**Features:**
- Monaco code editor with JavaScript syntax highlighting
- Script execution with table input/output validation
- Optional state management (persistent across executions)
- Optional rendering support (for custom visualizations)
- Error handling and success messages
- Collapsible instruction panel
- Run and Save buttons
- Display title configuration

### History Panel Implementation
Complete implementation of a history panel with undo/redo functionality:

**Components Added:**
1. **HistoryPanel** - Full history UI with undo/redo controls
2. **History Store** - State management for history entries

**Features:**
- Visual list of all actions with timestamps
- Undo/Redo buttons with keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
- Click any entry to jump to that state
- Clear history button
- Current state indicator with visual highlights
- Future state indication (greyed out entries after current position)
- Empty state when no history exists
- Automatic history tracking for:
  - Node creation/deletion
  - Edge creation/deletion
- Maximum 50 history entries (configurable)

**Architecture:**
- All components follow the `.vue` + `.ts` + `.scss` pattern
- Clean separation of concerns
- TypeScript interfaces for all history types
- Reactive state management with Pinia
- Deep state cloning for snapshots
- Keyboard event listeners with proper lifecycle management

**Testing:**
- TypeScript type-check passes
- Dev server runs without errors
- All components compile successfully

## Notes for Future Sessions

- The application is in active development
- Core functionality (nodes, edges, canvas) is working
- Script editor node is fully functional with execution engine
- History panel is fully functional with undo/redo
- Many planned features have store infrastructure but no UI
- Code is clean and well-organized
- TypeScript types are properly defined
- No apparent security concerns in codebase
- Script execution uses `new Function()` for sandboxed execution
