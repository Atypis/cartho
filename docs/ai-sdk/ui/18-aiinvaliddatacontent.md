# AI_InvalidDataContent

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# AI_InvalidDataContent

This error occurs when invalid data content is provided.

## Properties

- `content`: The invalid content value
- `message`: The error message
- `cause`: The cause of the error

## Checking for this Error

You can check if an error is an instance of `AI_InvalidDataContent` using:

```typescript
import { InvalidDataContent } from 'ai';

if (InvalidDataContent.isInstance(error)) {
  // Handle the error
}
```

---
title: AI_InvalidMessageRoleError
description: Learn how to fix AI_InvalidMessageRoleError
---
