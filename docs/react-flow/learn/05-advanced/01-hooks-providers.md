# Hooks and Providers

**Source:** https://reactflow.dev/learn/advanced-use/hooks-providers
**Scraped:** 2025-10-13T10:08:01.428Z

---

# Hooks and Providers

React Flow provides several [hooks](/api-reference/hooks) and a context provider for you to enhance the functionality of your flow. These tools help you to manage state, access internal methods, and create custom components more effectively.

## ReactFlowProvider[](#reactflowprovider)

The ReactFlowProvider is a context provider that allows you to access the internal state of the flow, such as nodes, edges, and viewport, from anywhere in your component tree even outside the [`ReactFlow`](/api-reference/react-flow) component. It is typically used at the top level of your application.

There are several cases where you might need to use the [`ReactFlowProvider`](/api-reference/react-flow-provider) component:

*   Many of the [hooks](/api-reference/hooks) we provide rely on this component to work.
*   You want to access the internal state of the flow outside of the `ReactFlow` component.
*   You are working with multiple flows on a page.
*   You are using a client-side router.

App.jsxSidebar.jsxxy-theme.cssindex.css

`import React, { useCallback } from 'react'; import {   Background,   ReactFlow,   ReactFlowProvider,   useNodesState,   useEdgesState,   addEdge,   Controls, } from '@xyflow/react';   import Sidebar from './Sidebar'; import '@xyflow/react/dist/style.css';   const initialNodes = [   {     id: 'provider-1',     type: 'input',     data: { label: 'Node 1' },     position: { x: 250, y: 5 },   },   { id: 'provider-2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },   { id: 'provider-3', data: { label: 'Node 3' }, position: { x: 400, y: 100 } },   { id: 'provider-4', data: { label: 'Node 4' }, position: { x: 400, y: 200 } }, ];   const initialEdges = [   {     id: 'provider-e1-2',     source: 'provider-1',     target: 'provider-2',     animated: true,   },   { id: 'provider-e1-3', source: 'provider-1', target: 'provider-3' }, ];   const ProviderFlow = () => {   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);   const onConnect = useCallback(     (params) => setEdges((els) => addEdge(params, els)),     [],   );     return (     <div className="providerflow">       <ReactFlowProvider>         <div className="reactflow-wrapper">           <ReactFlow             nodes={nodes}             edges={edges}             onNodesChange={onNodesChange}             onEdgesChange={onEdgesChange}             onConnect={onConnect}             fitView           >             <Controls />             <Background />           </ReactFlow>         </div>         <Sidebar nodes={nodes} setNodes={setNodes} />       </ReactFlowProvider>     </div>   ); };   export default ProviderFlow;`

## useReactFlow[](#usereactflow)

The [`useReactFlow`](/api-reference/hooks/use-react-flow) hook provides access to the [`ReactFlowInstance`](/api-reference/types/react-flow-instance) and its methods. It allows you to manipulate nodes, edges, and the viewport programmatically.

This example illustrates how to use the `useReactFlow` hook.

App.jsxButtons.jsxxy-theme.cssindex.css

`import React, { useCallback } from 'react'; import {   Background,   ReactFlow,   ReactFlowProvider,   addEdge,   useNodesState,   useEdgesState, } from '@xyflow/react';   import Buttons from './Buttons'; import '@xyflow/react/dist/style.css';   const initialNodes = [   {     id: '1',     type: 'input',     data: { label: 'Node 1' },     position: { x: 250, y: 5 },   },   { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },   { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 } },   { id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 } }, ];   const initialEdges = [   {     id: 'e1-2',     source: '1',     target: '2',   },   { id: 'e1-3', source: '1', target: '3' }, ];   const ProviderFlow = () => {   const [nodes, , onNodesChange] = useNodesState(initialNodes);   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);   const onConnect = useCallback(     (params) => setEdges((els) => addEdge(params, els)),     [],   );     return (     <ReactFlowProvider>       <ReactFlow         nodes={nodes}         edges={edges}         onNodesChange={onNodesChange}         onEdgesChange={onEdgesChange}         onConnect={onConnect}         fitView       >         <Buttons />         <Background />       </ReactFlow>     </ReactFlowProvider>   ); };   export default ProviderFlow;`