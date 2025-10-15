# useNodesState

**Source:** https://reactflow.dev/api-reference/hooks/use-nodes-state
**Scraped:** 2025-10-13T10:08:26.766Z

---

# useNodesState()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesEdgesState.ts) 

This hook makes it easy to prototype a controlled flow where you manage the state of nodes and edges outside the `ReactFlowInstance`. You can think of it like React’s `useState` hook with an additional helper callback.

`import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';   const initialNodes = []; const initialEdges = [];   export default function () {   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);     return (     <ReactFlow       nodes={nodes}       edges={edges}       onNodesChange={onNodesChange}       onEdgesChange={onEdgesChange}     />   ); }`

## Signature[](#signature)

**Parameters:**

Name

Type

Default

[](#initialnodes)`initialNodes`

`[NodeType](/api-reference/types/node)[]`

**Returns:**

[](#returns)`[nodes: [NodeType](/api-reference/types/node)[], setNodes: [Dispatch](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/bdd784f597ef151da8659762300621686969470d/types/react/v17/index.d.ts#L879)<[SetStateAction](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/bdd784f597ef151da8659762300621686969470d/types/react/v17/index.d.ts#L879)<[NodeType](/api-reference/types/node)[]>>, onNodesChange: [OnNodesChange](/api-reference/types/on-nodes-change)<[NodeType](/api-reference/types/node)>]`

*   `nodes`: The current array of nodes. You might pass this directly to the `nodes` prop of your `<ReactFlow />` component, or you may want to manipulate it first to perform some layouting, for example.
*   `setNodes`: A function that you can use to update the nodes. You can pass it a new array of nodes or a callback that receives the current array of nodes and returns a new array of nodes. This is the same as the second element of the tuple returned by React’s `useState` hook.
*   `onNodesChange`: A handy callback that can take an array of `NodeChanges` and update the nodes state accordingly. You’ll typically pass this directly to the `onNodesChange` prop of your `<ReactFlow />` component.

## TypeScript[](#typescript)

This hook accepts a generic type argument of custom node types. See this [section in our TypeScript guide](/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

`const nodes = useNodesState<CustomNodeType>();`

## Notes[](#notes)

*   This hook was created to make prototyping easier and our documentation examples clearer. Although it is OK to use this hook in production, in practice you may want to use a more sophisticated state management solution like [Zustand](/docs/guides/state-management) instead.