# NodeResizer

**Source:** https://reactflow.dev/api-reference/components/node-resizer
**Scraped:** 2025-10-13T10:08:20.920Z

---

# <NodeResizer />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/NodeResizer/NodeResizer.tsx) 

The `<NodeResizer />` component can be used to add a resize functionality to your nodes. It renders draggable controls around the node to resize in all directions.

`import { memo } from 'react'; import { Handle, Position, NodeResizer } from '@xyflow/react';   const ResizableNode = ({ data }) => {   return (     <>       <NodeResizer minWidth={100} minHeight={30} />       <Handle type="target" position={Position.Left} />       <div style={{ padding: 10 }}>{data.label}</div>       <Handle type="source" position={Position.Right} />     </>   ); };   export default memo(ResizableNode);`

## Props[](#props)

For TypeScript users, the props type for the `<NodeResizer />` component is exported as `NodeResizerProps`.

Name

Type

Default

[](#nodeid)`nodeId`

`string`

Id of the node it is resizing.

[](#color)`color`

`string`

Color of the resize handle.

[](#handleclassname)`handleClassName`

`string`

Class name applied to handle.

[](#handlestyle)`handleStyle`

`[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

Style applied to handle.

[](#lineclassname)`lineClassName`

`string`

Class name applied to line.

[](#linestyle)`lineStyle`

`[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

Style applied to line.

[](#isvisible)`isVisible`

`boolean`

Are the controls visible.

`true`

[](#minwidth)`minWidth`

`number`

Minimum width of node.

`10`

[](#minheight)`minHeight`

`number`

Minimum height of node.

`10`

[](#maxwidth)`maxWidth`

`number`

Maximum width of node.

`Number.MAX_VALUE`

[](#maxheight)`maxHeight`

`number`

Maximum height of node.

`Number.MAX_VALUE`

[](#keepaspectratio)`keepAspectRatio`

`boolean`

Keep aspect ratio when resizing.

`false`

[](#autoscale)`autoScale`

`boolean`

Scale the controls with the zoom level.

`true`

[](#shouldresize)`shouldResize`

`(event: ResizeDragEvent, params: ResizeParamsWithDirection) => boolean`

Callback to determine if node should resize.

[](#onresizestart)`onResizeStart`

`OnResizeStart`

Callback called when resizing starts.

[](#onresize)`onResize`

`OnResize`

Callback called when resizing.

[](#onresizeend)`onResizeEnd`

`OnResizeEnd`

Callback called when resizing ends.

## Examples[](#examples)

Head over to the [example page](/examples/nodes/node-resizer) to see how this is done.

App.jsxCustomResizerNode.jsxResizableNode.jsxResizableNodeSelected.jsxxy-theme.cssindex.css

`import {   ReactFlow,   Background,   BackgroundVariant,   Controls, } from '@xyflow/react';   import ResizableNode from './ResizableNode'; import ResizableNodeSelected from './ResizableNodeSelected'; import CustomResizerNode from './CustomResizerNode';   import '@xyflow/react/dist/style.css';   const nodeTypes = {   ResizableNode,   ResizableNodeSelected,   CustomResizerNode, };   const initialNodes = [   {     id: '1',     type: 'ResizableNode',     data: { label: 'NodeResizer' },     position: { x: 0, y: 50 },   },   {     id: '2',     type: 'ResizableNodeSelected',     data: { label: 'NodeResizer when selected' },     position: { x: -100, y: 150 },   },   {     id: '3',     type: 'CustomResizerNode',     data: { label: 'Custom Resize Icon' },     position: { x: 150, y: 150 },     style: {       height: 100,     },   }, ];   const initialEdges = [];   export default function NodeToolbarExample() {   return (     <ReactFlow       defaultNodes={initialNodes}       defaultEdges={initialEdges}       minZoom={0.2}       maxZoom={4}       fitView       nodeTypes={nodeTypes}       fitViewOptions={{ padding: 0.5 }}     >       <Background variant={BackgroundVariant.Dots} />       <Controls />     </ReactFlow>   ); }`

### Custom Resize Controls[](#custom-resize-controls)

To build custom resize controls, you can use the [NodeResizeControl](/api-reference/components/node-resize-control) component and customize it.

## Notes[](#notes)

*   Take a look at the docs for the [`NodeProps`](/api-reference/types/node-props) type or the guide on [custom nodes](/learn/customization/custom-nodes) to see how to implement your own nodes.