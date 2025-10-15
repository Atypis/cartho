# AI_NoTranscriptGeneratedError

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# AI_NoTranscriptGeneratedError

This error occurs when no transcript could be generated from the input.

## Properties

- `responses`: Array of responses
- `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_NoTranscriptGeneratedError` using:

```typescript
import { NoTranscriptGeneratedError } from 'ai';

if (NoTranscriptGeneratedError.isInstance(error)) {
  // Handle the error
}
```

---
title: AI_RetryError
description: Learn how to fix AI_RetryError
---
