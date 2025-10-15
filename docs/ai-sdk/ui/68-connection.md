# Connection

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# Connection

The `Connection` component provides a styled connection line for React Flow canvases. It renders an animated bezier curve with a circle indicator at the target end, using consistent theming through CSS variables.

<Note>
  The Connection component is designed to be used with the [Canvas](/elements/components/canvas) component. See the [Workflow](/elements/examples/workflow) demo for a full example.
</Note>

## Installation

<ElementsInstaller path="connection" />

## Usage

```tsx
import { Connection } from '@/components/ai-elements/connection';
```

```tsx
<ReactFlow connectionLineComponent={Connection} />
```

## Features

- Smooth bezier curve animation for connection lines
- Visual indicator circle at the target position
- Theme-aware styling using CSS variables
- Cubic bezier curve calculation for natural flow
- Lightweight implementation with minimal props
- Full TypeScript support with React Flow types
- Compatible with React Flow's connection system

## Props

### `<Connection />`

<PropertiesTable
  content={[
    {
      name: 'fromX',
      type: 'number',
      description: 'The x-coordinate of the connection start point.',
    },
    {
      name: 'fromY',
      type: 'number',
      description: 'The y-coordinate of the connection start point.',
    },
    {
      name: 'toX',
      type: 'number',
      description: 'The x-coordinate of the connection end point.',
    },
    {
      name: 'toY',
      type: 'number',
      description: 'The y-coordinate of the connection end point.',
    },
  ]}
/>
---
title: Controls
description: A styled controls component for React Flow-based canvases with zoom and fit view functionality.
path: elements/components/controls
---
