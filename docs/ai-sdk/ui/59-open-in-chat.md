# Open In Chat

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# Open In Chat

The `OpenIn` component provides a dropdown menu that allows users to open queries in different AI chat platforms with a single click.

<Preview path="open-in-chat" />

## Installation

<ElementsInstaller path="open-in-chat" />

## Usage

```tsx
import {
  OpenIn,
  OpenInChatGPT,
  OpenInClaude,
  OpenInContent,
  OpenInCursor,
  OpenInScira,
  OpenInT3,
  OpenInTrigger,
  OpenInv0,
} from '@/components/ai-elements/open-in-chat';
```

```tsx
<OpenIn query="How can I implement authentication in Next.js?">
  <OpenInTrigger />
  <OpenInContent>
    <OpenInChatGPT />
    <OpenInClaude />
    <OpenInT3 />
    <OpenInScira />
    <OpenInv0 />
    <OpenInCursor />
  </OpenInContent>
</OpenIn>
```

## Features

- Pre-configured links to popular AI chat platforms
- Context-based query passing for cleaner API
- Customizable dropdown trigger button
- Automatic URL parameter encoding for queries
- Support for ChatGPT, Claude, T3 Chat, Scira AI, v0, and Cursor
- Branded icons for each platform
- TypeScript support with proper type definitions
- Accessible dropdown menu with keyboard navigation
- External link indicators for clarity

## Supported Platforms

- **ChatGPT** - Opens query in OpenAI's ChatGPT with search hints
- **Claude** - Opens query in Anthropic's Claude AI
- **T3 Chat** - Opens query in T3 Chat platform
- **Scira AI** - Opens query in Scira's AI assistant
- **v0** - Opens query in Vercel's v0 platform
- **Cursor** - Opens query in Cursor AI editor

## Props

### `<OpenIn />`

<PropertiesTable
  content={[
    {
      name: 'query',
      type: 'string',
      description: 'The query text to be sent to all AI platforms.',
    },
    {
      name: '[...props]',
      type: 'React.ComponentProps<typeof DropdownMenu>',
      description: 'Props to spread to the underlying radix-ui DropdownMenu component.',
    },
  ]}
/>

### `<OpenInTrigger />`

<PropertiesTable
  content={[
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'Custom trigger button. Defaults to "Open in chat" button with chevron icon.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'React.ComponentProps<typeof DropdownMenuTrigger>',
      description: 'Props to spread to the underlying DropdownMenuTrigger component.',
    },
  ]}
/>

### `<OpenInContent />`

<PropertiesTable
  content={[
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the dropdown content.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'React.ComponentProps<typeof DropdownMenuContent>',
      description: 'Props to spread to the underlying DropdownMenuContent component.',
    },
  ]}
/>

### `<OpenInChatGPT />`, `<OpenInClaude />`, `<OpenInT3 />`, `<OpenInScira />`, `<OpenInv0 />`, `<OpenInCursor />`

<PropertiesTable
  content={[
    {
      name: '[...props]',
      type: 'React.ComponentProps<typeof DropdownMenuItem>',
      description: 'Props to spread to the underlying DropdownMenuItem component. The query is automatically provided via context from the parent OpenIn component.',
    },
  ]}
/>

### `<OpenInItem />`, `<OpenInLabel />`, `<OpenInSeparator />`

Additional composable components for custom dropdown menu items, labels, and separators that follow the same props pattern as their underlying radix-ui counterparts.
---
title: Prompt Input
description: Allows a user to send a message with file attachments to a large language model. It includes a textarea, file upload capabilities, a submit button, and a dropdown for selecting the model.
path: elements/components/prompt-input
---
