# useViewport

**Source:** https://reactflow.dev/api-reference/hooks/use-viewport
**Scraped:** 2025-10-13T10:08:29.013Z

---

# useViewport()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useViewport.ts) 

The `useViewport` hook is a convenient way to read the current state of the [`Viewport`](/api-reference/types/viewport) in a component. Components that use this hook will re-render **whenever the viewport changes**.

`import { useViewport } from '@xyflow/react';   export default function ViewportDisplay() {   const { x, y, zoom } = useViewport();     return (     <div>       <p>         The viewport is currently at ({x}, {y}) and zoomed to {zoom}.       </p>     </div>   ); }`

## Signature[](#signature)

**Parameters:**

This function does not accept any parameters.

**Returns:**

The current viewport.

Name

Type

[](#x)`x`

`number`

[](#y)`y`

`number`

[](#zoom)`zoom`

`number`

## Notes[](#notes)

*   This hook can only be used in a component that is a child of a [`<ReactFlowProvider />`](/api-reference/react-flow-provider) or a [`<ReactFlow />`](/api-reference/react-flow) component.