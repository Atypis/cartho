# useConnection

**Source:** https://reactflow.dev/api-reference/hooks/use-connection
**Scraped:** 2025-10-13T10:08:29.984Z

---

# useConnection()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useConnection.ts) 

The `useConnection` hook returns the current connection state when there is an active connection interaction. If no connection interaction is active, it returns `null` for every property. A typical use case for this hook is to colorize handles based on a certain condition (e.g. if the connection is valid or not).

``import { useConnection } from '@xyflow/react';   export default function App() {   const connection = useConnection();     return (     <div>       {connection ? `Someone is trying to make a connection from ${connection.fromNode} to this one.` : 'There are currently no incoming connections!'}     </div>   ); }``

## Signature[](#signature)

**Parameters:**

Name

Type

Default

[](#connectionselector)`connectionSelector`

`(connection: [ConnectionState](/api-reference/types/connection-state)<[InternalNode](/api-reference/types/internal-node)<[NodeType](/api-reference/types/node)>>) => SelectorReturn`

An optional selector function used to extract a slice of the `ConnectionState` data. Using a selector can prevent component re-renders where data you don’t otherwise care about might change. If a selector is not provided, the entire `ConnectionState` object is returned unchanged.

**Returns:**

[](#returns)`SelectorReturn`

ConnectionState