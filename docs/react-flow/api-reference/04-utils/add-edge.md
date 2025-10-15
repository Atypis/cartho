# addEdge

**Source:** https://reactflow.dev/api-reference/utils/add-edge
**Scraped:** 2025-10-13T10:08:41.831Z

---

# addEdge()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/general.ts/#L100) 

This util is a convenience function to add a new [`Edge`](/api-reference/types/edge) to an array of edges. It also performs some validation to make sure you don’t add an invalid edge or duplicate an existing one.

`import { useCallback } from 'react'; import {   ReactFlow,   addEdge,   useNodesState,   useEdgesState, } from '@xyflow/react';   export default function Flow() {   const [nodes, setNodes, onNodesChange] = useNodesState([]);   const [edges, setEdges, onEdgesChange] = useEdgesState([]);   const onConnect = useCallback(     (connection) => {       setEdges((oldEdges) => addEdge(connection, oldEdges));     },     [setEdges],   );     return <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect} />; }`

## Signature[](#signature)

**Parameters:**

Name

Type

Default

[](#edgeparams)`edgeParams`

`[EdgeType](/api-reference/types/edge) | [Connection](/api-reference/types/connection)`

Either an `Edge` or a `Connection` you want to add.

[](#edges)`edges`

`[EdgeType](/api-reference/types/edge)[]`

The array of all current edges.

**Returns:**

[](#returns)`[EdgeType](/api-reference/types/edge)[]`

A new array of edges with the new edge added.

## Notes[](#notes)

*   If an edge with the same `target` and `source` already exists (and the same `targetHandle` and `sourceHandle` if those are set), then this util won’t add a new edge even if the `id` property is different.