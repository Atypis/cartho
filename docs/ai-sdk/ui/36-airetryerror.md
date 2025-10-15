# AI_RetryError

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# AI_RetryError

This error occurs when a retry operation fails.

## Properties

- `reason`: The reason for the retry failure
- `lastError`: The most recent error that occurred during retries
- `errors`: Array of all errors that occurred during retry attempts
- `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_RetryError` using:

```typescript
import { RetryError } from 'ai';

if (RetryError.isInstance(error)) {
  // Handle the error
}
```

---
title: AI_TooManyEmbeddingValuesForCallError
description: Learn how to fix AI_TooManyEmbeddingValuesForCallError
---
