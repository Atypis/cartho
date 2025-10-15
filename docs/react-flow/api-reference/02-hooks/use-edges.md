# useEdges

**Source:** https://reactflow.dev/api-reference/hooks/use-edges
**Scraped:** 2025-10-13T10:08:25.776Z

---

# useEdges()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useEdges.ts) 

This hook returns an array of the current edges. Components that use this hook will re-render **whenever any edge changes**.

`import { useEdges } from '@xyflow/react';   export default function () {   const edges = useEdges();     return <div>There are currently {edges.length} edges!</div>; }`

## Signature[](#signature)

**Parameters:**

This function does not accept any parameters.

**Returns:**

[](#returns)`[EdgeType](/api-reference/types/edge)[]`

An array of all edges currently in the flow.

## TypeScript[](#typescript)

This hook accepts a generic type argument of custom edge types. See this [section in our TypeScript guide](/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

`const nodes = useEdges<CustomEdgeType>();`

## Notes[](#notes)

*   Relying on `useEdges` unnecessarily can be a common cause of performance issues. Whenever any edge changes, this hook will cause the component to re-render. Often we actually care about something more specific, like when the _number_ of edges changes: where possible try to use [`useStore`](/api-reference/hooks/use-store) instead.