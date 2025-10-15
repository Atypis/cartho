# Theming

**Source:** https://reactflow.dev/learn/customization/theming
**Scraped:** 2025-10-13T10:07:58.356Z

---

# Theming

React Flow has been built with deep customization in mind. Many of our users fully transform the look and feel of React Flow to match their own brand or design system. This guide will introduce you to the different ways you can customize React Flow’s appearance.

## Default styles[](#default-styles)

React Flow’s default styles are enough to get going with the built-in nodes. They provide some sensible defaults for styles like padding, border radius, and animated edges. You can see what they look like below:

App.tsxindex.cssindex.tsx

`import React, { useCallback } from 'react'; import {   ReactFlow,   Background,   Controls,   MiniMap,   useNodesState,   useEdgesState,   addEdge,   Position, } from '@xyflow/react';   import '@xyflow/react/dist/style.css';     const nodeDefaults = {   sourcePosition: Position.Right,   targetPosition: Position.Left, };   const initialNodes = [   {     id: '1',     position: { x: 0, y: 150 },     data: { label: 'default style 1' },     ...nodeDefaults,   },   {     id: '2',     position: { x: 250, y: 0 },     data: { label: 'default style 2' },     ...nodeDefaults,   },   {     id: '3',     position: { x: 250, y: 150 },     data: { label: 'default style 3' },     ...nodeDefaults,   },   {     id: '4',     position: { x: 250, y: 300 },     data: { label: 'default style 4' },     ...nodeDefaults,   }, ];   const initialEdges = [   {     id: 'e1-2',     source: '1',     target: '2',     animated: true,   },   {     id: 'e1-3',     source: '1',     target: '3',   },   {     id: 'e1-4',     source: '1',     target: '4',   }, ];   const Flow = () => {   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);     const onConnect = useCallback(     (params) => setEdges((els) => addEdge(params, els)),     [],   );     return (     <ReactFlow       nodes={nodes}       edges={edges}       onNodesChange={onNodesChange}       onEdgesChange={onEdgesChange}       onConnect={onConnect}       fitView     >       <Background />       <Controls />       <MiniMap />     </ReactFlow>   ); };   export default Flow;`

You’ll typically load these default styles by importing them in you `App.jsx` file or other entry point:

`import '@xyflow/react/dist/style.css';`

Without dipping into [custom nodes](/examples/nodes/custom-node) and [edges](/examples/edges/custom-edges), there are three ways you can style React Flow’s basic look:

*   Passing inline styles through `style` props
*   Overriding the built-in classes with custom CSS
*   Overriding the CSS variables React Flow uses

### Built in dark and light mode[](#built-in-dark-and-light-mode)

You can choose one of the built-in color modes by using the `colorMode` prop (‘dark’, ‘light’ or ‘system’) as seen in the [dark mode example](/examples/styling/dark-mode).

`import ReactFlow from '@xyflow/react';   export default function Flow() {   return <ReactFlow colorMode="dark" nodes={[...]} edges={[...]} /> }`

When you use the `colorMode` prop, React Flow adds a class to the root element (`.react-flow`) that you can use to style your flow based on the color mode:

`.dark .react-flow__node {   background: #777;   color: white; }   .light .react-flow__node {   background: white;   color: #111; }`

### Customizing with `style` props[](#customizing-with-style-props)

The easiest way to start customizing the look and feel of your flows is to use the `style` prop found on many of React Flow’s components to inline your own CSS.

`import ReactFlow from '@xyflow/react'   const styles = {   background: 'red',   width: '100%',   height: 300, };   export default function Flow() {   return <ReactFlow style={styles} nodes={[...]} edges={[...]} /> }`

### CSS variables[](#css-variables)

If you don’t want to replace the default styles entirely but just want to tweak the overall look and feel, you can override some of the CSS variables we use throughout the library. For an example of how to use these CSS variables, check out our [Feature Overview](/examples/overview) example.

These variables are mostly self-explanatory. Below is a table of all the variables you might want to tweak and their default values for reference:

Variable name

Default

`--xy-edge-stroke-default`

`#b1b1b7`

`--xy-edge-stroke-width-default`

`1`

`--xy-edge-stroke-selected-default`

`#555`

`--xy-connectionline-stroke-default`

`#b1b1b7`

`--xy-connectionline-stroke-width-default`

`1`

`--xy-attribution-background-color-default`

`rgba(255, 255, 255, 0.5)`

`--xy-minimap-background-color-default`

`#fff`

`--xy-background-pattern-dots-color-default`

`#91919a`

`--xy-background-pattern-line-color-default`

`#eee`

`--xy-background-pattern-cross-color-default`

`#e2e2e2`

`--xy-node-color-default`

`inherit`

`--xy-node-border-default`

`1px solid #1a192b`

`--xy-node-background-color-default`

`#fff`

`--xy-node-group-background-color-default`

`rgba(240, 240, 240, 0.25)`

`--xy-node-boxshadow-hover-default`

`0 1px 4px 1px rgba(0, 0, 0, 0.08)`

`--xy-node-boxshadow-selected-default`

`0 0 0 0.5px #1a192b`

`--xy-handle-background-color-default`

`#1a192b`

`--xy-handle-border-color-default`

`#fff`

`--xy-selection-background-color-default`

`rgba(0, 89, 220, 0.08)`

`--xy-selection-border-default`

`1px dotted rgba(0, 89, 220, 0.8)`

`--xy-controls-button-background-color-default`

`#fefefe`

`--xy-controls-button-background-color-hover-default`

`#f4f4f4`

`--xy-controls-button-color-default`

`inherit`

`--xy-controls-button-color-hover-default`

`inherit`

`--xy-controls-button-border-color-default`

`#eee`

`--xy-controls-box-shadow-default`

`0 0 2px 1px rgba(0, 0, 0, 0.08)`

`--xy-resize-background-color-default`

`#3367d9`

These variables are used to define the _defaults_ for the various elements of React Flow. This means they can still be overridden by inline styles or custom classes on a per-element basis. If you want to override these variables, you can do so by adding:

`.react-flow {   --xy-node-background-color-default: #ff5050; }`

Be aware that these variables are defined under `.react-flow` and under `:root`.

### Overriding built-in classes[](#overriding-built-in-classes)

Some consider heavy use of inline styles to be an anti-pattern. In that case, you can override the built-in classes that React Flow uses with your own CSS. There are many classes attached to all sorts of elements in React Flow, but the ones you’ll likely want to override are listed below:

Class name

Description

`.react-flow`

The outermost container

`.react-flow__renderer`

The inner container

`.react-flow__zoompane`

Zoom & pan pane

`.react-flow__selectionpane`

Selection pane

`.react-flow__selection`

User selection

`.react-flow__edges`

The element containing all edges in the flow

`.react-flow__edge`

Applied to each [`Edge`](/api-reference/types/edge) in the flow

`.react-flow__edge.selected`

Added to an [`Edge`](/api-reference/types/edge) when selected

`.react-flow__edge.animated`

Added to an [`Edge`](/api-reference/types/edge) when its `animated` prop is `true`

`.react-flow__edge.updating`

Added to an [`Edge`](/api-reference/types/edge) while it gets updated via `onReconnect`

`.react-flow__edge-path`

The SVG `<path />` element of an [`Edge`](/api-reference/types/edge)

`.react-flow__edge-text`

The SVG `<text />` element of an [`Edge`](/api-reference/types/edge) label

`.react-flow__edge-textbg`

The SVG `<text />` element behind an [`Edge`](/api-reference/types/edge) label

`.react-flow__connection`

Applied to the current connection line

`.react-flow__connection-path`

The SVG `<path />` of a connection line

`.react-flow__nodes`

The element containing all nodes in the flow

`.react-flow__node`

Applied to each [`Node`](/api-reference/types/node) in the flow

`.react-flow__node.selected`

Added to a [`Node`](/api-reference/types/node) when selected.

`.react-flow__node-default`

Added when [`Node`](/api-reference/types/node) type is `"default"`

`.react-flow__node-input`

Added when [`Node`](/api-reference/types/node) type is `"input"`

`.react-flow__node-output`

Added when [`Node`](/api-reference/types/node) type is `"output"`

`.react-flow__nodesselection`

Nodes selection

`.react-flow__nodesselection-rect`

Nodes selection rect

`.react-flow__handle`

Applied to each [`<Handle />`](/api-reference/components/handle) component

`.react-flow__handle-top`

Applied when a handle’s [`Position`](/api-reference/types/position) is set to `"top"`

`.react-flow__handle-right`

Applied when a handle’s [`Position`](/api-reference/types/position) is set to `"right"`

`.react-flow__handle-bottom`

Applied when a handle’s [`Position`](/api-reference/types/position) is set to `"bottom"`

`.react-flow__handle-left`

Applied when a handle’s [`Position`](/api-reference/types/position) is set to `"left"`

`.connectingfrom`

Added to a Handle when a connection line is above a handle.

`.connectingto`

Added to a Handle when a connection line is above a handle.

`.valid`

Added to a Handle when a connection line is above **and** the connection is valid

`.react-flow__background`

Applied to the [`<Background />`](/api-reference/components/background) component

`.react-flow__minimap`

Applied to the [`<MiniMap />`](/api-reference/components/minimap) component

`.react-flow__controls`

Applied to the [`<Controls />`](/api-reference/components/controls) component

Be careful if you go poking around the source code looking for other classes to override. Some classes are used internally and are required in order for the library to be functional. If you replace them you may end up with unexpected bugs or errors!

## Third-party solutions[](#third-party-solutions)

You can choose to opt-out of React Flow’s default styling altogether and use a third-party styling solution instead. If you want to do this, you must make sure you still import the base styles.

`import '@xyflow/react/dist/base.css';`

These base styles are **required** for React Flow to function correctly. If you don’t import them or you override them with your own styles, some things might not work as expected!

App.jsxindex.css

`import React, { useCallback } from 'react'; import {   ReactFlow,   Background,   Controls,   MiniMap,   useNodesState,   useEdgesState,   addEdge,   Position, } from '@xyflow/react';   import '@xyflow/react/dist/base.css';   const nodeDefaults = {   sourcePosition: Position.Right,   targetPosition: Position.Left, };   const initialNodes = [   {     id: '1',     position: { x: 0, y: 150 },     data: { label: 'base style 1' },     ...nodeDefaults,   },   {     id: '2',     position: { x: 250, y: 0 },     data: { label: 'base style 2' },     ...nodeDefaults,   },   {     id: '3',     position: { x: 250, y: 150 },     data: { label: 'base style 3' },     ...nodeDefaults,   },   {     id: '4',     position: { x: 250, y: 300 },     data: { label: 'base style 4' },     ...nodeDefaults,   }, ];   const initialEdges = [   {     id: 'e1-2',     source: '1',     target: '2',   },   {     id: 'e1-3',     source: '1',     target: '3',   },   {     id: 'e1-4',     source: '1',     target: '4',   }, ];   const Flow = () => {   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);     const onConnect = useCallback(     (params) => setEdges((els) => addEdge(params, els)),     [],   );     return (     <ReactFlow       nodes={nodes}       edges={edges}       onNodesChange={onNodesChange}       onEdgesChange={onEdgesChange}       onConnect={onConnect}       fitView     >       <Background />       <Controls />       <MiniMap />     </ReactFlow>   ); };   export default Flow;`

### TailwindCSS[](#tailwindcss)

Custom nodes and edges are just React components, and you can use any styling solution you’d like to style them. For example, you might want to use [Tailwind](https://tailwindcss.com/)  to style your nodes:

`function CustomNode({ data }) {   return (     <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">       <div className="flex">         <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">           {data.emoji}         </div>         <div className="ml-2">           <div className="text-lg font-bold">{data.name}</div>           <div className="text-gray-500">{data.job}</div>         </div>       </div>         <Handle         type="target"         position={Position.Top}         className="w-16 !bg-teal-500"       />       <Handle         type="source"         position={Position.Bottom}         className="w-16 !bg-teal-500"       />     </div>   ); }`

If you want to overwrite default styles, make sure to import Tailwinds entry point after React Flows base styles.

`import '@xyflow/react/dist/style.css'; import 'tailwind.css';`

For a complete example of using Tailwind with React Flow, check out [the example](/examples/styling/tailwind)!