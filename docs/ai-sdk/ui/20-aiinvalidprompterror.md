# AI_InvalidPromptError

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# AI_InvalidPromptError

This error occurs when the prompt provided is invalid.

## Properties

- `prompt`: The invalid prompt value
- `message`: The error message
- `cause`: The cause of the error

## Checking for this Error

You can check if an error is an instance of `AI_InvalidPromptError` using:

```typescript
import { InvalidPromptError } from 'ai';

if (InvalidPromptError.isInstance(error)) {
  // Handle the error
}
```

---
title: AI_InvalidResponseDataError
description: Learn how to fix AI_InvalidResponseDataError
---
