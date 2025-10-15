# Adding Interactivity

**Source:** https://reactflow.dev/learn/concepts/adding-interactivity
**Scraped:** 2025-10-13T10:07:50.314Z

---

# Adding Interactivity

Now that we’ve built our [first flow](learn/concepts/building-a-flow), let’s add interactivity so you can select, drag, and remove nodes and edges.

## Handling change events[](#handling-change-events)

By default React Flow doesn’t manage any internal state updates besides handling the viewport. As you would with an HTML `<input />` element you need to pass [event handlers](/api-reference/react-flow#event-handlers) to React Flow in order to apply triggered changes to your nodes and edges.

### Add imports[](#add-imports)

To manage changes, we’ll be using `useState` with two helper functions from React Flow: [`applyNodeChanges`](/api-reference/utils/apply-node-changes) and [`applyEdgeChanges`](/api-reference/utils/apply-edge-changes). So let’s import these functions:

`import { useState, useCallback } from 'react'; import { ReactFlow, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';`

### Define nodes and edges[](#define-nodes-and-edges)

We need to define initial nodes and edges. These will be the starting point for our flow.

`const initialNodes = [   {     id: 'n1',     position: { x: 0, y: 0 },     data: { label: 'Node 1' },     type: 'input',   },   {     id: 'n2',     position: { x: 100, y: 100 },     data: { label: 'Node 2' },   }, ];   const initialEdges = [   {     id: 'n1-n2',     source: 'n1',     target: 'n2',   }, ];`

### Initialize state[](#initialize-state)

In our component, we’ll call the `useState` hook to manage the state of our nodes and edges:

`export default function App() {   const [nodes, setNodes] = useState(initialNodes);   const [edges, setEdges] = useState(initialEdges);     return (     <div style={{ height: '100%', width: '100%' }}>       <ReactFlow>         <Background />         <Controls />       </ReactFlow>     </div>   ); }`

### Add event handlers[](#add-event-handlers)

We need to create two event handlers: [`onNodesChange`](/api-reference/react-flow#onnodeschange) and [`onEdgesChange`](/api-reference/react-flow#onedgeschange). They will be used to update the state of our nodes and edges when changes occur, such as dragging or deleting an element. Go ahead and add these handlers to your component:

`const onNodesChange = useCallback(   (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),   [], ); const onEdgesChange = useCallback(   (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),   [], );`

### Pass them to ReactFlow[](#pass-them-to-reactflow)

Now we can pass our nodes, edges, and event handlers to the `<ReactFlow />` component:

`<ReactFlow   nodes={nodes}   edges={edges}   onNodesChange={onNodesChange}   onEdgesChange={onEdgesChange}   fitView >   <Background />   <Controls /> </ReactFlow>`

### Interactive flow[](#interactive-flow)

And that’s it! You now have a basic interactive flow 🎉

When you drag or select a node, the `onNodesChange` handler is triggered. The `applyNodeChanges` function then uses these change events to update the current state of your nodes. Here’s how it all comes together. Try clicking and dragging a node to move it around and watch the UI update in real time.

## Handling connections[](#handling-connections)

One last piece is missing: connecting nodes interactively. For this, we need to implement an [`onConnect`](/api-reference/react-flow#onconnect) handler.

### Create `onConnect` handler[](#create-onconnect-handler)

The `onConnect` handler is called whenever a new connection is made between two nodes. We can use the [`addEdge`](/api-reference/utils/add-edge) utility function to create a new edge and update the edge Array.

`const onConnect = useCallback(   (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),   [], );`

### Pass it to ReactFlow[](#pass-it-to-reactflow)

Now we can pass the `onConnect` handler to the `<ReactFlow />` component:

`<ReactFlow   nodes={nodes}   edges={edges}   onNodesChange={onNodesChange}   onEdgesChange={onEdgesChange}   onConnect={onConnect}   fitView >   <Background />   <Controls /> </ReactFlow>`

### Connectable flow[](#connectable-flow)

Try to connect the two nodes by dragging from on handle to another one. The `onConnect` handler will be triggered, and the new edge will be added to the flow. 🥳

## Full code example 🏁[](#full-code-example-)

What is happening here? Whenever React Flow triggers a change (node init, node drag, edge select, etc.), the `onNodesChange` handler gets called. We export an `applyNodeChanges` handler so that you don’t need to handle the changes by yourself. The `applyNodeChanges` handler returns an updated array of nodes that is your new nodes array. You now have an interactive flow with the following capabilities:

*   selectable nodes and edges
*   draggable nodes
*   connectable nodes by dragging from one node handle to another
*   multi-selection area by pressing `shift` — the default [`selectionKeyCode`](/api-reference/react-flow#selectionkeycode)
*   multi-selection by pressing `cmd` — the default [`multiSelectionKeyCode`](/api-reference/react-flow#multiselectionkeycode)
*   removing selected elements by pressing `backspace` — the default [`deleteKeyCode`](/api-reference/react-flow#deletekeycode)

If you want to jump straight into creating your own application, we recommend checking out the [Customization](/learn/customization) section. Otherwise keep reading to learn more about React Flows capabilities.