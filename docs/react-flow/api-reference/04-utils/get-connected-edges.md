# getConnectedEdges

**Source:** https://reactflow.dev/api-reference/utils/get-connected-edges
**Scraped:** 2025-10-13T10:08:40.412Z

---

# getConnectedEdges()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L224) 

This utility filters an array of edges, keeping only those where either the source or target node is present in the given array of nodes.

`import { getConnectedEdges } from '@xyflow/react';   const nodes = [   { id: 'a', position: { x: 0, y: 0 } },   { id: 'b', position: { x: 100, y: 0 } }, ]; const edges = [   { id: 'a->c', source: 'a', target: 'c' },   { id: 'c->d', source: 'c', target: 'd' }, ];   const connectedEdges = getConnectedEdges(nodes, edges); // => [{ id: 'a->c', source: 'a', target: 'c' }]`

## Signature[](#signature)

**Parameters:**

Name

Type

Default

[](#nodes)`nodes`

`[NodeType](/api-reference/types/node)[]`

Nodes you want to get the connected edges for.

[](#edges)`edges`

`[EdgeType](/api-reference/types/edge)[]`

All edges.

**Returns:**

[](#returns)`[EdgeType](/api-reference/types/edge)[]`

Array of edges that connect any of the given nodes with each other.