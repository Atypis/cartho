# Panel

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# Panel

The `Panel` component provides a positioned container for custom UI elements on React Flow canvases. It includes modern card styling with backdrop blur and flexible positioning options.

<Note>
  The Panel component is designed to be used with the [Canvas](/elements/components/canvas) component. See the [Workflow](/elements/examples/workflow) demo for a full example.
</Note>

## Installation

<ElementsInstaller path="panel" />

## Usage

```tsx
import { Panel } from '@/components/ai-elements/panel';
```

```tsx
<ReactFlow>
  <Panel position="top-left">
    <Button>Custom Action</Button>
  </Panel>
</ReactFlow>
```

## Features

- Flexible positioning (top-left, top-right, bottom-left, bottom-right, top-center, bottom-center)
- Rounded pill design with backdrop blur
- Theme-aware card background
- Flexbox layout for easy content alignment
- Subtle drop shadow for depth
- Full TypeScript support
- Compatible with React Flow's panel system

## Props

### `<Panel />`

<PropertiesTable
  content={[
    {
      name: 'position',
      type: "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'",
      description: 'Position of the panel on the canvas.',
      isOptional: true,
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the panel.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'ComponentProps<typeof Panel>',
      description: 'Any other props from @xyflow/react Panel component.',
    },
  ]}
/>
---
title: Toolbar
description: A styled toolbar component for React Flow nodes with flexible positioning and custom actions.
path: elements/components/toolbar
---
