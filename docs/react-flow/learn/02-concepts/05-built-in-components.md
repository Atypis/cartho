# Built-In Components

**Source:** https://reactflow.dev/learn/concepts/built-in-components
**Scraped:** 2025-10-13T10:07:52.362Z

---

# Built-In Components

React Flow comes with several built-in components that can be passed as children to the [`<ReactFlow />`](/api-reference/react-flow) component.

## MiniMap[](#minimap)

The [`MiniMap`](/api-reference/components/minimap) provides a bird’s-eye view of your flowgraph, making navigation easier, especially for larger flows. You can customize the appearance of nodes in the minimap by providing a nodeColor function.

## Controls[](#controls)

React Flow comes with a set of customizable [`Controls`](/api-reference/components/controls) for the viewport. You can zoom in and out, fit the viewport and toggle if the user can move, select and edit the nodes.

## Background[](#background)

The [`Background`](/api-reference/components/background) component adds a visual grid pattern to your flowgraph, helping users maintain orientation. You can choose from different pattern variants, or if you need more advanced customization, you can explore the [source](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/Background/Background.tsx)  code to implement your own pattern.

## Panel[](#panel)

The [`Panel`](/api-reference/components/panel) component allows you to add fixed overlays to your flowgraph, perfect for titles, controls, or any other UI elements that should remain stationary.

## Advanced[](#advanced)

For more advanced use cases and customization, we have even more built-in components you can check out in the [API components overview](/api-reference/components)