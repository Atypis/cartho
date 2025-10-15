# Controls

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# Controls

The `Controls` component provides interactive zoom and fit view controls for React Flow canvases. It includes a modern, themed design with backdrop blur and card styling.

<Note>
  The Controls component is designed to be used with the [Canvas](/elements/components/canvas) component. See the [Workflow](/elements/examples/workflow) demo for a full example.
</Note>

## Installation

<ElementsInstaller path="controls" />

## Usage

```tsx
import { Controls } from '@/components/ai-elements/controls';
```

```tsx
<ReactFlow>
  <Controls />
</ReactFlow>
```

## Features

- Zoom in/out controls
- Fit view button to center and scale content
- Rounded pill design with backdrop blur
- Theme-aware card background
- Subtle drop shadow for depth
- Full TypeScript support
- Compatible with all React Flow control features

## Props

### `<Controls />`

<PropertiesTable
  content={[
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the controls.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'ComponentProps<typeof Controls>',
      description: 'Any other props from @xyflow/react Controls component (showZoom, showFitView, showInteractive, position, etc.).',
    },
  ]}
/>
---
title: Edge
description: Customizable edge components for React Flow canvases with animated and temporary states.
path: elements/components/edge
---
