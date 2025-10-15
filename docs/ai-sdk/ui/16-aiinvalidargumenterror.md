# AI_InvalidArgumentError

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# AI_InvalidArgumentError

This error occurs when an invalid argument was provided.

## Properties

- `parameter`: The name of the parameter that is invalid
- `value`: The invalid value
- `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_InvalidArgumentError` using:

```typescript
import { InvalidArgumentError } from 'ai';

if (InvalidArgumentError.isInstance(error)) {
  // Handle the error
}
```

---
title: AI_InvalidDataContentError
description: How to fix AI_InvalidDataContentError
---
