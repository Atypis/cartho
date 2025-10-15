# Code Block

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# Code Block

The `CodeBlock` component provides syntax highlighting, line numbers, and copy to clipboard functionality for code blocks.

<Preview path="code-block" />

## Installation

<ElementsInstaller path="code-block" />

## Usage

```tsx
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block';
```

```tsx
<CodeBlock data={"console.log('hello world')"} language="jsx">
  <CodeBlockCopyButton
    onCopy={() => console.log('Copied code to clipboard')}
    onError={() => console.error('Failed to copy code to clipboard')}
  />
</CodeBlock>
```

## Usage with AI SDK

Build a simple code generation tool using the [`experimental_useObject`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-object) hook.

Add the following component to your frontend:

```tsx filename="app/page.tsx"
'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { codeBlockSchema } from '@/app/api/codegen/route';
import {
  Input,
  PromptInputTextarea,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
import {
  CodeBlock,
  CodeBlockCopyButton,
} from '@/components/ai-elements/code-block';
import { useState } from 'react';

export default function Page() {
  const [input, setInput] = useState('');
  const { object, submit, isLoading } = useObject({
    api: '/api/codegen',
    schema: codeBlockSchema,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      submit(input);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-[600px]">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto mb-4">
          {object?.code && object?.language && (
            <CodeBlock
              code={object.code}
              language={object.language}
              showLineNumbers={true}
            >
              <CodeBlockCopyButton />
            </CodeBlock>
          )}
        </div>

        <Input
          onSubmit={handleSubmit}
          className="mt-4 w-full max-w-2xl mx-auto relative"
        >
          <PromptInputTextarea
            value={input}
            placeholder="Generate a React todolist component"
            onChange={(e) => setInput(e.currentTarget.value)}
            className="pr-12"
          />
          <PromptInputSubmit
            status={isLoading ? 'streaming' : 'ready'}
            disabled={!input.trim()}
            className="absolute bottom-1 right-1"
          />
        </Input>
      </div>
    </div>
  );
}
```

Add the following route to your backend:

```tsx filename="api/codegen/route.ts"
import { streamObject } from 'ai';
import { z } from 'zod';

export const codeBlockSchema = z.object({
  language: z.string(),
  filename: z.string(),
  code: z.string(),
});
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: 'openai/gpt-4o',
    schema: codeBlockSchema,
    prompt:
      `You are a helpful coding assitant. Only generate code, no markdown formatting or backticks, or text.` +
      context,
  });

  return result.toTextStreamResponse();
}
```

## Features

- Syntax highlighting with react-syntax-highlighter
- Line numbers (optional)
- Copy to clipboard functionality
- Automatic light/dark theme switching
- Customizable styles
- Accessible design

## Examples

### Dark Mode

To use the `CodeBlock` component in dark mode, you can wrap it in a `div` with the `dark` class.

<Preview path="code-block-dark" />

## Props

### `<CodeBlock />`

<PropertiesTable
  content={[
    {
      name: 'code',
      type: 'string',
      description: 'The code content to display.',
    },
    {
      name: 'language',
      type: 'string',
      description: 'The programming language for syntax highlighting.',
    },
    {
      name: 'showLineNumbers',
      type: 'boolean',
      description: 'Whether to show line numbers. Default: false.',
      isOptional: true,
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description:
        'Child elements (like CodeBlockCopyButton) positioned in the top-right corner.',
      isOptional: true,
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the root container.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'React.HTMLAttributes<HTMLDivElement>',
      description: 'Any other props are spread to the root div.',
      isOptional: true,
    },
  ]}
/>

### `<CodeBlockCopyButton />`

<PropertiesTable
  content={[
    {
      name: 'onCopy',
      type: '() => void',
      description: 'Callback fired after a successful copy.',
      isOptional: true,
    },
    {
      name: 'onError',
      type: '(error: Error) => void',
      description: 'Callback fired if copying fails.',
      isOptional: true,
    },
    {
      name: 'timeout',
      type: 'number',
      description: 'How long to show the copied state (ms). Default: 2000.',
      isOptional: true,
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description:
        'Custom content for the button. Defaults to copy/check icons.',
      isOptional: true,
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the button.',
      isOptional: true,
    },
    {
      name: '[...props]',
      type: 'React.ComponentProps<typeof Button>',
      description:
        'Any other props are spread to the underlying shadcn/ui Button component.',
      isOptional: true,
    },
  ]}
/>

---
title: Context
description: A compound component system for displaying AI model context window usage, token consumption, and cost estimation.
path: elements/components/context
---
