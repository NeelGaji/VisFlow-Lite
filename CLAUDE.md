# CLAUDE.md - AI Assistant Context

Last Updated: 2025-12-29

## Project Overview

**VisFlow-Lite** is a visual dataflow editor built with Vue 3 and TypeScript. It allows users to create data processing pipelines by visually connecting nodes together in a canvas-based interface.

## Tech Stack

- **Frontend Framework:** Vue 3.5.22 (Composition API)
- **Language:** TypeScript 5.9.0
- **State Management:** Pinia 3.0.3
- **Routing:** Vue Router 4.6.3
- **UI Framework:** Bootstrap 5.3.8 + Bootstrap Icons 1.13.1
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
│   │   └── node-list/                   # List of node types
│   │       ├── NodeList.vue
│   │       └── NodeList.scss
│   ├── stores/                          # Pinia state management
│   │   ├── dataflow/
│   │   │   ├── index.ts                 # Main dataflow store
│   │   │   ├── types.ts                 # TypeScript interfaces
│   │   │   └── nodeTypes.ts             # Node type registry
│   │   ├── interaction.ts               # Mouse/keyboard interaction state
│   │   ├── panels.ts                    # Panel visibility state
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

1. **App.vue** is the root component with 3 main sections:
   - AppHeader (top)
   - NodePanel (left sidebar)
   - DataflowCanvas (main area)

2. **State Management** via Pinia stores:
   - `dataflowStore`: Manages nodes, edges, diagram offset
   - `interactionStore`: Tracks mouse position and shift key state
   - `panelsStore`: Controls visibility of various panels

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

## Important Files to Remember

### Core Logic
- `src/stores/dataflow/index.ts` - Central state and business logic
- `src/components/dataflow-canvas/DataflowCanvas.ts` - Canvas interactions
- `src/components/port/Port.ts` - Edge creation initiation
- `src/components/edge/Edge.ts` - Edge rendering logic

### Type Definitions
- `src/stores/dataflow/types.ts` - NodeData, EdgeData, EdgeCreationData
- `src/stores/dataflow/nodeTypes.ts` - Node type registry

### Main Components
- `src/App.vue` - Application layout
- `src/components/dataflow-canvas/DataflowCanvas.vue` - Canvas template

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

## Git Status (at session start)

- **Branch:** main
- **Status:** Clean working directory
- **Recent commits:**
  - `83bfaf7` - edges working
  - `563224f` - first-commit

## Known Limitations & TODOs

Based on code comments and implementation:

1. **Edge Selection** - Not implemented (see `Edge.ts:15`)
2. **Box Selection** - UI exists but functionality incomplete
3. **Node Icons** - References `/icons/` directory (may need to verify assets exist)
4. **Router** - Empty routes configuration
5. **Quick Node Panel** - Store has state but component not visible in main layout
6. **History Panel** - Store exists but not implemented
7. **Log Panel** - Store exists but not implemented

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

## Notes for Future Sessions

- The application is in early development stage
- Core functionality (nodes, edges, canvas) is working
- Many planned features have store infrastructure but no UI
- Code is clean and well-organized
- TypeScript types are properly defined
- No apparent security concerns in codebase
