# Node Type

**Source:** https://reactflow.dev/api-reference/types/node
**Scraped:** 2025-10-13T10:08:33.951Z

---

# Node

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/nodes.ts/#L10) 

The `Node` type represents everything React Flow needs to know about a given node. Many of these properties can be manipulated both by React Flow or by you, but some such as `width` and `height` should be considered read-only.

## Fields[](#fields)

Name

Type

Default

[](#id)`id`

`string`

Unique id of a node.

[](#position)`position`

`[XYPosition](/api-reference/types/xy-position)`

Position of a node on the pane.

[](#data)`data`

`NodeData`

Arbitrary data passed to a node.

[](#sourceposition)`sourcePosition`

`[Position](/api-reference/types/position)`

Only relevant for default, source, target nodeType. Controls source position.

[](#targetposition)`targetPosition`

`[Position](/api-reference/types/position)`

Only relevant for default, source, target nodeType. Controls target position.

[](#hidden)`hidden`

`boolean`

Whether or not the node should be visible on the canvas.

[](#selected)`selected`

`boolean`

[](#dragging)`dragging`

`boolean`

Whether or not the node is currently being dragged.

[](#draggable)`draggable`

`boolean`

Whether or not the node is able to be dragged.

[](#selectable)`selectable`

`boolean`

[](#connectable)`connectable`

`boolean`

[](#deletable)`deletable`

`boolean`

[](#draghandle)`dragHandle`

`string`

A class name that can be applied to elements inside the node that allows those elements to act as drag handles, letting the user drag the node by clicking and dragging on those elements.

[](#width)`width`

`number`

[](#height)`height`

`number`

[](#initialwidth)`initialWidth`

`number`

[](#initialheight)`initialHeight`

`number`

[](#parentid)`parentId`

`string`

Parent node id, used for creating sub-flows.

[](#zindex)`zIndex`

`number`

[](#extent)`extent`

`[CoordinateExtent](/api-reference/types/coordinate-extent) | "parent" | null`

Boundary a node can be moved in.

[](#expandparent)`expandParent`

`boolean`

When `true`, the parent node will automatically expand if this node is dragged to the edge of the parent node’s bounds.

[](#arialabel)`ariaLabel`

`string`

[](#origin)`origin`

`[NodeOrigin](/api-reference/types/node-origin)`

Origin of the node relative to its position.

[](#handles)`handles`

`[NodeHandle](/api-reference/types/node-handle)[]`

[](#measured)`measured`

`{ width?: number; height?: number; }`

[](#type)`type`

`string | [NodeType](/api-reference/types/node) | ([NodeType](/api-reference/types/node) & undefined)`

Type of node defined in nodeTypes

[](#style)`style`

`[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

[](#classname)`className`

`string`

[](#resizing)`resizing`

`boolean`

[](#focusable)`focusable`

`boolean`

[](#ariarole)`ariaRole`

`AriaRole`

The ARIA role attribute for the node element, used for accessibility.

`"group"`

[](#domattributes)`domAttributes`

`Omit<HTMLAttributes<HTMLDivElement>, "id" | "draggable" | "style" | "className" | "role" | "aria-label" | "defaultValue" | keyof DOMAttributes<HTMLDivElement>>`

General escape hatch for adding custom attributes to the node’s DOM element.

## Default node types[](#default-node-types)

You can create any of React Flow’s default nodes by setting the `type` property to one of the following values:

*   `"default"`
*   `"input"`
*   `"output"`
*   `"group"`

If you don’t set the `type` property at all, React Flow will fallback to the `"default"` node with both an input and output port.

These default nodes are available even if you set the [`nodeTypes`](/api-reference/react-flow#node-types) prop to something else, unless you override any of these keys directly.

## Notes[](#notes)

*   You shouldn’t try to set the `width` or `height` of a node directly. It is calculated internally by React Flow and used when rendering the node in the viewport. To control a node’s size you should use the `style` or `className` props to apply CSS styles instead.