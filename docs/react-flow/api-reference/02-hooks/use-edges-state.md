# useEdgesState

**Source:** https://reactflow.dev/api-reference/hooks/use-edges-state
**Scraped:** 2025-10-13T10:08:28.045Z

---

# useEdgesState()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesEdgesState.ts) 

This hook makes it easy to prototype a controlled flow where you manage the state of nodes and edges outside the `ReactFlowInstance`. You can think of it like React’s `useState` hook with an additional helper callback.

`import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';   const initialNodes = []; const initialEdges = [];   export default function () {   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);     return (     <ReactFlow       nodes={nodes}       edges={edges}       onNodesChange={onNodesChange}       onEdgesChange={onEdgesChange}     />   ); }`

## Signature[](#signature)

**Parameters:**

Name

Type

Default

[](#initialedges)`initialEdges`

`[EdgeType](/api-reference/types/edge)[]`

**Returns:**

[](#returns)`[edges: [EdgeType](/api-reference/types/edge)[], setEdges: [Dispatch](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/bdd784f597ef151da8659762300621686969470d/types/react/v17/index.d.ts#L879)<[SetStateAction](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/bdd784f597ef151da8659762300621686969470d/types/react/v17/index.d.ts#L879)<[EdgeType](/api-reference/types/edge)[]>>, onEdgesChange: [OnEdgesChange](/api-reference/types/on-edges-change)<[EdgeType](/api-reference/types/edge)>]`

*   `edges`: The current array of edges. You might pass this directly to the `edges` prop of your `<ReactFlow />` component, or you may want to manipulate it first to perform some layouting, for example.
    
*   `setEdges`: A function that you can use to update the edges. You can pass it a new array of edges or a callback that receives the current array of edges and returns a new array of edges. This is the same as the second element of the tuple returned by React’s `useState` hook.
    
*   `onEdgesChange`: A handy callback that can take an array of `EdgeChanges` and update the edges state accordingly. You’ll typically pass this directly to the `onEdgesChange` prop of your `<ReactFlow />` component.
    

## TypeScript[](#typescript)

This hook accepts a generic type argument of custom edge types. See this [section in our TypeScript guide](/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

`const nodes = useEdgesState<CustomEdgeType>();`

## Notes[](#notes)

*   This hook was created to make prototyping easier and our documentation examples clearer. Although it is OK to use this hook in production, in practice you may want to use a more sophisticated state management solution like [Zustand](/docs/guides/state-management) instead.