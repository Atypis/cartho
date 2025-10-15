# Toolbar

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# Toolbar

The `Toolbar` component provides a positioned toolbar that attaches to nodes in React Flow canvases. It features modern card styling with backdrop blur and flexbox layout for action buttons and controls.

<Note>
  The Toolbar component is designed to be used with the [Node](/elements/components/node) component. See the [Workflow](/elements/examples/workflow) demo for a full example.
</Note>

## Installation

<ElementsInstaller path="toolbar" />

## Usage

```tsx
import { Toolbar } from '@/components/ai-elements/toolbar';
```

```tsx
import { Toolbar } from '@/components/ai-elements/toolbar';
import { Button } from '@/components/ui/button';

const CustomNode = () => (
  <Node>
    <NodeContent>...</NodeContent>
    <Toolbar>
      <Button size="sm" variant="ghost">
        Edit
      </Button>
      <Button size="sm" variant="ghost">
        Delete
      </Button>
    </Toolbar>
  </Node>
);
```

## Features

- Attaches to any React Flow node
- Bottom positioning by default
- Rounded card design with border
- Theme-aware background styling
- Flexbox layout with gap spacing
- Full TypeScript support
- Compatible with all React Flow NodeToolbar features

## Props

### `<Toolbar />`

<PropertiesTable
  content={[
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the toolbar.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'ComponentProps<typeof NodeToolbar>',
      description: 'Any other props from @xyflow/react NodeToolbar component (position, offset, isVisible, etc.).',
    },
  ]}
/>
---
title: Artifact
description: A container component for displaying generated content like code, documents, or other outputs with built-in actions.
path: elements/components/artifact
---
