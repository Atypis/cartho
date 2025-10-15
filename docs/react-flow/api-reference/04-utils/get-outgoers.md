# getOutgoers

**Source:** https://reactflow.dev/api-reference/utils/get-outgoers
**Scraped:** 2025-10-13T10:08:42.992Z

---

# getOutgoers()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L64) 

This util is used to tell you what nodes, if any, are connected to the given node as the _target_ of an edge.

`import { getOutgoers } from '@xyflow/react';   const nodes = []; const edges = [];   const outgoers = getOutgoers(   { id: '1', position: { x: 0, y: 0 }, data: { label: 'node' } },   nodes,   edges, );`

## Signature[](#signature)

**Parameters:**

Name

Type

Default

[](#node)`node`

`[NodeType](/api-reference/types/node) | { id: string; }`

The node to get the connected nodes from.

[](#nodes)`nodes`

`[NodeType](/api-reference/types/node)[]`

The array of all nodes.

[](#edges)`edges`

`[EdgeType](/api-reference/types/edge)[]`

The array of all edges.

**Returns:**

[](#returns)`[NodeType](/api-reference/types/node)[]`

An array of nodes that are connected over edges where the source is the given node.