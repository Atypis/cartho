# EdgeProps

**Source:** https://reactflow.dev/api-reference/types/edge-props
**Scraped:** 2025-10-13T10:08:36.882Z

---

# EdgeProps

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L100) 

When you implement a custom edge it is wrapped in a component that enables some basic functionality. The `EdgeProps` type takes a generic parameter to specify the type of edges you use in your application:

`type AppEdgeProps = EdgeProps<MyEdgeType>;`

Your custom edge component receives the following props:

## Fields[](#fields)

Name

Type

Default

[](#id)`id`

`[EdgeType](/api-reference/types/edge)["id"]`

Unique id of an edge.

[](#animated)`animated`

`[EdgeType](/api-reference/types/edge)["animated"]`

[](#data)`data`

`[EdgeType](/api-reference/types/edge)["data"]`

Arbitrary data passed to an edge.

[](#style)`style`

`[EdgeType](/api-reference/types/edge)["style"]`

[](#selected)`selected`

`[EdgeType](/api-reference/types/edge)["selected"]`

[](#source)`source`

`[EdgeType](/api-reference/types/edge)["source"]`

Id of source node.

[](#target)`target`

`[EdgeType](/api-reference/types/edge)["target"]`

Id of target node.

[](#selectable)`selectable`

`[EdgeType](/api-reference/types/edge)["selectable"]`

[](#deletable)`deletable`

`[EdgeType](/api-reference/types/edge)["deletable"]`

[](#sourcex)`sourceX`

`number`

[](#sourcey)`sourceY`

`number`

[](#targetx)`targetX`

`number`

[](#targety)`targetY`

`number`

[](#sourceposition)`sourcePosition`

`[Position](/api-reference/types/position)`

[](#targetposition)`targetPosition`

`[Position](/api-reference/types/position)`

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

[](#sourcehandleid)`sourceHandleId`

`string | null`

[](#targethandleid)`targetHandleId`

`string | null`

[](#markerstart)`markerStart`

`string`

[](#markerend)`markerEnd`

`string`

[](#pathoptions)`pathOptions`

`any`

[](#interactionwidth)`interactionWidth`

`number`