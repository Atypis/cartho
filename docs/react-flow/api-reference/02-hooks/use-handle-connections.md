# useHandleConnections

**Source:** https://reactflow.dev/api-reference/hooks/use-handle-connections
**Scraped:** 2025-10-13T10:08:31.702Z

---

# useHandleConnections()

**Warning**

`useHandleConnections` is deprecated in favor of the more capable [useNodeConnections](/api-reference/hooks/use-node-connections).

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useHandleConnections.ts) 

This hook returns an array connections on a specific handle or handle type.

`import { useHandleConnections } from '@xyflow/react';   export default function () {   const connections = useHandleConnections({ type: 'target', id: 'my-handle' });     return (     <div>There are currently {connections.length} incoming connections!</div>   ); }`

## Signature[](#signature)

**Parameters:**

Name

Type

Default

[](#0type)`[0].type`

`'source' | 'target'`

What type of handle connections do you want to observe?

[](#0id)`[0].id`

`string | null`

The handle id (this is only needed if the node has multiple handles of the same type).

[](#0nodeid)`[0].nodeId`

`string`

If node id is not provided, the node id from the `NodeIdContext` is used.

[](#0onconnect)`[0].onConnect`

`(connections: [Connection](/api-reference/types/connection)[]) => void`

Gets called when a connection is established.

[](#0ondisconnect)`[0].onDisconnect`

`(connections: [Connection](/api-reference/types/connection)[]) => void`

Gets called when a connection is removed.

**Returns:**

[](#returns)`[HandleConnection](/api-reference/types/handle-connection)[]`

An array with handle connections.