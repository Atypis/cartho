# Connection Type

**Source:** https://reactflow.dev/api-reference/types/connection
**Scraped:** 2025-10-13T10:08:37.846Z

---

# Connection

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L29-L34) 

The `Connection` type is the basic minimal description of an [`Edge`](/api-reference/types/edge) between two nodes. The [`addEdge`](/api-reference/utils/add-edge) util can be used to upgrade a `Connection` to an [`Edge`](/api-reference/types/edge).

## Fields[](#fields)

Name

Type

Default

[](#source)`source`

`string`

The id of the node this connection originates from.

[](#target)`target`

`string`

The id of the node this connection terminates at.

[](#sourcehandle)`sourceHandle`

`string | null`

When not `null`, the id of the handle on the source node that this connection originates from.

[](#targethandle)`targetHandle`

`string | null`

When not `null`, the id of the handle on the target node that this connection terminates at.