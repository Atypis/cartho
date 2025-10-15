# AI_InvalidResponseDataError

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# AI_InvalidResponseDataError

This error occurs when the server returns a response with invalid data content.

## Properties

- `data`: The invalid response data value
- `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_InvalidResponseDataError` using:

```typescript
import { InvalidResponseDataError } from 'ai';

if (InvalidResponseDataError.isInstance(error)) {
  // Handle the error
}
```

---
title: AI_InvalidToolInputError
description: Learn how to fix AI_InvalidToolInputError
---
