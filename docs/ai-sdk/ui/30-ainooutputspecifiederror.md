# AI_NoOutputSpecifiedError

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# AI_NoOutputSpecifiedError

This error occurs when no output format was specified for the AI response, and output-related methods are called.

## Properties

- `message`: The error message (defaults to 'No output specified.')

## Checking for this Error

You can check if an error is an instance of `AI_NoOutputSpecifiedError` using:

```typescript
import { NoOutputSpecifiedError } from 'ai';

if (NoOutputSpecifiedError.isInstance(error)) {
  // Handle the error
}
```

---
title: AI_NoSpeechGeneratedError
description: Learn how to fix AI_NoSpeechGeneratedError
---
