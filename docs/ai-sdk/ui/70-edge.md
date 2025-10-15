# Edge

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# Edge

The `Edge` component provides two pre-styled edge types for React Flow canvases: `Temporary` for dashed temporary connections and `Animated` for connections with animated indicators.

<Note>
  The Edge component is designed to be used with the [Canvas](/elements/components/canvas) component. See the [Workflow](/elements/examples/workflow) demo for a full example.
</Note>

## Installation

<ElementsInstaller path="edge" />

## Usage

```tsx
import { Edge } from '@/components/ai-elements/edge';
```

```tsx
const edgeTypes = {
  temporary: Edge.Temporary,
  animated: Edge.Animated,
};

<Canvas
  nodes={nodes}
  edges={edges}
  edgeTypes={edgeTypes}
/>
```

## Features

- Two distinct edge types: Temporary and Animated
- Temporary edges use dashed lines with ring color
- Animated edges include a moving circle indicator
- Automatic handle position calculation
- Smart offset calculation based on handle type and position
- Uses Bezier curves for smooth, natural-looking connections
- Fully compatible with React Flow's edge system
- Type-safe implementation with TypeScript

## Edge Types

### `Edge.Temporary`

A dashed edge style for temporary or preview connections. Uses a simple Bezier path with a dashed stroke pattern.

### `Edge.Animated`

A solid edge with an animated circle that moves along the path. The animation repeats indefinitely with a 2-second duration, providing visual feedback for active connections.

## Props

Both edge types accept standard React Flow `EdgeProps`:

<PropertiesTable
  content={[
    {
      name: 'id',
      type: 'string',
      description: 'Unique identifier for the edge.',
    },
    {
      name: 'source',
      type: 'string',
      description: 'ID of the source node.',
    },
    {
      name: 'target',
      type: 'string',
      description: 'ID of the target node.',
    },
    {
      name: 'sourceX',
      type: 'number',
      description: 'X coordinate of the source handle (Temporary only).',
      isOptional: true,
    },
    {
      name: 'sourceY',
      type: 'number',
      description: 'Y coordinate of the source handle (Temporary only).',
      isOptional: true,
    },
    {
      name: 'targetX',
      type: 'number',
      description: 'X coordinate of the target handle (Temporary only).',
      isOptional: true,
    },
    {
      name: 'targetY',
      type: 'number',
      description: 'Y coordinate of the target handle (Temporary only).',
      isOptional: true,
    },
    {
      name: 'sourcePosition',
      type: 'Position',
      description: 'Position of the source handle (Left, Right, Top, Bottom).',
      isOptional: true,
    },
    {
      name: 'targetPosition',
      type: 'Position',
      description: 'Position of the target handle (Left, Right, Top, Bottom).',
      isOptional: true,
    },
    {
      name: 'markerEnd',
      type: 'string',
      description: 'SVG marker ID for the edge end (Animated only).',
      isOptional: true,
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: 'Custom styles for the edge (Animated only).',
      isOptional: true,
    },
  ]}
/>
---
title: Workflow
description: Components for building node-based workflow visualizations.
---
