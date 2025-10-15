# Edge Type

**Source:** https://reactflow.dev/api-reference/types/edge
**Scraped:** 2025-10-13T10:08:34.926Z

---

# Edge

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L34-L353) 

Where a [`Connection`](/api-reference/types/connection) is the minimal description of an edge between two nodes, an `Edge` is the complete description with everything React Flow needs to know in order to render it.

`export type Edge<T> = DefaultEdge<T> | SmoothStepEdge<T> | BezierEdge<T>;`

## Variants[](#variants)

### Edge[](#edge)

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L34-L353) 

Name

Type

Default

[](#id)`id`

`string`

Unique id of an edge.

[](#type)`type`

`[EdgeType](/api-reference/types/edge)`

Type of edge defined in `edgeTypes`.

[](#source)`source`

`string`

Id of source node.

[](#target)`target`

`string`

Id of target node.

[](#sourcehandle)`sourceHandle`

`string | null`

Id of source handle, only needed if there are multiple handles per node.

[](#targethandle)`targetHandle`

`string | null`

Id of target handle, only needed if there are multiple handles per node.

[](#animated)`animated`

`boolean`

[](#hidden)`hidden`

`boolean`

[](#deletable)`deletable`

`boolean`

[](#selectable)`selectable`

`boolean`

[](#data)`data`

`EdgeData`

Arbitrary data passed to an edge.

[](#selected)`selected`

`boolean`

[](#markerstart)`markerStart`

`[EdgeMarkerType](/api-reference/types/edge-marker)`

Set the marker on the beginning of an edge.

[](#markerend)`markerEnd`

`[EdgeMarkerType](/api-reference/types/edge-marker)`

Set the marker on the end of an edge.

[](#zindex)`zIndex`

`number`

[](#arialabel)`ariaLabel`

`string`

[](#interactionwidth)`interactionWidth`

`number`

ReactFlow renders an invisible path around each edge to make them easier to click or tap on. This property sets the width of that invisible path.

[](#label)`label`

`[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)`

The label or custom element to render along the edge. This is commonly a text label or some custom controls.

[](#labelstyle)`labelStyle`

`[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

Custom styles to apply to the label.

[](#labelshowbg)`labelShowBg`

`boolean`

[](#labelbgstyle)`labelBgStyle`

`[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

[](#labelbgpadding)`labelBgPadding`

`[number, number]`

[](#labelbgborderradius)`labelBgBorderRadius`

`number`

[](#style)`style`

`[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)`

[](#classname)`className`

`string`

[](#reconnectable)`reconnectable`

`boolean | HandleType`

Determines whether the edge can be updated by dragging the source or target to a new node. This property will override the default set by the `edgesReconnectable` prop on the `<ReactFlow />` component.

[](#focusable)`focusable`

`boolean`

[](#ariarole)`ariaRole`

`AriaRole`

The ARIA role attribute for the edge, used for accessibility.

`"group"`

[](#domattributes)`domAttributes`

`Omit<SVGAttributes<SVGGElement>, "id" | "style" | "className" | "role" | "aria-label" | "dangerouslySetInnerHTML">`

General escape hatch for adding custom attributes to the edge’s DOM element.

### SmoothStepEdge[](#smoothstepedge)

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L45-L46) 

The `SmoothStepEdge` variant has all the same fields as an `Edge`, but it also has the following additional fields:

Name

Type

Default

[](#type)`type`

`"smoothstep"`

[](#pathoptions)`pathOptions`

`{ offset?: number; borderRadius?: number; }`

### BezierEdge[](#bezieredge)

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L52-L53) 

The `BezierEdge` variant has all the same fields as an `Edge`, but it also has the following additional fields:

Name

Type

Default

[](#type)`type`

`"default"`

[](#pathoptions)`pathOptions`

`{ curvature?: number; }`

## Default edge types[](#default-edge-types)

You can create any of React Flow’s default edges by setting the `type` property to one of the following values:

*   `"default"`
*   `"straight"`
*   `"step"`
*   `"smoothstep"`
*   `"simplebezier"`

If you don’t set the `type` property at all, React Flow will fallback to the `"default"` bezier curve edge type.

These default edges are available even if you set the [`edgeTypes`](/api-reference/react-flow#edge-types) prop to something else, unless you override any of these keys directly.