# Whiteboard Features

**Source:** https://reactflow.dev/learn/advanced-use/whiteboard
**Scraped:** 2025-10-13T10:08:12.179Z

---

# Whiteboard Features

React Flow is designed for building node-based UIs like workflow editors, flowcharts and diagrams. Even if React Flow is not made for creating whiteboard applications, you might want to integrate common whiteboard features. These examples show how to add drawing capabilities to your applications when you need to annotate or sketch alongside your nodes and edges.

## Examples[](#examples)

### ✏️ Freehand draw (Pro)[](#️-freehand-draw-pro)

Draw smooth curves on your React Flow pane. Useful for annotations or sketching around existing nodes.

**Features:**

*   Mouse/touch drawing
*   Adjustable brush size and color
*   converts drawn paths into custom nodes

**Common uses:**

*   Annotating flowcharts
*   Adding notes to diagrams
*   Sketching ideas around nodes

**This is a Pro example.** Get [all pro examples](/pro/examples), templates, 1:1 support from the xyflow team and prioritized Github issues with a React Flow Pro subscription.

[See Pricing Plans](/pro)[Sign In](https://pro.reactflow.dev/examples/react/freehand-draw)

### 🎯 Lasso selection[](#-lasso-selection)

Select multiple elements by drawing a freeform selection area with an option to include partially selected elements.

**Features:**

*   Freeform selection shapes
*   partial selection of elements

**Common uses:**

*   Selecting nodes and annotations together
*   Complex selections in mixed content

App.jsxLasso.tsxxy-theme.cssindex.cssutils.ts

``import { useCallback, useState } from 'react'; import {   ReactFlow,   useNodesState,   useEdgesState,   addEdge,   Controls,   Background,   Panel, } from '@xyflow/react'; import { Lasso } from './Lasso';   import '@xyflow/react/dist/style.css';   const initialNodes = [   {     id: '1',     position: { x: 0, y: 0 },     data: { label: 'Hello' },   },   {     id: '2',     position: { x: 300, y: 0 },     data: { label: 'World' },   }, ];   const initialEdges = [];   export default function LassoSelectionFlow() {   const [nodes, _, onNodesChange] = useNodesState(initialNodes);   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);   const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);     const [partial, setPartial] = useState(false);   const [isLassoActive, setIsLassoActive] = useState(true);     return (     <ReactFlow       nodes={nodes}       edges={edges}       onNodesChange={onNodesChange}       onEdgesChange={onEdgesChange}       onConnect={onConnect}       fitView     >       <Controls />       <Background />       {isLassoActive && <Lasso partial={partial} />}         <Panel position="top-left" className="lasso-controls">         <div className="xy-theme__button-group">           <button             className={`xy-theme__button ${isLassoActive ? 'active' : ''}`}             onClick={() => setIsLassoActive(true)}           >             Lasso Mode           </button>           <button             className={`xy-theme__button ${!isLassoActive ? 'active' : ''}`}             onClick={() => setIsLassoActive(false)}           >             Selection Mode           </button>         </div>           <label>           <input             type="checkbox"             checked={partial}             onChange={() => setPartial((p) => !p)}             className="xy-theme__checkbox"           />           Partial selection         </label>       </Panel>     </ReactFlow>   ); }``

### 🧹 Eraser[](#-eraser)

Remove items by “erasing” over them. Uses collision detection to determine what to delete.

**Features:**

*   Collision-based erasing
*   Visual eraser cursor

**Common uses:**

*   Removing parts of a flow

App.jsxErasableEdge.tsxErasableNode.tsxEraser.tsxxy-theme.cssindex.cssutils.ts

``import { useCallback, useState } from 'react'; import {   ReactFlow,   useNodesState,   useEdgesState,   addEdge,   Controls,   Background,   Panel, } from '@xyflow/react';   import { ErasableNode } from './ErasableNode'; import { ErasableEdge } from './ErasableEdge'; import { Eraser } from './Eraser';   import '@xyflow/react/dist/style.css';   const initialNodes = [   {     id: '1',     type: 'erasable-node',     position: { x: 0, y: 0 },     data: { label: 'Hello' },   },   {     id: '2',     type: 'erasable-node',     position: { x: 300, y: 0 },     data: { label: 'World' },   }, ];   const initialEdges = [   {     id: '1->2',     type: 'erasable-edge',     source: '1',     target: '2',   }, ];   const nodeTypes = {   'erasable-node': ErasableNode, };   const edgeTypes = {   'erasable-edge': ErasableEdge, };   const defaultEdgeOptions = {   type: 'erasable-edge', };   export default function EraserFlow() {   const [nodes, _, onNodesChange] = useNodesState(initialNodes);   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);   const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);     const [isEraserActive, setIsEraserActive] = useState(true);     return (     <ReactFlow       nodes={nodes}       nodeTypes={nodeTypes}       edges={edges}       edgeTypes={edgeTypes}       onNodesChange={onNodesChange}       onEdgesChange={onEdgesChange}       onConnect={onConnect}       fitView       defaultEdgeOptions={defaultEdgeOptions}     >       <Controls />       <Background />         {isEraserActive && <Eraser />}         <Panel position="top-left">         <div className="xy-theme__button-group">           <button             className={`xy-theme__button ${isEraserActive ? 'active' : ''}`}             onClick={() => setIsEraserActive(true)}           >             Eraser Mode           </button>           <button             className={`xy-theme__button ${!isEraserActive ? 'active' : ''}`}             onClick={() => setIsEraserActive(false)}           >             Selection Mode           </button>         </div>       </Panel>     </ReactFlow>   ); }``

### 📐 Rectangle draw[](#-rectangle-draw)

Create rectangular shapes by clicking and dragging. Good for highlighting areas or creating backgrounds for node groups.

**Features:**

*   Click-and-drag rectangle creation
*   Customizable colors

**Common uses:**

*   Creating background containers
*   Grouping related nodes visually
*   Highlighting sections of diagrams

App.jsxRectangleNode.tsxRectangleTool.tsxxy-theme.cssindex.css

``import { useCallback, useState } from 'react'; import {   ReactFlow,   useNodesState,   useEdgesState,   addEdge,   Controls,   Background,   Panel, } from '@xyflow/react';   import { RectangleNode } from './RectangleNode'; import { RectangleTool } from './RectangleTool';   import '@xyflow/react/dist/style.css';   const initialNodes = [   {     id: '1',     type: 'rectangle',     position: { x: 250, y: 5 },     data: { color: '#ff7000' },     width: 150,     height: 100,   }, ]; const initialEdges = [];   const nodeTypes = {   rectangle: RectangleNode, };   export default function RectangleFlow() {   const [nodes, _, onNodesChange] = useNodesState(initialNodes);   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);   const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);     const [isRectangleActive, setIsRectangleActive] = useState(true);     return (     <ReactFlow       nodes={nodes}       nodeTypes={nodeTypes}       edges={edges}       onNodesChange={onNodesChange}       onEdgesChange={onEdgesChange}       onConnect={onConnect}       fitView     >       <Controls />       <Background />         {isRectangleActive && <RectangleTool />}         <Panel position="top-left">         <div className="xy-theme__button-group">           <button             className={`xy-theme__button ${isRectangleActive ? 'active' : ''}`}             onClick={() => setIsRectangleActive(true)}           >             Rectangle Mode           </button>           <button             className={`xy-theme__button ${!isRectangleActive ? 'active' : ''}`}             onClick={() => setIsRectangleActive(false)}           >             Selection Mode           </button>         </div>       </Panel>     </ReactFlow>   ); }``

## Whiteboard libraries[](#whiteboard-libraries)

If you are looking for a more complete whiteboard solution, consider using libraries that are specifically designed for whiteboard applications like [tldraw](https://tldraw.dev/)  or [Excalidraw](https://docs.excalidraw.com/) . These libraries provide a full set of features for collaborative drawing, shapes, text, and more.