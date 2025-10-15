# BaseEdge

**Source:** https://reactflow.dev/api-reference/components/base-edge
**Scraped:** 2025-10-13T10:08:21.905Z

---

# <BaseEdge />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Edges/BaseEdge.tsx) 

The `<BaseEdge />` component gets used internally for all the edges. It can be used inside a custom edge and handles the invisible helper edge and the edge label for you.

`import { BaseEdge } from '@xyflow/react';   export function CustomEdge({ sourceX, sourceY, targetX, targetY, ...props }) {   const [edgePath] = getStraightPath({     sourceX,     sourceY,     targetX,     targetY,   });     const { label, labelStyle, markerStart, markerEnd, interactionWidth } = props;     return (     <BaseEdge       path={edgePath}       label={label}       labelStyle={labelStyle}       markerEnd={markerEnd}       markerStart={markerStart}       interactionWidth={interactionWidth}     />   ); }`

## Props[](#props)

Name

Type

Default

[](#path)`path`

`string`

The SVG path string that defines the edge. This should look something like `'M 0 0 L 100 100'` for a simple line. The utility functions like `getSimpleBezierEdge` can be used to generate this string for you.

[](#markerstart)`markerStart`

`string`

The id of the SVG marker to use at the start of the edge. This should be defined in a `<defs>` element in a separate SVG document or element. Use the format “url(#markerId)” where markerId is the id of your marker definition.

[](#markerend)`markerEnd`

`string`

The id of the SVG marker to use at the end of the edge. This should be defined in a `<defs>` element in a separate SVG document or element. Use the format “url(#markerId)” where markerId is the id of your marker definition.

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

[](#interactionwidth)`interactionWidth`

`number`

The width of the invisible area around the edge that the user can interact with. This is useful for making the edge easier to click or hover over.

`20`

[](#labelx)`labelX`

`number`

The x position of edge label

[](#labely)`labelY`

`number`

The y position of edge label

[](#props)`...props`

`Omit<SVGAttributes<SVGPathElement>, "d" | "path" | "markerStart" | "markerEnd">`

## Notes[](#notes)

*   If you want to use an edge marker with the [`<BaseEdge />`](/api-reference/components/base-edge) component, you can pass the `markerStart` or `markerEnd` props passed to your custom edge through to the [`<BaseEdge />`](/api-reference/components/base-edge) component. You can see all the props passed to a custom edge by looking at the [`EdgeProps`](/api-reference/types/edge-props) type.