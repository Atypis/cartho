# AI_UnsupportedFunctionalityError

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# AI_UnsupportedFunctionalityError

This error occurs when functionality is not unsupported.

## Properties

- `functionality`: The name of the unsupported functionality
- `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_UnsupportedFunctionalityError` using:

```typescript
import { UnsupportedFunctionalityError } from 'ai';

if (UnsupportedFunctionalityError.isInstance(error)) {
  // Handle the error
}
```

---
title: Setup
description: How to install and set up AI Elements components in your project
---
