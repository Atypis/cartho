# Node

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# Node

The `Node` component provides a composable, Card-based node for React Flow canvases. It includes support for connection handles, structured layouts, and consistent styling using shadcn/ui components.

<Note>
  The Node component is designed to be used with the [Canvas](/elements/components/canvas) component. See the [Workflow](/elements/examples/workflow) demo for a full example.
</Note>

## Installation

<ElementsInstaller path="node" />

## Usage

```tsx
import {
  Node,
  NodeHeader,
  NodeTitle,
  NodeDescription,
  NodeAction,
  NodeContent,
  NodeFooter,
} from '@/components/ai-elements/node';
```

```tsx
<Node handles={{ target: true, source: true }}>
  <NodeHeader>
    <NodeTitle>Node Title</NodeTitle>
    <NodeDescription>Optional description</NodeDescription>
    <NodeAction>
      <Button>Action</Button>
    </NodeAction>
  </NodeHeader>
  <NodeContent>
    Main content goes here
  </NodeContent>
  <NodeFooter>
    Footer content
  </NodeFooter>
</Node>
```

## Features

- Built on shadcn/ui Card components for consistent styling
- Automatic handle placement (left for target, right for source)
- Composable sub-components (Header, Title, Description, Action, Content, Footer)
- Semantic structure for organizing node information
- Pre-styled sections with borders and backgrounds
- Responsive sizing with fixed small width
- Full TypeScript support with proper type definitions
- Compatible with React Flow's node system

## Props

### `<Node />`

<PropertiesTable
  content={[
    {
      name: 'handles',
      type: '{ target: boolean; source: boolean; }',
      description: 'Configuration for connection handles. Target renders on the left, source on the right.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the node.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'ComponentProps<typeof Card>',
      description: 'Any other props are spread to the underlying Card component.',
    },
  ]}
/>

### `<NodeHeader />`

<PropertiesTable
  content={[
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the header.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'ComponentProps<typeof CardHeader>',
      description: 'Any other props are spread to the underlying CardHeader component.',
    },
  ]}
/>

### `<NodeTitle />`

<PropertiesTable
  content={[
    {
      name: '[...props]',
      type: 'ComponentProps<typeof CardTitle>',
      description: 'Any other props are spread to the underlying CardTitle component.',
    },
  ]}
/>

### `<NodeDescription />`

<PropertiesTable
  content={[
    {
      name: '[...props]',
      type: 'ComponentProps<typeof CardDescription>',
      description: 'Any other props are spread to the underlying CardDescription component.',
    },
  ]}
/>

### `<NodeAction />`

<PropertiesTable
  content={[
    {
      name: '[...props]',
      type: 'ComponentProps<typeof CardAction>',
      description: 'Any other props are spread to the underlying CardAction component.',
    },
  ]}
/>

### `<NodeContent />`

<PropertiesTable
  content={[
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the content.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'ComponentProps<typeof CardContent>',
      description: 'Any other props are spread to the underlying CardContent component.',
    },
  ]}
/>

### `<NodeFooter />`

<PropertiesTable
  content={[
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the footer.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'ComponentProps<typeof CardFooter>',
      description: 'Any other props are spread to the underlying CardFooter component.',
    },
  ]}
/>
---
title: Panel
description: A styled panel component for React Flow-based canvases to position custom UI elements.
path: elements/components/panel
---
