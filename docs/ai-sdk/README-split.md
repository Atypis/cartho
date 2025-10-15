# AI SDK v5 Documentation (Organized)

**Source:** https://ai-sdk.dev/
**Last updated:** 2025-10-13T10:23:14.747Z

This directory contains the complete AI SDK v5 documentation split into organized files.

## Directory Structure


### agents/
*Building AI agents*

5 files

### core/
*AI SDK Core - text generation, tools, embeddings*

18 files

### guides/
*Step-by-step guides for common use cases*

6 files

### misc/
*Additional documentation*

15 files

### ui/
*AI SDK UI - React hooks and components*

111 files

## Complete Documentation

For the complete, unsplit documentation in a single file:
- [ai-sdk-complete.md](ai-sdk-complete.md) (1.1 MB)

## Quick Links

### Most Relevant for Your Project

**AI SDK UI (Chat Interface)**
- [ui/00-overview.md](ui/00-overview.md)
- Look for: useChat, useCompletion, tool calling

**AI SDK Core (LLM Integration)**
- [core/00-overview.md](core/00-overview.md)
- Look for: generateText, streamText, tool usage

**Streaming & Tools**
- [foundations/](foundations/)
- Look for: streaming patterns, tool definitions

## Updating

To re-download and re-split the documentation:

```bash
# Download latest
curl -o docs/ai-sdk/ai-sdk-complete.md https://ai-sdk.dev/llms.txt

# Split into files
node scripts/split-ai-sdk-docs.js
```
