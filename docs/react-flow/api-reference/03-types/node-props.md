# NodeProps

**Source:** https://reactflow.dev/api-reference/types/node-props
**Scraped:** 2025-10-13T10:08:35.909Z

---

# NodeProps<T>

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/nodes.ts/#L89) 

When you implement a [custom node](/learn/customization/custom-nodes) it is wrapped in a component that enables basic functionality like selection and dragging.

## Usage[](#usage)

`import { useState } from 'react'; import { NodeProps, Node } from '@xyflow/react';   export type CounterNode = Node<   {     initialCount?: number;   },   'counter' >;   export default function CounterNode(props: NodeProps<CounterNode>) {   const [count, setCount] = useState(props.data?.initialCount ?? 0);     return (     <div>       <p>Count: {count}</p>       <button className="nodrag" onClick={() => setCount(count + 1)}>         Increment       </button>     </div>   ); }`

Remember to register your custom node by adding it to the [`nodeTypes`](/api-reference/react-flow#nodetypes) prop of your `<ReactFlow />` component.

`import { ReactFlow } from '@xyflow/react'; import CounterNode from './CounterNode';   const nodeTypes = {   counterNode: CounterNode, };   export default function App() {   return <ReactFlow nodeTypes={nodeTypes} ... /> }`

You can read more in our [custom node guide](/learn/customization/custom-nodes).

## Fields[](#fields)

Your custom node receives the following props:

Name

Type

Default

[](#id)`id`

`[NodeType](/api-reference/types/node)["id"]`

Unique id of a node.

[](#data)`data`

`[NodeType](/api-reference/types/node)["data"]`

Arbitrary data passed to a node.

[](#width)`width`

`[NodeType](/api-reference/types/node)["width"]`

[](#height)`height`

`[NodeType](/api-reference/types/node)["height"]`

[](#sourceposition)`sourcePosition`

`[NodeType](/api-reference/types/node)["sourcePosition"]`

Only relevant for default, source, target nodeType. Controls source position.

[](#targetposition)`targetPosition`

`[NodeType](/api-reference/types/node)["targetPosition"]`

Only relevant for default, source, target nodeType. Controls target position.

[](#draghandle)`dragHandle`

`[NodeType](/api-reference/types/node)["dragHandle"]`

A class name that can be applied to elements inside the node that allows those elements to act as drag handles, letting the user drag the node by clicking and dragging on those elements.

[](#parentid)`parentId`

`[NodeType](/api-reference/types/node)["parentId"]`

Parent node id, used for creating sub-flows.

[](#type)`type`

`[NodeType](/api-reference/types/node)["type"]`

Type of node defined in nodeTypes

[](#dragging)`dragging`

`[NodeType](/api-reference/types/node)["dragging"]`

Whether or not the node is currently being dragged.

[](#zindex)`zIndex`

`[NodeType](/api-reference/types/node)["zIndex"]`

[](#selectable)`selectable`

`[NodeType](/api-reference/types/node)["selectable"]`

[](#deletable)`deletable`

`[NodeType](/api-reference/types/node)["deletable"]`

[](#selected)`selected`

`[NodeType](/api-reference/types/node)["selected"]`

[](#draggable)`draggable`

`[NodeType](/api-reference/types/node)["draggable"]`

Whether or not the node is able to be dragged.

[](#isconnectable)`isConnectable`

`boolean`

Whether a node is connectable or not.

[](#positionabsolutex)`positionAbsoluteX`

`number`

Position absolute x value.

[](#positionabsolutey)`positionAbsoluteY`

`number`

Position absolute y value.