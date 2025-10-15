# AI Gateway Provider

**Source:** https://ai-sdk.dev/
**Section:** ui
**Split from:** ai-sdk-complete.md

---

# AI Gateway Provider

The [AI Gateway](https://vercel.com/docs/ai-gateway) provider connects you to models from multiple AI providers through a single interface. Instead of integrating with each provider separately, you can access OpenAI, Anthropic, Google, Meta, xAI, and other providers and their models.

## Features

- Access models from multiple providers without having to install additional provider modules/dependencies
- Use the same code structure across different AI providers
- Switch between models and providers easily
- Automatic authentication when deployed on Vercel
- View pricing information across providers
- Observability for AI model usage through the Vercel dashboard

## Setup

The Vercel AI Gateway provider is part of the AI SDK.

## Basic Usage

For most use cases, you can use the AI Gateway directly with a model string:

```ts
// use plain model string with global provider
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'openai/gpt-5',
  prompt: 'Hello world',
});
```

```ts
// use provider instance (requires version 5.0.36 or later)
import { generateText, gateway } from 'ai';

const { text } = await generateText({
  model: gateway('openai/gpt-5'),
  prompt: 'Hello world',
});
```

The AI SDK automatically uses the AI Gateway when you pass a model string in the `creator/model-name` format.

## Provider Instance

<Note>
  The `gateway` provider instance is available from the `ai` package in version
  5.0.36 and later.
</Note>

You can also import the default provider instance `gateway` from `ai`:

```ts
import { gateway } from 'ai';
```

You may want to create a custom provider instance when you need to:

- Set custom configuration options (API key, base URL, headers)
- Use the provider in a [provider registry](/docs/ai-sdk-core/provider-registry)
- Wrap the provider with [middleware](/docs/ai-sdk-core/middleware)
- Use different settings for different parts of your application

To create a custom provider instance, import `createGateway` from `ai`:

```ts
import { createGateway } from 'ai';

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
});
```

You can use the following optional settings to customize the AI Gateway provider instance:

- **baseURL** _string_

  Use a different URL prefix for API calls. The default prefix is `https://ai-gateway.vercel.sh/v1/ai`.

- **apiKey** _string_

  API key that is being sent using the `Authorization` header. It defaults to
  the `AI_GATEWAY_API_KEY` environment variable.

- **headers** _Record&lt;string,string&gt;_

  Custom headers to include in the requests.

- **fetch** _(input: RequestInfo, init?: RequestInit) => Promise&lt;Response&gt;_

  Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation.
  Defaults to the global `fetch` function.
  You can use it as a middleware to intercept requests,
  or to provide a custom fetch implementation for e.g. testing.

- **metadataCacheRefreshMillis** _number_

  How frequently to refresh the metadata cache in milliseconds. Defaults to 5 minutes (300,000ms).

## Authentication

The Gateway provider supports two authentication methods:

### API Key Authentication

Set your API key via environment variable:

```bash
AI_GATEWAY_API_KEY=your_api_key_here
```

Or pass it directly to the provider:

```ts
import { createGateway } from 'ai';

const gateway = createGateway({
  apiKey: 'your_api_key_here',
});
```

### OIDC Authentication (Vercel Deployments)

When deployed to Vercel, the AI Gateway provider supports authenticating using [OIDC (OpenID Connect)
tokens](https://vercel.com/docs/oidc) without API Keys.

#### How OIDC Authentication Works

1. **In Production/Preview Deployments**:

   - OIDC authentication is automatically handled
   - No manual configuration needed
   - Tokens are automatically obtained and refreshed

2. **In Local Development**:
   - First, install and authenticate with the [Vercel CLI](https://vercel.com/docs/cli)
   - Run `vercel env pull` to download your project's OIDC token locally
   - For automatic token management:
     - Use `vercel dev` to start your development server - this will handle token refreshing automatically
   - For manual token management:
     - If not using `vercel dev`, note that OIDC tokens expire after 12 hours
     - You'll need to run `vercel env pull` again to refresh the token before it expires

<Note>
  If an API Key is present (either passed directly or via environment), it will
  always be used, even if invalid.
</Note>

Read more about using OIDC tokens in the [Vercel AI Gateway docs](https://vercel.com/docs/ai-gateway#using-the-ai-gateway-with-a-vercel-oidc-token).

## Language Models

You can create language models using a provider instance. The first argument is the model ID in the format `creator/model-name`:

```ts
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'openai/gpt-5',
  prompt: 'Explain quantum computing in simple terms',
});
```

AI Gateway language models can also be used in the `streamText`, `generateObject`, and `streamObject` functions (see [AI SDK Core](/docs/ai-sdk-core)).

## Available Models

The AI Gateway supports models from OpenAI, Anthropic, Google, Meta, xAI, Mistral, DeepSeek, Amazon Bedrock, Cohere, Perplexity, Alibaba, and other providers.

For the complete list of available models, see the [AI Gateway documentation](https://vercel.com/docs/ai-gateway).

## Dynamic Model Discovery

You can discover available models programmatically:

```ts
import { gateway, generateText } from 'ai';

const availableModels = await gateway.getAvailableModels();

// List all available models
availableModels.models.forEach(model => {
  console.log(`${model.id}: ${model.name}`);
  if (model.description) {
    console.log(`  Description: ${model.description}`);
  }
  if (model.pricing) {
    console.log(`  Input: $${model.pricing.input}/token`);
    console.log(`  Output: $${model.pricing.output}/token`);
    if (model.pricing.cachedInputTokens) {
      console.log(
        `  Cached input (read): $${model.pricing.cachedInputTokens}/token`,
      );
    }
    if (model.pricing.cacheCreationInputTokens) {
      console.log(
        `  Cache creation (write): $${model.pricing.cacheCreationInputTokens}/token`,
      );
    }
  }
});

// Use any discovered model with plain string
const { text } = await generateText({
  model: availableModels.models[0].id, // e.g., 'openai/gpt-4o'
  prompt: 'Hello world',
});
```

## Credit Usage

You can check your team's current credit balance and usage:

```ts
import { gateway } from 'ai';

const credits = await gateway.getCredits();

console.log(`Team balance: ${credits.balance} credits`);
console.log(`Team total used: ${credits.total_used} credits`);
```

The `getCredits()` method returns your team's credit information based on the authenticated API key or OIDC token:

- **balance** _number_ - Your team's current available credit balance
- **total_used** _number_ - Total credits consumed by your team

## Examples

### Basic Text Generation

```ts
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4',
  prompt: 'Write a haiku about programming',
});

console.log(text);
```

### Streaming

```ts
import { streamText } from 'ai';

const { textStream } = await streamText({
  model: 'openai/gpt-5',
  prompt: 'Explain the benefits of serverless architecture',
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Tool Usage

```ts
import { generateText, tool } from 'ai';
import { z } from 'zod';

const { text } = await generateText({
  model: 'xai/grok-4',
  prompt: 'What is the weather like in San Francisco?',
  tools: {
    getWeather: tool({
      description: 'Get the current weather for a location',
      parameters: z.object({
        location: z.string().describe('The location to get weather for'),
      }),
      execute: async ({ location }) => {
        // Your weather API call here
        return `It's sunny in ${location}`;
      },
    }),
  },
});
```

## Provider Options

The AI Gateway provider accepts provider options that control routing behavior and provider-specific configurations.

### Gateway Provider Options

You can use the `gateway` key in `providerOptions` to control how AI Gateway routes requests:

```ts
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4',
  prompt: 'Explain quantum computing',
  providerOptions: {
    gateway: {
      order: ['vertex', 'anthropic'], // Try Vertex AI first, then Anthropic
      only: ['vertex', 'anthropic'], // Only use these providers
    },
  },
});
```

The following gateway provider options are available:

- **order** _string[]_

  Specifies the sequence of providers to attempt when routing requests. The gateway will try providers in the order specified. If a provider fails or is unavailable, it will move to the next provider in the list.

  Example: `order: ['bedrock', 'anthropic']` will attempt Amazon Bedrock first, then fall back to Anthropic.

- **only** _string[]_

  Restricts routing to only the specified providers. When set, the gateway will never route to providers not in this list, even if they would otherwise be available.

  Example: `only: ['anthropic', 'vertex']` will only allow routing to Anthropic or Vertex AI.

You can combine both options to have fine-grained control over routing:

```ts
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4',
  prompt: 'Write a haiku about programming',
  providerOptions: {
    gateway: {
      order: ['vertex'], // Prefer Vertex AI
      only: ['anthropic', 'vertex'], // Only allow these providers
    },
  },
});
```

### Provider-Specific Options

When using provider-specific options through AI Gateway, use the actual provider name (e.g. `anthropic`, `openai`, not `gateway`) as the key:

```ts
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4',
  prompt: 'Explain quantum computing',
  providerOptions: {
    gateway: {
      order: ['vertex', 'anthropic'],
    },
    anthropic: {
      thinking: { type: 'enabled', budgetTokens: 12000 },
    },
  },
});
```

This works with any provider supported by AI Gateway. Each provider has its own set of options - see the individual [provider documentation pages](/providers/ai-sdk-providers) for details on provider-specific options.

### Available Providers

AI Gateway supports routing to 20+ providers.

For a complete list of available providers and their slugs, see the [AI Gateway documentation](https://vercel.com/docs/ai-gateway/provider-options#available-providers).

## Model Capabilities

Model capabilities depend on the specific provider and model you're using. For detailed capability information, see:

- [AI Gateway provider options](https://vercel.com/docs/ai-gateway/provider-options#available-providers) for an overview of available providers
- Individual [AI SDK provider pages](/providers/ai-sdk-providers) for specific model capabilities and features

---
title: xAI Grok
description: Learn how to use xAI Grok.
---

# xAI Grok Provider

The [xAI Grok](https://x.ai) provider contains language model support for the [xAI API](https://x.ai/api).

## Setup

The xAI Grok provider is available via the `@ai-sdk/xai` module. You can
install it with

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  <Tab>
    <Snippet text="pnpm add @ai-sdk/xai" dark />
  </Tab>
  <Tab>
    <Snippet text="npm install @ai-sdk/xai" dark />
  </Tab>
  <Tab>
    <Snippet text="yarn add @ai-sdk/xai" dark />
  </Tab>

  <Tab>
    <Snippet text="bun add @ai-sdk/xai" dark />
  </Tab>
</Tabs>

## Provider Instance

You can import the default provider instance `xai` from `@ai-sdk/xai`:

```ts
import { xai } from '@ai-sdk/xai';
```

If you need a customized setup, you can import `createXai` from `@ai-sdk/xai`
and create a provider instance with your settings:

```ts
import { createXai } from '@ai-sdk/xai';

const xai = createXai({
  apiKey: 'your-api-key',
});
```

You can use the following optional settings to customize the xAI provider instance:

- **baseURL** _string_

  Use a different URL prefix for API calls, e.g. to use proxy servers.
  The default prefix is `https://api.x.ai/v1`.

- **apiKey** _string_

  API key that is being sent using the `Authorization` header. It defaults to
  the `XAI_API_KEY` environment variable.

- **headers** _Record&lt;string,string&gt;_

  Custom headers to include in the requests.

- **fetch** _(input: RequestInfo, init?: RequestInit) => Promise&lt;Response&gt;_

  Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation.
  Defaults to the global `fetch` function.
  You can use it as a middleware to intercept requests,
  or to provide a custom fetch implementation for e.g. testing.

## Language Models

You can create [xAI models](https://console.x.ai) using a provider instance. The
first argument is the model id, e.g. `grok-3`.

```ts
const model = xai('grok-3');
```

### Example

You can use xAI language models to generate text with the `generateText` function:

```ts
import { xai } from '@ai-sdk/xai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: xai('grok-3'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

xAI language models can also be used in the `streamText`, `generateObject`, and `streamObject` functions
(see [AI SDK Core](/docs/ai-sdk-core)).

### Provider Options

xAI chat models support additional provider options that are not part of
the [standard call settings](/docs/ai-sdk-core/settings). You can pass them in the `providerOptions` argument:

```ts
const model = xai('grok-3-mini');

await generateText({
  model,
  providerOptions: {
    xai: {
      reasoningEffort: 'high',
    },
  },
});
```

The following optional provider options are available for xAI chat models:

- **reasoningEffort** _'low' | 'high'_

  Reasoning effort for reasoning models. Only supported by `grok-3-mini` and `grok-3-mini-fast` models.

## Live Search

xAI models support Live Search functionality, allowing them to query real-time data from various sources and include it in responses with citations.

### Basic Search

To enable search, specify `searchParameters` with a search mode:

```ts
import { xai } from '@ai-sdk/xai';
import { generateText } from 'ai';

const { text, sources } = await generateText({
  model: xai('grok-3-latest'),
  prompt: 'What are the latest developments in AI?',
  providerOptions: {
    xai: {
      searchParameters: {
        mode: 'auto', // 'auto', 'on', or 'off'
        returnCitations: true,
        maxSearchResults: 5,
      },
    },
  },
});

console.log(text);
console.log('Sources:', sources);
```

### Search Parameters

The following search parameters are available:

- **mode** _'auto' | 'on' | 'off'_

  Search mode preference:

  - `'auto'` (default): Model decides whether to search
  - `'on'`: Always enables search
  - `'off'`: Disables search completely

- **returnCitations** _boolean_

  Whether to return citations in the response. Defaults to `true`.

- **fromDate** _string_

  Start date for search data in ISO8601 format (`YYYY-MM-DD`).

- **toDate** _string_

  End date for search data in ISO8601 format (`YYYY-MM-DD`).

- **maxSearchResults** _number_

  Maximum number of search results to consider. Defaults to 20, max 50.

- **sources** _Array&lt;SearchSource&gt;_

  Data sources to search from. Defaults to `["web", "x"]` if not specified.

### Search Sources

You can specify different types of data sources for search:

#### Web Search

```ts
const result = await generateText({
  model: xai('grok-3-latest'),
  prompt: 'Best ski resorts in Switzerland',
  providerOptions: {
    xai: {
      searchParameters: {
        mode: 'on',
        sources: [
          {
            type: 'web',
            country: 'CH', // ISO alpha-2 country code
            allowedWebsites: ['ski.com', 'snow-forecast.com'],
            safeSearch: true,
          },
        ],
      },
    },
  },
});
```

#### Web source parameters

- **country** _string_: ISO alpha-2 country code
- **allowedWebsites** _string[]_: Max 5 allowed websites
- **excludedWebsites** _string[]_: Max 5 excluded websites
- **safeSearch** _boolean_: Enable safe search (default: true)

#### X (Twitter) Search

```ts
const result = await generateText({
  model: xai('grok-3-latest'),
  prompt: 'Latest updates on Grok AI',
  providerOptions: {
    xai: {
      searchParameters: {
        mode: 'on',
        sources: [
          {
            type: 'x',
            includedXHandles: ['grok', 'xai'],
            excludedXHandles: ['openai'],
            postFavoriteCount: 10,
            postViewCount: 100,
          },
        ],
      },
    },
  },
});
```

#### X source parameters

- **includedXHandles** _string[]_: Array of X handles to search (without @ symbol)
- **excludedXHandles** _string[]_: Array of X handles to exclude from search (without @ symbol)
- **postFavoriteCount** _number_: Minimum favorite count of the X posts to consider.
- **postViewCount** _number_: Minimum view count of the X posts to consider.

#### News Search

```ts
const result = await generateText({
  model: xai('grok-3-latest'),
  prompt: 'Recent tech industry news',
  providerOptions: {
    xai: {
      searchParameters: {
        mode: 'on',
        sources: [
          {
            type: 'news',
            country: 'US',
            excludedWebsites: ['tabloid.com'],
            safeSearch: true,
          },
        ],
      },
    },
  },
});
```

#### News source parameters

- **country** _string_: ISO alpha-2 country code
- **excludedWebsites** _string[]_: Max 5 excluded websites
- **safeSearch** _boolean_: Enable safe search (default: true)

#### RSS Feed Search

```ts
const result = await generateText({
  model: xai('grok-3-latest'),
  prompt: 'Latest status updates',
  providerOptions: {
    xai: {
      searchParameters: {
        mode: 'on',
        sources: [
          {
            type: 'rss',
            links: ['https://status.x.ai/feed.xml'],
          },
        ],
      },
    },
  },
});
```

#### RSS source parameters

- **links** _string[]_: Array of RSS feed URLs (max 1 currently supported)

### Multiple Sources

You can combine multiple data sources in a single search:

```ts
const result = await generateText({
  model: xai('grok-3-latest'),
  prompt: 'Comprehensive overview of recent AI breakthroughs',
  providerOptions: {
    xai: {
      searchParameters: {
        mode: 'on',
        returnCitations: true,
        maxSearchResults: 15,
        sources: [
          {
            type: 'web',
            allowedWebsites: ['arxiv.org', 'openai.com'],
          },
          {
            type: 'news',
            country: 'US',
          },
          {
            type: 'x',
            includedXHandles: ['openai', 'deepmind'],
          },
        ],
      },
    },
  },
});
```

### Sources and Citations

When search is enabled with `returnCitations: true`, the response includes sources that were used to generate the answer:

```ts
const { text, sources } = await generateText({
  model: xai('grok-3-latest'),
  prompt: 'What are the latest developments in AI?',
  providerOptions: {
    xai: {
      searchParameters: {
        mode: 'auto',
        returnCitations: true,
      },
    },
  },
});

// Access the sources used
for (const source of sources) {
  if (source.sourceType === 'url') {
    console.log('Source:', source.url);
  }
}
```

### Streaming with Search

Live Search works with streaming responses. Citations are included when the stream completes:

```ts
import { streamText } from 'ai';

const result = streamText({
  model: xai('grok-3-latest'),
  prompt: 'What has happened in tech recently?',
  providerOptions: {
    xai: {
      searchParameters: {
        mode: 'auto',
        returnCitations: true,
      },
    },
  },
});

for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}

console.log('Sources:', await result.sources);
```

## Model Capabilities

| Model                       | Image Input         | Object Generation   | Tool Usage          | Tool Streaming      | Reasoning           |
| --------------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| `grok-4-fast-non-reasoning` | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-4-fast-reasoning`     | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| `grok-code-fast-1`          | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| `grok-4`                    | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-3`                    | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-3-latest`             | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-3-fast`               | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-3-fast-latest`        | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-3-mini`               | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| `grok-3-mini-latest`        | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| `grok-3-mini-fast`          | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| `grok-3-mini-fast-latest`   | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> |
| `grok-2`                    | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-2-latest`             | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-2-1212`               | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-2-vision`             | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-2-vision-latest`      | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-2-vision-1212`        | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-beta`                 | <Cross size={18} /> | <Check size={18} /> | <Check size={18} /> | <Check size={18} /> | <Cross size={18} /> |
| `grok-vision-beta`          | <Check size={18} /> | <Cross size={18} /> | <Cross size={18} /> | <Cross size={18} /> | <Cross size={18} /> |

<Note>
  The table above lists popular models. Please see the [xAI
  docs](https://docs.x.ai/docs#models) for a full list of available models. The
  table above lists popular models. You can also pass any available provider
  model ID as a string if needed.
</Note>

## Image Models

You can create xAI image models using the `.image()` factory method. For more on image generation with the AI SDK see [generateImage()](/docs/reference/ai-sdk-core/generate-image).

```ts
import { xai } from '@ai-sdk/xai';
import { experimental_generateImage as generateImage } from 'ai';

const { image } = await generateImage({
  model: xai.image('grok-2-image'),
  prompt: 'A futuristic cityscape at sunset',
});
```

<Note>
  The xAI image model does not currently support the `aspectRatio` or `size`
  parameters. Image size defaults to 1024x768.
</Note>

### Model-specific options

You can customize the image generation behavior with model-specific settings:

```ts
import { xai } from '@ai-sdk/xai';
import { experimental_generateImage as generateImage } from 'ai';

const { images } = await generateImage({
  model: xai.image('grok-2-image'),
  prompt: 'A futuristic cityscape at sunset',
  maxImagesPerCall: 5, // Default is 10
  n: 2, // Generate 2 images
});
```

### Model Capabilities

| Model          | Sizes              | Notes                                                                                                                                                                                                    |
| -------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grok-2-image` | 1024x768 (default) | xAI's text-to-image generation model, designed to create high-quality images from text prompts. It's trained on a diverse dataset and can generate images across various styles, subjects, and settings. |

---
title: Vercel
description: Learn how to use Vercel's v0 models with the AI SDK.
---
