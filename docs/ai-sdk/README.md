# Vercel AI SDK v5 Documentation

**Source:** https://ai-sdk.dev/llms.txt
**Downloaded:** 2025-10-13
**Size:** 1.1 MB (36,337 lines)

## Contents

This single file contains the **complete AI SDK v5 documentation** in LLM-friendly markdown format, including:

### Guides & Cookbook
- RAG Agent
- Multi-Modal Agent
- Slack AI Agent
- Natural Language Postgres
- Computer Use (Anthropic)
- Various provider getting-started guides (Gemini, Claude, GPT-5, o1, o3-mini, DeepSeek R1, Llama)
- Framework integration examples (Node.js, Express, Hono, Fastify, Nest.js)

### Core Documentation

**Foundations**
- Providers and Models
- Prompts
- Tools
- Streaming

**Agents**
- Building Agents
- Workflow Patterns
- Loop Control

**AI SDK Core**
- Generating Text
- Generating Structured Data
- Tool Calling
- MCP Tools
- Prompt Engineering
- Settings
- Embeddings
- Image Generation
- Transcription
- Speech
- Middleware
- Provider Management
- Error Handling
- Testing
- Telemetry

**AI SDK UI**
- Overview
- Chatbot (persistence, resume, tools)
- Generative User Interfaces
- Completion
- Object Generation
- Streaming Custom Data
- Error Handling
- Transport
- Message Metadata
- Stream Protocols

**AI SDK RSC** (experimental)
- Streaming React Components
- Generative UI State
- Multi-step Interfaces
- Error Handling
- Authentication

**Advanced Topics**
- Prompt Engineering
- Stopping Streams
- Backpressure
- Caching
- Rate Limiting
- Sequential Generations

**Reference**
- Complete API documentation for all functions, hooks, and types

## Usage

This file is optimized for LLM consumption. You can:

1. **Use as-is**: Load the entire file for comprehensive context
2. **Search specific topics**: Use grep/search to find relevant sections
3. **Split into sections**: Run a script to divide by headers if needed

## Quick Search Examples

```bash
# Find useChat documentation
grep -A 50 "useChat" docs/ai-sdk/ai-sdk-complete.md

# Find tool calling examples
grep -A 30 "Tool Calling" docs/ai-sdk/ai-sdk-complete.md

# Find streaming documentation
grep -A 40 "Streaming" docs/ai-sdk/ai-sdk-complete.md
```

## Updating

To get the latest documentation:

```bash
curl -o docs/ai-sdk/ai-sdk-complete.md https://ai-sdk.dev/llms.txt
```

## Related Documentation

- [React Flow Documentation](../react-flow/)
- [OpenAI Responses API](../openai-responsesapi/)
