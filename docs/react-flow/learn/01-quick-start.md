# Quick Start

**Source:** https://reactflow.dev/learn
**Scraped:** 2025-10-13T10:07:47.149Z

---

# Quick Start

This page will take you from zero to a working React Flow app in a few minutes. If you just want to have a look around and get an impression of React Flow, check out our interactive no-code [Playground](https://play.reactflow.dev/) .

## Installation[](#installation)

First, spin up a new React project however you like — we recommend using [Vite](https://vitejs.dev/) 

npmpnpmyarnbun

`npm init vite my-react-flow-app -- --template react`

`pnpm create vite my-react-flow-app --template react`

`yarn create vite my-react-flow-app --template react`

`bunx create-vite my-react-flow-app --template react`

Next `cd` into your new project folder and add [`@xyflow/react`](https://npmjs.com/package/@xyflow/react) as a dependency

npmpnpmyarnbun

`npm install @xyflow/react`

`pnpm add @xyflow/react`

`yarn add @xyflow/react`

`bun add @xyflow/react`

Lastly, spin up the dev server and you’re good to go!

## Usage[](#usage)

We will render the [`<ReactFlow />`](/api-reference/react-flow#reactflow) component from the `@xyflow/react` package. That and defining a handful of [node](/api-reference/types/node) objects, [edge](/api-reference/types/edge) objects and [event handlers](/api-reference/react-flow#event-handlers) are all we need to get something going! Get rid of everything inside `App.jsx` and add the following:

`import { useState, useCallback } from 'react'; import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'; import '@xyflow/react/dist/style.css';   const initialNodes = [   { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },   { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } }, ]; const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];   export default function App() {   const [nodes, setNodes] = useState(initialNodes);   const [edges, setEdges] = useState(initialEdges);     const onNodesChange = useCallback(     (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),     [],   );   const onEdgesChange = useCallback(     (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),     [],   );   const onConnect = useCallback(     (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),     [],   );     return (     <div style={{ width: '100vw', height: '100vh' }}>       <ReactFlow         nodes={nodes}         edges={edges}         onNodesChange={onNodesChange}         onEdgesChange={onEdgesChange}         onConnect={onConnect}         fitView       />     </div>   ); }`

There are two things to pay attention to here:

*   🎨 You must import the css stylesheet for React Flow to work.
*   📐 The `<ReactFlow />` component must have a parent element with a width and height.

## Result[](#result)

Et voila. You’ve already created your first interactive flow! 🎉

## Next steps[](#next-steps)

[Core Concepts](/learn/concepts/terms-and-definitions)[Customization](/learn/customization/custom-nodes)[Examples](/examples)[API Reference](/api-reference)[Discord](https://discord.gg/RVmnytFmGW)[Template Projects](https://github.com/xyflow/react-flow-example-apps)