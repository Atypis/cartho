# ReactFlow Component

**Source:** https://reactflow.dev/api-reference/react-flow
**Scraped:** 2025-10-13T10:08:13.229Z

---

# <ReactFlow />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/container/ReactFlow/index.tsx/#L47) 

The `<ReactFlow />` component is the heart of your React Flow application. It renders your nodes and edges, handles user interaction, and can manage its own state if used as an [uncontrolled flow](/learn/advanced-use/uncontrolled-flow).

`import { ReactFlow } from '@xyflow/react'   export default function Flow() {   return <ReactFlow     nodes={...}     edges={...}     onNodesChange={...}     ...   /> }`

This component takes a lot of different props, most of which are optional. We’ve tried to document them in groups that make sense to help you find your way.

## Common props[](#common-props)

These are the props you will most commonly use when working with React Flow. If you are working with a controlled flow with custom nodes, you will likely use almost all of these!

Name

Type

Default

[](#width)`width`

`number`

Sets a fixed width for the flow.

[](#height)`height`

`number`

Sets a fixed height for the flow.

[](#nodes)`nodes`

`[Node](/api-reference/types/node)[]`

An array of nodes to render in a controlled flow.

`[]`

[](#edges)`edges`

`[Edge](/api-reference/types/edge)[]`

An array of edges to render in a controlled flow.

`[]`

[](#defaultnodes)`defaultNodes`

`[Node](/api-reference/types/node)[]`

The initial nodes to render in an uncontrolled flow.

[](#defaultedges)`defaultEdges`

`[Edge](/api-reference/types/edge)[]`

The initial edges to render in an uncontrolled flow.

[](#paneclickdistance)`paneClickDistance`

`number`

Distance that the mouse can move between mousedown/up that will trigger a click.

`0`

[](#nodeclickdistance)`nodeClickDistance`

`number`

Distance that the mouse can move between mousedown/up that will trigger a click.

`0`

[](#nodetypes)`nodeTypes`

`[NodeTypes](/api-reference/types/node-types)`

Custom node types to be available in a flow. React Flow matches a node’s type to a component in the `nodeTypes` object.

`{ input: InputNode, default: DefaultNode, output: OutputNode, group: GroupNode }`

[](#edgetypes)`edgeTypes`

`[EdgeTypes](/api-reference/types/edge-types)`

Custom edge types to be available in a flow. React Flow matches an edge’s type to a component in the `edgeTypes` object.

`{ default: BezierEdge, straight: StraightEdge, step: StepEdge, smoothstep: SmoothStepEdge, simplebezier: SimpleBezier }`

[](#autopanonnodefocus)`autoPanOnNodeFocus`

`boolean`

When `true`, the viewport will pan when a node is focused.

`true`

[](#nodeorigin)`nodeOrigin`

`[NodeOrigin](/api-reference/types/node-origin)`

The origin of the node to use when placing it in the flow or looking up its `x` and `y` position. An origin of `[0, 0]` means that a node’s top left corner will be placed at the `x` and `y` position.

`[0, 0]`

[](#prooptions)`proOptions`

`[ProOptions](/api-reference/types/pro-options)`

By default, we render a small attribution in the corner of your flows that links back to the project.

Anyone is free to remove this attribution whether they’re a Pro subscriber or not but we ask that you take a quick look at our [https://reactflow.dev/learn/troubleshooting/remove-attribution](https://reactflow.dev/learn/troubleshooting/remove-attribution)  removing attribution guide before doing so.

[](#nodedragthreshold)`nodeDragThreshold`

`number`

With a threshold greater than zero you can delay node drag events. If threshold equals 1, you need to drag the node 1 pixel before a drag event is fired. 1 is the default value, so that clicks don’t trigger drag events.

`1`

[](#connectiondragthreshold)`connectionDragThreshold`

`number`

The threshold in pixels that the mouse must move before a connection line starts to drag. This is useful to prevent accidental connections when clicking on a handle.

`1`

[](#colormode)`colorMode`

`[ColorMode](/api-reference/types/color-mode)`

Controls color scheme used for styling the flow.

`'light'`

[](#debug)`debug`

`boolean`

If set `true`, some debug information will be logged to the console like which events are fired.

`false`

[](#arialabelconfig)`ariaLabelConfig`

`[Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[AriaLabelConfig](/api-reference/types/aria-label-config)>`

Configuration for customizable labels, descriptions, and UI text. Provided keys will override the corresponding defaults. Allows localization, customization of ARIA descriptions, control labels, minimap labels, and other UI strings.

[](#props)`...props`

`Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "onError">`

## Viewport props[](#viewport-props)

Name

Type

Default

[](#defaultviewport)`defaultViewport`

`[Viewport](/api-reference/types/viewport)`

Sets the initial position and zoom of the viewport. If a default viewport is provided but `fitView` is enabled, the default viewport will be ignored.

`{ x: 0, y: 0, zoom: 1 }`

[](#viewport)`viewport`

`[Viewport](/api-reference/types/viewport)`

When you pass a `viewport` prop, it’s controlled, and you also need to pass `onViewportChange` to handle internal changes.

[](#onviewportchange)`onViewportChange`

`(viewport: [Viewport](/api-reference/types/viewport)) => void`

Used when working with a controlled viewport for updating the user viewport state.

[](#fitview)`fitView`

`boolean`

When `true`, the flow will be zoomed and panned to fit all the nodes initially provided.

[](#fitviewoptions)`fitViewOptions`

`FitViewOptionsBase<[NodeType](/api-reference/types/node)>`

When you typically call `fitView` on a `ReactFlowInstance`, you can provide an object of options to customize its behavior. This prop lets you do the same for the initial `fitView` call.

[](#minzoom)`minZoom`

`number`

Minimum zoom level.

`0.5`

[](#maxzoom)`maxZoom`

`number`

Maximum zoom level.

`2`

[](#snaptogrid)`snapToGrid`

`boolean`

When enabled, nodes will snap to the grid when dragged.

[](#snapgrid)`snapGrid`

`[SnapGrid](/api-reference/types/snap-grid)`

If `snapToGrid` is enabled, this prop configures the grid that nodes will snap to.

[](#onlyrendervisibleelements)`onlyRenderVisibleElements`

`boolean`

You can enable this optimisation to instruct React Flow to only render nodes and edges that would be visible in the viewport.

This might improve performance when you have a large number of nodes and edges but also adds an overhead.

`false`

[](#translateextent)`translateExtent`

`[CoordinateExtent](/api-reference/types/coordinate-extent)`

By default, the viewport extends infinitely. You can use this prop to set a boundary. The first pair of coordinates is the top left boundary and the second pair is the bottom right.

`[[-∞, -∞], [+∞, +∞]]`

[](#nodeextent)`nodeExtent`

`[CoordinateExtent](/api-reference/types/coordinate-extent)`

By default, nodes can be placed on an infinite flow. You can use this prop to set a boundary. The first pair of coordinates is the top left boundary and the second pair is the bottom right.

[](#preventscrolling)`preventScrolling`

`boolean`

Disabling this prop will allow the user to scroll the page even when their pointer is over the flow.

`true`

[](#attributionposition)`attributionPosition`

`[PanelPosition](/api-reference/types/panel-position)`

By default, React Flow will render a small attribution in the bottom right corner of the flow.

You can use this prop to change its position in case you want to place something else there.

`'bottom-right'`

## Edge props[](#edge-props)

Name

Type

Default

[](#elevateedgesonselect)`elevateEdgesOnSelect`

`boolean`

Enabling this option will raise the z-index of edges when they are selected.

`false`

[](#defaultmarkercolor)`defaultMarkerColor`

`string | null`

Color of edge markers. You can pass `null` to use the CSS variable `--xy-edge-stroke` for the marker color.

`'#b1b1b7'`

[](#defaultedgeoptions)`defaultEdgeOptions`

`[DefaultEdgeOptions](/api-reference/types/default-edge-options)`

Defaults to be applied to all new edges that are added to the flow. Properties on a new edge will override these defaults if they exist.

[](#reconnectradius)`reconnectRadius`

`number`

The radius around an edge connection that can trigger an edge reconnection.

`10`

[](#edgesreconnectable)`edgesReconnectable`

`boolean`

Whether edges can be updated once they are created. When both this prop is `true` and an `onReconnect` handler is provided, the user can drag an existing edge to a new source or target. Individual edges can override this value with their reconnectable property.

`true`

## Event handlers[](#event-handlers)

**Warning**

It’s important to remember to define any event handlers outside of your component or using React’s `useCallback` hook. If you don’t, this can cause React Flow to enter an infinite re-render loop!

### General Events[](#general-events)

Name

Type

Default

[](#onerror)`onError`

`[OnError](/api-reference/types/on-error)`

Occasionally something may happen that causes React Flow to throw an error.

Instead of exploding your application, we log a message to the console and then call this event handler. You might use it for additional logging or to show a message to the user.

[](#oninit)`onInit`

`(reactFlowInstance: [ReactFlowInstance](/api-reference/types/react-flow-instance)<[Node](/api-reference/types/node), [Edge](/api-reference/types/edge)>) => void`

The `onInit` callback is called when the viewport is initialized. At this point you can use the instance to call methods like `fitView` or `zoomTo`.

[](#ondelete)`onDelete`

`[OnDelete](/api-reference/types/on-delete)<[Node](/api-reference/types/node), [Edge](/api-reference/types/edge)>`

This event handler gets called when a node or edge is deleted.

[](#onbeforedelete)`onBeforeDelete`

`[OnBeforeDelete](/api-reference/types/on-before-delete)<[Node](/api-reference/types/node), [Edge](/api-reference/types/edge)>`

This handler is called before nodes or edges are deleted, allowing the deletion to be aborted by returning `false` or modified by returning updated nodes and edges.

### Node Events[](#node-events)

Name

Type

Default

[](#onnodeclick)`onNodeClick`

`[NodeMouseHandler](/api-reference/types/node-mouse-handler)<[Node](/api-reference/types/node)>`

This event handler is called when a user clicks on a node.

[](#onnodedoubleclick)`onNodeDoubleClick`

`[NodeMouseHandler](/api-reference/types/node-mouse-handler)<[Node](/api-reference/types/node)>`

This event handler is called when a user double-clicks on a node.

[](#onnodedragstart)`onNodeDragStart`

`[OnNodeDrag](/api-reference/types/on-node-drag)<[Node](/api-reference/types/node)>`

This event handler is called when a user starts to drag a node.

[](#onnodedrag)`onNodeDrag`

`[OnNodeDrag](/api-reference/types/on-node-drag)<[Node](/api-reference/types/node)>`

This event handler is called when a user drags a node.

[](#onnodedragstop)`onNodeDragStop`

`[OnNodeDrag](/api-reference/types/on-node-drag)<[Node](/api-reference/types/node)>`

This event handler is called when a user stops dragging a node.

[](#onnodemouseenter)`onNodeMouseEnter`

`[NodeMouseHandler](/api-reference/types/node-mouse-handler)<[Node](/api-reference/types/node)>`

This event handler is called when mouse of a user enters a node.

[](#onnodemousemove)`onNodeMouseMove`

`[NodeMouseHandler](/api-reference/types/node-mouse-handler)<[Node](/api-reference/types/node)>`

This event handler is called when mouse of a user moves over a node.

[](#onnodemouseleave)`onNodeMouseLeave`

`[NodeMouseHandler](/api-reference/types/node-mouse-handler)<[Node](/api-reference/types/node)>`

This event handler is called when mouse of a user leaves a node.

[](#onnodecontextmenu)`onNodeContextMenu`

`[NodeMouseHandler](/api-reference/types/node-mouse-handler)<[Node](/api-reference/types/node)>`

This event handler is called when a user right-clicks on a node.

[](#onnodesdelete)`onNodesDelete`

`[OnNodesDelete](/api-reference/types/on-nodes-delete)<[Node](/api-reference/types/node)>`

This event handler gets called when a node is deleted.

[](#onnodeschange)`onNodesChange`

`[OnNodesChange](/api-reference/types/on-nodes-change)<[Node](/api-reference/types/node)>`

Use this event handler to add interactivity to a controlled flow. It is called on node drag, select, and move.

### Edge Events[](#edge-events)

Name

Type

Default

[](#onedgeclick)`onEdgeClick`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>, edge: [Edge](/api-reference/types/edge)) => void`

This event handler is called when a user clicks on an edge.

[](#onedgedoubleclick)`onEdgeDoubleClick`

`[EdgeMouseHandler](/api-reference/types/edge-mouse-handler)<[Edge](/api-reference/types/edge)>`

This event handler is called when a user double-clicks on an edge.

[](#onedgemouseenter)`onEdgeMouseEnter`

`[EdgeMouseHandler](/api-reference/types/edge-mouse-handler)<[Edge](/api-reference/types/edge)>`

This event handler is called when mouse of a user enters an edge.

[](#onedgemousemove)`onEdgeMouseMove`

`[EdgeMouseHandler](/api-reference/types/edge-mouse-handler)<[Edge](/api-reference/types/edge)>`

This event handler is called when mouse of a user moves over an edge.

[](#onedgemouseleave)`onEdgeMouseLeave`

`[EdgeMouseHandler](/api-reference/types/edge-mouse-handler)<[Edge](/api-reference/types/edge)>`

This event handler is called when mouse of a user leaves an edge.

[](#onedgecontextmenu)`onEdgeContextMenu`

`[EdgeMouseHandler](/api-reference/types/edge-mouse-handler)<[Edge](/api-reference/types/edge)>`

This event handler is called when a user right-clicks on an edge.

[](#onreconnect)`onReconnect`

`[OnReconnect](/api-reference/types/on-reconnect)<[Edge](/api-reference/types/edge)>`

This handler is called when the source or target of a reconnectable edge is dragged from the current node. It will fire even if the edge’s source or target do not end up changing. You can use the `reconnectEdge` utility to convert the connection to a new edge.

[](#onreconnectstart)`onReconnectStart`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>, edge: [Edge](/api-reference/types/edge), handleType: HandleType) => void`

This event fires when the user begins dragging the source or target of an editable edge.

[](#onreconnectend)`onReconnectEnd`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6) | TouchEvent, edge: [Edge](/api-reference/types/edge), handleType: HandleType, connectionState: FinalConnectionState) => void`

This event fires when the user releases the source or target of an editable edge. It is called even if an edge update does not occur.

[](#onedgesdelete)`onEdgesDelete`

`[OnEdgesDelete](/api-reference/types/on-edges-delete)<[Edge](/api-reference/types/edge)>`

This event handler gets called when an edge is deleted.

[](#onedgeschange)`onEdgesChange`

`[OnEdgesChange](/api-reference/types/on-edges-change)<[Edge](/api-reference/types/edge)>`

Use this event handler to add interactivity to a controlled flow. It is called on edge select and remove.

### Connection Events[](#connection-events)

Name

Type

Default

[](#onconnect)`onConnect`

`[OnConnect](/api-reference/types/on-connect)`

When a connection line is completed and two nodes are connected by the user, this event fires with the new connection. You can use the `addEdge` utility to convert the connection to a complete edge.

[](#onconnectstart)`onConnectStart`

`[OnConnectStart](/api-reference/types/on-connect-start)`

This event handler gets called when a user starts to drag a connection line.

[](#onconnectend)`onConnectEnd`

`[OnConnectEnd](/api-reference/types/on-connect-end)`

This callback will fire regardless of whether a valid connection could be made or not. You can use the second `connectionState` parameter to have different behavior when a connection was unsuccessful.

[](#onclickconnectstart)`onClickConnectStart`

`[OnConnectStart](/api-reference/types/on-connect-start)`

[](#onclickconnectend)`onClickConnectEnd`

`[OnConnectEnd](/api-reference/types/on-connect-end)`

[](#isvalidconnection)`isValidConnection`

`[IsValidConnection](/api-reference/types/is-valid-connection)<[Edge](/api-reference/types/edge)>`

This callback can be used to validate a new connection

If you return `false`, the edge will not be added to your flow. If you have custom connection logic its preferred to use this callback over the `isValidConnection` prop on the handle component for performance reasons.

### Pane Events[](#pane-events)

Name

Type

Default

[](#onmove)`onMove`

`[OnMove](/api-reference/types/on-move)`

This event handler is called while the user is either panning or zooming the viewport.

[](#onmovestart)`onMoveStart`

`[OnMove](/api-reference/types/on-move)`

This event handler is called when the user begins to pan or zoom the viewport.

[](#onmoveend)`onMoveEnd`

`[OnMove](/api-reference/types/on-move)`

This event handler is called when panning or zooming viewport movement stops. If the movement is not user-initiated, the event parameter will be `null`.

[](#onpaneclick)`onPaneClick`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void`

This event handler gets called when user clicks inside the pane.

[](#onpanecontextmenu)`onPaneContextMenu`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6) | React.[MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void`

This event handler gets called when user right clicks inside the pane.

[](#onpanescroll)`onPaneScroll`

`(event?: WheelEvent<Element> | undefined) => void`

This event handler gets called when user scroll inside the pane.

[](#onpanemousemove)`onPaneMouseMove`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void`

This event handler gets called when mouse moves over the pane.

[](#onpanemouseenter)`onPaneMouseEnter`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void`

This event handler gets called when mouse enters the pane.

[](#onpanemouseleave)`onPaneMouseLeave`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void`

This event handler gets called when mouse leaves the pane.

### Selection Events[](#selection-events)

Name

Type

Default

[](#onselectionchange)`onSelectionChange`

`[OnSelectionChangeFunc](/api-reference/types/on-selection-change-func)<[Node](/api-reference/types/node), [Edge](/api-reference/types/edge)>`

This event handler gets called when a user changes group of selected elements in the flow.

[](#onselectiondragstart)`onSelectionDragStart`

`[SelectionDragHandler](/api-reference/types/selection-drag-handler)<[Node](/api-reference/types/node)>`

This event handler gets called when a user starts to drag a selection box.

[](#onselectiondrag)`onSelectionDrag`

`[SelectionDragHandler](/api-reference/types/selection-drag-handler)<[Node](/api-reference/types/node)>`

This event handler gets called when a user drags a selection box.

[](#onselectiondragstop)`onSelectionDragStop`

`[SelectionDragHandler](/api-reference/types/selection-drag-handler)<[Node](/api-reference/types/node)>`

This event handler gets called when a user stops dragging a selection box.

[](#onselectionstart)`onSelectionStart`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void`

[](#onselectionend)`onSelectionEnd`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>) => void`

[](#onselectioncontextmenu)`onSelectionContextMenu`

`(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>, nodes: [Node](/api-reference/types/node)[]) => void`

This event handler is called when a user right-clicks on a node selection.

## Interaction props[](#interaction-props)

Name

Type

Default

[](#nodesdraggable)`nodesDraggable`

`boolean`

Controls whether all nodes should be draggable or not. Individual nodes can override this setting by setting their `draggable` prop. If you want to use the mouse handlers on non-draggable nodes, you need to add the `"nopan"` class to those nodes.

`true`

[](#nodesconnectable)`nodesConnectable`

`boolean`

Controls whether all nodes should be connectable or not. Individual nodes can override this setting by setting their `connectable` prop.

`true`

[](#nodesfocusable)`nodesFocusable`

`boolean`

When `true`, focus between nodes can be cycled with the `Tab` key and selected with the `Enter` key. This option can be overridden by individual nodes by setting their `focusable` prop.

`true`

[](#edgesfocusable)`edgesFocusable`

`boolean`

When `true`, focus between edges can be cycled with the `Tab` key and selected with the `Enter` key. This option can be overridden by individual edges by setting their `focusable` prop.

`true`

[](#elementsselectable)`elementsSelectable`

`boolean`

When `true`, elements (nodes and edges) can be selected by clicking on them. This option can be overridden by individual elements by setting their `selectable` prop.

`true`

[](#autopanonconnect)`autoPanOnConnect`

`boolean`

When `true`, the viewport will pan automatically when the cursor moves to the edge of the viewport while creating a connection.

`true`

[](#autopanonnodedrag)`autoPanOnNodeDrag`

`boolean`

When `true`, the viewport will pan automatically when the cursor moves to the edge of the viewport while dragging a node.

`true`

[](#autopanspeed)`autoPanSpeed`

`number`

The speed at which the viewport pans while dragging a node or a selection box.

`15`

[](#panondrag)`panOnDrag`

`boolean | number[]`

Enabling this prop allows users to pan the viewport by clicking and dragging. You can also set this prop to an array of numbers to limit which mouse buttons can activate panning.

`true`

[](#selectionondrag)`selectionOnDrag`

`boolean`

Select multiple elements with a selection box, without pressing down `selectionKey`.

`false`

[](#selectionmode)`selectionMode`

`[SelectionMode](/api-reference/types/selection-mode)`

When set to `"partial"`, when the user creates a selection box by click and dragging nodes that are only partially in the box are still selected.

`'full'`

[](#panonscroll)`panOnScroll`

`boolean`

Controls if the viewport should pan by scrolling inside the container. Can be limited to a specific direction with `panOnScrollMode`.

`false`

[](#panonscrollspeed)`panOnScrollSpeed`

`number`

Controls how fast viewport should be panned on scroll. Use together with `panOnScroll` prop.

`0.5`

[](#panonscrollmode)`panOnScrollMode`

`[PanOnScrollMode](/api-reference/types/pan-on-scroll-mode)`

This prop is used to limit the direction of panning when `panOnScroll` is enabled. The `"free"` option allows panning in any direction.

`"free"`

[](#zoomonscroll)`zoomOnScroll`

`boolean`

Controls if the viewport should zoom by scrolling inside the container.

`true`

[](#zoomonpinch)`zoomOnPinch`

`boolean`

Controls if the viewport should zoom by pinching on a touch screen.

`true`

[](#zoomondoubleclick)`zoomOnDoubleClick`

`boolean`

Controls if the viewport should zoom by double-clicking somewhere on the flow.

`true`

[](#selectnodesondrag)`selectNodesOnDrag`

`boolean`

If `true`, nodes get selected on drag.

`true`

[](#elevatenodesonselect)`elevateNodesOnSelect`

`boolean`

Enabling this option will raise the z-index of nodes when they are selected.

`true`

[](#connectonclick)`connectOnClick`

`boolean`

The `connectOnClick` option lets you click or tap on a source handle to start a connection and then click on a target handle to complete the connection.

If you set this option to `false`, users will need to drag the connection line to the target handle to create a connection.

`true`

[](#connectionmode)`connectionMode`

`[ConnectionMode](/api-reference/types/connection-mode)`

A loose connection mode will allow you to connect handles with differing types, including source-to-source connections. However, it does not support target-to-target connections. Strict mode allows only connections between source handles and target handles.

`'strict'`

## Connection line props[](#connection-line-props)

Name

Type

Default

[](#connectionlinestyle)`connectionLineStyle`

`[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

Styles to be applied to the connection line.

[](#connectionlinetype)`connectionLineType`

`[ConnectionLineType](/api-reference/types/connection-line-type)`

The type of edge path to use for connection lines. Although created edges can be of any type, React Flow needs to know what type of path to render for the connection line before the edge is created!

`[ConnectionLineType](/api-reference/types/connection-line-type).Bezier`

[](#connectionradius)`connectionRadius`

`number`

The radius around a handle where you drop a connection line to create a new edge.

`20`

[](#connectionlinecomponent)`connectionLineComponent`

`[ConnectionLineComponent](/api-reference/types/connection-line-component)<[Node](/api-reference/types/node)>`

React Component to be used as a connection line.

[](#connectionlinecontainerstyle)`connectionLineContainerStyle`

`[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

Styles to be applied to the container of the connection line.

## Keyboard props[](#keyboard-props)

React Flow let’s you pass in a few different keyboard shortcuts as another way to interact with your flow. We’ve tried to set up sensible defaults like using backspace to delete any selected nodes or edges, but you can use these props to set your own.

To disable any of these shortcuts, pass in `null` to the prop you want to disable.

Name

Type

Default

[](#deletekeycode)`deleteKeyCode`

`[KeyCode](/api-reference/types/key-code) | null`

If set, pressing the key or chord will delete any selected nodes and edges. Passing an array represents multiple keys that can be pressed.

For example, `["Delete", "Backspace"]` will delete selected elements when either key is pressed.

`'Backspace'`

[](#selectionkeycode)`selectionKeyCode`

`[KeyCode](/api-reference/types/key-code) | null`

If set, holding this key will let you click and drag to draw a selection box around multiple nodes and edges. Passing an array represents multiple keys that can be pressed.

For example, `["Shift", "Meta"]` will allow you to draw a selection box when either key is pressed.

`'Shift'`

[](#multiselectionkeycode)`multiSelectionKeyCode`

`[KeyCode](/api-reference/types/key-code) | null`

Pressing down this key you can select multiple elements by clicking.

`"Meta" for macOS, "Control" for other systems`

[](#zoomactivationkeycode)`zoomActivationKeyCode`

`[KeyCode](/api-reference/types/key-code) | null`

If a key is set, you can zoom the viewport while that key is held down even if `panOnScroll` is set to `false`.

By setting this prop to `null` you can disable this functionality.

`"Meta" for macOS, "Control" for other systems`

[](#panactivationkeycode)`panActivationKeyCode`

`[KeyCode](/api-reference/types/key-code) | null`

If a key is set, you can pan the viewport while that key is held down even if `panOnScroll` is set to `false`.

By setting this prop to `null` you can disable this functionality.

`'Space'`

[](#disablekeyboarda11y)`disableKeyboardA11y`

`boolean`

You can use this prop to disable keyboard accessibility features such as selecting nodes or moving selected nodes with the arrow keys.

`false`

## Style props[](#style-props)

Applying certain classes to elements rendered inside the canvas will change how interactions are handled. These props let you configure those class names if you need to.

Name

Type

Default

[](#nopanclassname)`noPanClassName`

`string`

If an element in the canvas does not stop mouse events from propagating, clicking and dragging that element will pan the viewport. Adding the `"nopan"` class prevents this behavior and this prop allows you to change the name of that class.

`"nopan"`

[](#nodragclassname)`noDragClassName`

`string`

If a node is draggable, clicking and dragging that node will move it around the canvas. Adding the `"nodrag"` class prevents this behavior and this prop allows you to change the name of that class.

`"nodrag"`

[](#nowheelclassname)`noWheelClassName`

`string`

Typically, scrolling the mouse wheel when the mouse is over the canvas will zoom the viewport. Adding the `"nowheel"` class to an element in the canvas will prevent this behavior and this prop allows you to change the name of that class.

`"nowheel"`

## Notes[](#notes)

*   The props of this component get exported as `ReactFlowProps`