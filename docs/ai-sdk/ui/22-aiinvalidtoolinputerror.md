# AI_InvalidToolInputError

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# AI_InvalidToolInputError

This error occurs when invalid tool input was provided.

## Properties

- `toolName`: The name of the tool with invalid inputs
- `toolInput`: The invalid tool inputs
- `message`: The error message
- `cause`: The cause of the error

## Checking for this Error

You can check if an error is an instance of `AI_InvalidToolInputError` using:

```typescript
import { InvalidToolInputError } from 'ai';

if (InvalidToolInputError.isInstance(error)) {
  // Handle the error
}
```

---
title: AI_JSONParseError
description: Learn how to fix AI_JSONParseError
---
