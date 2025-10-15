# OpenAI Responses API

Generated from the official OpenAPI specification (`openapi.documented.yml`) as of 2025-10-13.

The raw spec is also stored alongside this file for deeper searches or tooling integration.

Creates a model response. Provide [text](https://platform.openai.com/docs/guides/text) or
[image](https://platform.openai.com/docs/guides/images) inputs to generate 
[text](https://platform.openai.com/docs/guides/text)
or [JSON](https://platform.openai.com/docs/guides/structured-outputs) outputs. Have the model call
your own [custom code](https://platform.openai.com/docs/guides/function-calling) or use built-in
[tools](https://platform.openai.com/docs/guides/tools) like [web 
search](https://platform.openai.com/docs/guides/tools-web-search)
or [file search](https://platform.openai.com/docs/guides/tools-file-search) to use your own data
as input for the model's response.


### POST /responses — Create a model response

Creates a model response. Provide [text](https://platform.openai.com/docs/guides/text) or
[image](https://platform.openai.com/docs/guides/images) inputs to generate 
[text](https://platform.openai.com/docs/guides/text)
or [JSON](https://platform.openai.com/docs/guides/structured-outputs) outputs. Have the model call
your own [custom code](https://platform.openai.com/docs/guides/function-calling) or use built-in
[tools](https://platform.openai.com/docs/guides/tools) like [web 
search](https://platform.openai.com/docs/guides/tools-web-search)
or [file search](https://platform.openai.com/docs/guides/tools-file-search) to use your own data
as input for the model's response.


#### Request Body (application/json)
- `background` (boolean; nullable; default `False`) — Whether to run the model response in the background.
[Learn more](https://platform.openai.com/docs/guides/background).
- `conversation` (object | string [ConversationParam]; nullable) — The conversation that this response belongs to. Items from this conversation are prepended to `input_items` for this response request.
Input items and output items from this response are automatically added to this conversation after this response completes.
- `include` (array<string [Includable]> [Includable]; nullable) — Specify additional output data to include in the model response. Currently
supported values are:
- `web_search_call.action.sources`: Include the sources of the web search tool call.
- `code_interpreter_call.outputs`: Includes the outputs of python code execution
  in code interpreter tool call items.
- `computer_call_output.output.image_url`: Include image urls from the computer call output.
- `file_search_call.results`: Include the search results of
  the file search tool call.
- `message.input_image.image_url`: Include image urls from the input message.
- `message.output_text.logprobs`: Include logprobs with assistant messages.
- `reasoning.encrypted_content`: Includes an encrypted version of reasoning
  tokens in reasoning item outputs. This enables reasoning items to be used in
  multi-turn conversations when using the Responses API statelessly (like
  when the `store` parameter is set to `false`, or when an organization is
  enrolled in the zero data retention program). Allowed values: `code_interpreter_call.outputs`, `computer_call_output.output.image_url`, `file_search_call.results`, `message.input_image.image_url`, `message.output_text.logprobs`, `reasoning.encrypted_content`
- `input` (array<object [InputItem]> | string [InputItem]) — Text, image, or file inputs to the model, used to generate a response.

Learn more:
- [Text inputs and outputs](https://platform.openai.com/docs/guides/text)
- [Image inputs](https://platform.openai.com/docs/guides/images)
- [File inputs](https://platform.openai.com/docs/guides/pdf-files)
- [Conversation state](https://platform.openai.com/docs/guides/conversation-state)
- [Function calling](https://platform.openai.com/docs/guides/function-calling)
- `instructions` (string; nullable) — A system (or developer) message inserted into the model's context.

When using along with `previous_response_id`, the instructions from a previous
response will not be carried over to the next response. This makes it simple
to swap out system (or developer) messages in new responses.
- `max_output_tokens` (integer; nullable) — An upper bound for the number of tokens that can be generated for a response, including visible output tokens and [reasoning tokens](https://platform.openai.com/docs/guides/reasoning).
- `max_tool_calls` (integer; nullable) — The maximum number of total calls to built-in tools that can be processed in a response. This maximum number applies across all built-in tool calls, not per individual tool. Any further attempts to call a tool by the model will be ignored.
- `metadata` (object<string, string> [Metadata]; nullable) — Set of 16 key-value pairs that can be attached to an object. This can be
useful for storing additional information about the object in a structured
format, and querying for objects via API or the dashboard.

Keys are strings with a maximum length of 64 characters. Values are strings
with a maximum length of 512 characters.
- `model` (string [ModelIdsResponses]) — Model ID used to generate the response, like `gpt-4o` or `o3`. OpenAI
offers a wide range of models with different capabilities, performance
characteristics, and price points. Refer to the [model guide](https://platform.openai.com/docs/models)
to browse and compare available models. Allowed values (10 of 75 shown): `chatgpt-4o-latest`, `codex-mini-latest`, `computer-use-preview`, `computer-use-preview-2025-03-11`, `gpt-3.5-turbo`, `gpt-3.5-turbo-0125`, `gpt-3.5-turbo-0301`, `gpt-3.5-turbo-0613`, `gpt-3.5-turbo-1106`, `gpt-3.5-turbo-16k`, …
- `parallel_tool_calls` (boolean; nullable; default `True`) — Whether to allow the model to run tool calls in parallel.
- `previous_response_id` (string; nullable) — The unique ID of the previous response to the model. Use this to
create multi-turn conversations. Learn more about
[conversation state](https://platform.openai.com/docs/guides/conversation-state). Cannot be used in conjunction with `conversation`.
- `prompt` (object [Prompt]; nullable) — Reference to a prompt template and its variables.
[Learn more](https://platform.openai.com/docs/guides/text?api-mode=responses#reusable-prompts).
- `prompt_cache_key` (string) — Used by OpenAI to cache responses for similar requests to optimize your cache hit rates. Replaces the `user` field. [Learn more](https://platform.openai.com/docs/guides/prompt-caching).
- `reasoning` (object [Reasoning]; nullable) — **gpt-5 and o-series models only**

Configuration options for
[reasoning models](https://platform.openai.com/docs/guides/reasoning).
- `safety_identifier` (string) — A stable identifier used to help detect users of your application that may be violating OpenAI's usage policies.
The IDs should be a string that uniquely identifies each user. We recommend hashing their username or email address, in order to avoid sending us any identifying information. [Learn more](https://platform.openai.com/docs/guides/safety-best-practices#safety-identifiers).
- `service_tier` (string [ServiceTier]; nullable; default `auto`) — Specifies the processing type used for serving the request.
  - If set to 'auto', then the request will be processed with the service tier configured in the Project settings. Unless otherwise configured, the Project will use 'default'.
  - If set to 'default', then the request will be processed with the standard pricing and performance for the selected model.
  - If set to '[flex](https://platform.openai.com/docs/guides/flex-processing)' or '[priority](https://openai.com/api-priority-processing/)', then the request will be processed with the corresponding service tier.
  - When not set, the default behavior is 'auto'.

  When the `service_tier` parameter is set, the response body will include the `service_tier` value based on the processing mode actually used to serve the request. This response value may be different from the value set in the parameter. Allowed values: `auto`, `default`, `flex`, `priority`, `scale`
- `store` (boolean; nullable; default `True`) — Whether to store the generated model response for later retrieval via
API.
- `stream` (boolean; nullable; default `False`) — If set to true, the model response data will be streamed to the client
as it is generated using [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format).
See the [Streaming section below](https://platform.openai.com/docs/api-reference/responses-streaming)
for more information.
- `stream_options` (object [ResponseStreamOptions]; nullable) — Options for streaming responses. Only set this when you set `stream: true`.
- `temperature` (number; nullable; default `1`) — What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
We generally recommend altering this or `top_p` but not both.
- `text` (object) — Configuration options for a text response from the model. Can be plain
text or structured JSON data. Learn more:
- [Text inputs and outputs](https://platform.openai.com/docs/guides/text)
- [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- `tool_choice` (object | string [ToolChoiceAllowed, ToolChoiceCustom, ToolChoiceFunction, ToolChoiceMCP, ToolChoiceOptions, ToolChoiceTypes]) — How the model should select which tool (or tools) to use when generating
a response. See the `tools` parameter to see how to specify which tools
the model can call. Allowed values: `auto`, `none`, `required`
- `tools` (array<object [Tool]> [Tool]) — An array of tools the model may call while generating a response. You
can specify which tool to use by setting the `tool_choice` parameter.

We support the following categories of tools:
- **Built-in tools**: Tools that are provided by OpenAI that extend the
  model's capabilities, like [web search](https://platform.openai.com/docs/guides/tools-web-search)
  or [file search](https://platform.openai.com/docs/guides/tools-file-search). Learn more about
  [built-in tools](https://platform.openai.com/docs/guides/tools).
- **MCP Tools**: Integrations with third-party systems via custom MCP servers
  or predefined connectors such as Google Drive and SharePoint. Learn more about
  [MCP Tools](https://platform.openai.com/docs/guides/tools-connectors-mcp).
- **Function calls (custom tools)**: Functions that are defined by you,
  enabling the model to call your own code with strongly typed arguments
  and outputs. Learn more about
  [function calling](https://platform.openai.com/docs/guides/function-calling). You can also use
  custom tools to call your own code.
- `top_logprobs` (integer; nullable) — An integer between 0 and 20 specifying the number of most likely tokens to
return at each token position, each with an associated log probability.
- `top_p` (number; nullable; default `1`) — An alternative to sampling with temperature, called nucleus sampling,
where the model considers the results of the tokens with top_p probability
mass. So 0.1 means only the tokens comprising the top 10% probability mass
are considered.

We generally recommend altering this or `temperature` but not both.
- `truncation` (string; nullable; default `disabled`) — The truncation strategy to use for the model response.
- `auto`: If the input to this Response exceeds
  the model's context window size, the model will truncate the
  response to fit the context window by dropping items from the beginning of the conversation.
- `disabled` (default): If the input size will exceed the context window
  size for a model, the request will fail with a 400 error. Allowed values: `auto`, `disabled`
- `user` (string) — This field is being replaced by `safety_identifier` and `prompt_cache_key`. Use `prompt_cache_key` instead to maintain caching optimizations.
A stable identifier for your end-users.
Used to boost cache hit rates by better bucketing similar requests and  to help OpenAI detect and prevent abuse. [Learn more](https://platform.openai.com/docs/guides/safety-best-practices#safety-identifiers). **Deprecated.**

#### HTTP 200 — OK
**application/json**
- `background` (boolean; nullable; default `False`) — Whether to run the model response in the background.
[Learn more](https://platform.openai.com/docs/guides/background).
- `conversation` (object [Conversation-2]; nullable) — The conversation that this response belongs to. Input items and output items from this response are automatically added to this conversation.
- `created_at` (number; required) — Unix timestamp (in seconds) of when this Response was created.
- `error` (object [ResponseError]; required; nullable) — An error object returned when the model fails to generate a Response.
- `id` (string; required) — Unique identifier for this Response.
- `incomplete_details` (object; required; nullable) — Details about why the response is incomplete.
- `instructions` (array<object [InputItem]> | string [InputItem]; required; nullable) — A system (or developer) message inserted into the model's context.

When using along with `previous_response_id`, the instructions from a previous
response will not be carried over to the next response. This makes it simple
to swap out system (or developer) messages in new responses.
- `max_output_tokens` (integer; nullable) — An upper bound for the number of tokens that can be generated for a response, including visible output tokens and [reasoning tokens](https://platform.openai.com/docs/guides/reasoning).
- `max_tool_calls` (integer; nullable) — The maximum number of total calls to built-in tools that can be processed in a response. This maximum number applies across all built-in tool calls, not per individual tool. Any further attempts to call a tool by the model will be ignored.
- `metadata` (object<string, string> [Metadata]; required; nullable) — Set of 16 key-value pairs that can be attached to an object. This can be
useful for storing additional information about the object in a structured
format, and querying for objects via API or the dashboard.

Keys are strings with a maximum length of 64 characters. Values are strings
with a maximum length of 512 characters.
- `model` (string [ModelIdsResponses]; required) — Model ID used to generate the response, like `gpt-4o` or `o3`. OpenAI
offers a wide range of models with different capabilities, performance
characteristics, and price points. Refer to the [model guide](https://platform.openai.com/docs/models)
to browse and compare available models. Allowed values (10 of 75 shown): `chatgpt-4o-latest`, `codex-mini-latest`, `computer-use-preview`, `computer-use-preview-2025-03-11`, `gpt-3.5-turbo`, `gpt-3.5-turbo-0125`, `gpt-3.5-turbo-0301`, `gpt-3.5-turbo-0613`, `gpt-3.5-turbo-1106`, `gpt-3.5-turbo-16k`, …
- `object` (string; required) — The object type of this resource - always set to `response`. Allowed values: `response`
- `output` (array<object [OutputItem]> [OutputItem]; required) — An array of content items generated by the model.

- The length and order of items in the `output` array is dependent
  on the model's response.
- Rather than accessing the first item in the `output` array and
  assuming it's an `assistant` message with the content generated by
  the model, you might consider using the `output_text` property where
  supported in SDKs.
- `output_text` (string; nullable) — SDK-only convenience property that contains the aggregated text output
from all `output_text` items in the `output` array, if any are present.
Supported in the Python and JavaScript SDKs.
- `parallel_tool_calls` (boolean; required; default `True`) — Whether to allow the model to run tool calls in parallel.
- `previous_response_id` (string; nullable) — The unique ID of the previous response to the model. Use this to
create multi-turn conversations. Learn more about
[conversation state](https://platform.openai.com/docs/guides/conversation-state). Cannot be used in conjunction with `conversation`.
- `prompt` (object [Prompt]; nullable) — Reference to a prompt template and its variables.
[Learn more](https://platform.openai.com/docs/guides/text?api-mode=responses#reusable-prompts).
- `prompt_cache_key` (string) — Used by OpenAI to cache responses for similar requests to optimize your cache hit rates. Replaces the `user` field. [Learn more](https://platform.openai.com/docs/guides/prompt-caching).
- `reasoning` (object [Reasoning]; nullable) — **gpt-5 and o-series models only**

Configuration options for
[reasoning models](https://platform.openai.com/docs/guides/reasoning).
- `safety_identifier` (string) — A stable identifier used to help detect users of your application that may be violating OpenAI's usage policies.
The IDs should be a string that uniquely identifies each user. We recommend hashing their username or email address, in order to avoid sending us any identifying information. [Learn more](https://platform.openai.com/docs/guides/safety-best-practices#safety-identifiers).
- `service_tier` (string [ServiceTier]; nullable; default `auto`) — Specifies the processing type used for serving the request.
  - If set to 'auto', then the request will be processed with the service tier configured in the Project settings. Unless otherwise configured, the Project will use 'default'.
  - If set to 'default', then the request will be processed with the standard pricing and performance for the selected model.
  - If set to '[flex](https://platform.openai.com/docs/guides/flex-processing)' or '[priority](https://openai.com/api-priority-processing/)', then the request will be processed with the corresponding service tier.
  - When not set, the default behavior is 'auto'.

  When the `service_tier` parameter is set, the response body will include the `service_tier` value based on the processing mode actually used to serve the request. This response value may be different from the value set in the parameter. Allowed values: `auto`, `default`, `flex`, `priority`, `scale`
- `status` (string) — The status of the response generation. One of `completed`, `failed`,
`in_progress`, `cancelled`, `queued`, or `incomplete`. Allowed values: `cancelled`, `completed`, `failed`, `in_progress`, `incomplete`, `queued`
- `temperature` (number; required; nullable; default `1`) — What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
We generally recommend altering this or `top_p` but not both.
- `text` (object) — Configuration options for a text response from the model. Can be plain
text or structured JSON data. Learn more:
- [Text inputs and outputs](https://platform.openai.com/docs/guides/text)
- [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- `tool_choice` (object | string [ToolChoiceAllowed, ToolChoiceCustom, ToolChoiceFunction, ToolChoiceMCP, ToolChoiceOptions, ToolChoiceTypes]; required) — How the model should select which tool (or tools) to use when generating
a response. See the `tools` parameter to see how to specify which tools
the model can call. Allowed values: `auto`, `none`, `required`
- `tools` (array<object [Tool]> [Tool]; required) — An array of tools the model may call while generating a response. You
can specify which tool to use by setting the `tool_choice` parameter.

We support the following categories of tools:
- **Built-in tools**: Tools that are provided by OpenAI that extend the
  model's capabilities, like [web search](https://platform.openai.com/docs/guides/tools-web-search)
  or [file search](https://platform.openai.com/docs/guides/tools-file-search). Learn more about
  [built-in tools](https://platform.openai.com/docs/guides/tools).
- **MCP Tools**: Integrations with third-party systems via custom MCP servers
  or predefined connectors such as Google Drive and SharePoint. Learn more about
  [MCP Tools](https://platform.openai.com/docs/guides/tools-connectors-mcp).
- **Function calls (custom tools)**: Functions that are defined by you,
  enabling the model to call your own code with strongly typed arguments
  and outputs. Learn more about
  [function calling](https://platform.openai.com/docs/guides/function-calling). You can also use
  custom tools to call your own code.
- `top_logprobs` (integer; nullable) — An integer between 0 and 20 specifying the number of most likely tokens to
return at each token position, each with an associated log probability.
- `top_p` (number; required; nullable; default `1`) — An alternative to sampling with temperature, called nucleus sampling,
where the model considers the results of the tokens with top_p probability
mass. So 0.1 means only the tokens comprising the top 10% probability mass
are considered.

We generally recommend altering this or `temperature` but not both.
- `truncation` (string; nullable; default `disabled`) — The truncation strategy to use for the model response.
- `auto`: If the input to this Response exceeds
  the model's context window size, the model will truncate the
  response to fit the context window by dropping items from the beginning of the conversation.
- `disabled` (default): If the input size will exceed the context window
  size for a model, the request will fail with a 400 error. Allowed values: `auto`, `disabled`
- `usage` (object [ResponseUsage]) — Represents token usage details including input tokens, output tokens,
a breakdown of output tokens, and the total tokens used.
- `user` (string) — This field is being replaced by `safety_identifier` and `prompt_cache_key`. Use `prompt_cache_key` instead to maintain caching optimizations.
A stable identifier for your end-users.
Used to boost cache hit rates by better bucketing similar requests and  to help OpenAI detect and prevent abuse. [Learn more](https://platform.openai.com/docs/guides/safety-best-practices#safety-identifiers). **Deprecated.**

**text/event-stream**
- Stream events follow `ResponseStreamEvent` variants (see spec).

### GET /responses/{response_id} — Get a model response

Retrieves a model response with the given ID.


#### Path Parameters
- `response_id` (string; required) — The ID of the response to retrieve.

#### Query Parameters
- `include` (array<string [Includable]> [Includable]) — Additional fields to include in the response. See the `include`
parameter for Response creation above for more information. Allowed values: `code_interpreter_call.outputs`, `computer_call_output.output.image_url`, `file_search_call.results`, `message.input_image.image_url`, `message.output_text.logprobs`, `reasoning.encrypted_content`
- `stream` (boolean) — If set to true, the model response data will be streamed to the client
as it is generated using [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format).
See the [Streaming section below](https://platform.openai.com/docs/api-reference/responses-streaming)
for more information.
- `starting_after` (integer) — The sequence number of the event after which to start streaming.
- `include_obfuscation` (boolean) — When true, stream obfuscation will be enabled. Stream obfuscation adds
random characters to an `obfuscation` field on streaming delta events
to normalize payload sizes as a mitigation to certain side-channel
attacks. These obfuscation fields are included by default, but add a
small amount of overhead to the data stream. You can set
`include_obfuscation` to false to optimize for bandwidth if you trust
the network links between your application and the OpenAI API.

#### HTTP 200 — OK
**application/json**
- `background` (boolean; nullable; default `False`) — Whether to run the model response in the background.
[Learn more](https://platform.openai.com/docs/guides/background).
- `conversation` (object [Conversation-2]; nullable) — The conversation that this response belongs to. Input items and output items from this response are automatically added to this conversation.
- `created_at` (number; required) — Unix timestamp (in seconds) of when this Response was created.
- `error` (object [ResponseError]; required; nullable) — An error object returned when the model fails to generate a Response.
- `id` (string; required) — Unique identifier for this Response.
- `incomplete_details` (object; required; nullable) — Details about why the response is incomplete.
- `instructions` (array<object [InputItem]> | string [InputItem]; required; nullable) — A system (or developer) message inserted into the model's context.

When using along with `previous_response_id`, the instructions from a previous
response will not be carried over to the next response. This makes it simple
to swap out system (or developer) messages in new responses.
- `max_output_tokens` (integer; nullable) — An upper bound for the number of tokens that can be generated for a response, including visible output tokens and [reasoning tokens](https://platform.openai.com/docs/guides/reasoning).
- `max_tool_calls` (integer; nullable) — The maximum number of total calls to built-in tools that can be processed in a response. This maximum number applies across all built-in tool calls, not per individual tool. Any further attempts to call a tool by the model will be ignored.
- `metadata` (object<string, string> [Metadata]; required; nullable) — Set of 16 key-value pairs that can be attached to an object. This can be
useful for storing additional information about the object in a structured
format, and querying for objects via API or the dashboard.

Keys are strings with a maximum length of 64 characters. Values are strings
with a maximum length of 512 characters.
- `model` (string [ModelIdsResponses]; required) — Model ID used to generate the response, like `gpt-4o` or `o3`. OpenAI
offers a wide range of models with different capabilities, performance
characteristics, and price points. Refer to the [model guide](https://platform.openai.com/docs/models)
to browse and compare available models. Allowed values (10 of 75 shown): `chatgpt-4o-latest`, `codex-mini-latest`, `computer-use-preview`, `computer-use-preview-2025-03-11`, `gpt-3.5-turbo`, `gpt-3.5-turbo-0125`, `gpt-3.5-turbo-0301`, `gpt-3.5-turbo-0613`, `gpt-3.5-turbo-1106`, `gpt-3.5-turbo-16k`, …
- `object` (string; required) — The object type of this resource - always set to `response`. Allowed values: `response`
- `output` (array<object [OutputItem]> [OutputItem]; required) — An array of content items generated by the model.

- The length and order of items in the `output` array is dependent
  on the model's response.
- Rather than accessing the first item in the `output` array and
  assuming it's an `assistant` message with the content generated by
  the model, you might consider using the `output_text` property where
  supported in SDKs.
- `output_text` (string; nullable) — SDK-only convenience property that contains the aggregated text output
from all `output_text` items in the `output` array, if any are present.
Supported in the Python and JavaScript SDKs.
- `parallel_tool_calls` (boolean; required; default `True`) — Whether to allow the model to run tool calls in parallel.
- `previous_response_id` (string; nullable) — The unique ID of the previous response to the model. Use this to
create multi-turn conversations. Learn more about
[conversation state](https://platform.openai.com/docs/guides/conversation-state). Cannot be used in conjunction with `conversation`.
- `prompt` (object [Prompt]; nullable) — Reference to a prompt template and its variables.
[Learn more](https://platform.openai.com/docs/guides/text?api-mode=responses#reusable-prompts).
- `prompt_cache_key` (string) — Used by OpenAI to cache responses for similar requests to optimize your cache hit rates. Replaces the `user` field. [Learn more](https://platform.openai.com/docs/guides/prompt-caching).
- `reasoning` (object [Reasoning]; nullable) — **gpt-5 and o-series models only**

Configuration options for
[reasoning models](https://platform.openai.com/docs/guides/reasoning).
- `safety_identifier` (string) — A stable identifier used to help detect users of your application that may be violating OpenAI's usage policies.
The IDs should be a string that uniquely identifies each user. We recommend hashing their username or email address, in order to avoid sending us any identifying information. [Learn more](https://platform.openai.com/docs/guides/safety-best-practices#safety-identifiers).
- `service_tier` (string [ServiceTier]; nullable; default `auto`) — Specifies the processing type used for serving the request.
  - If set to 'auto', then the request will be processed with the service tier configured in the Project settings. Unless otherwise configured, the Project will use 'default'.
  - If set to 'default', then the request will be processed with the standard pricing and performance for the selected model.
  - If set to '[flex](https://platform.openai.com/docs/guides/flex-processing)' or '[priority](https://openai.com/api-priority-processing/)', then the request will be processed with the corresponding service tier.
  - When not set, the default behavior is 'auto'.

  When the `service_tier` parameter is set, the response body will include the `service_tier` value based on the processing mode actually used to serve the request. This response value may be different from the value set in the parameter. Allowed values: `auto`, `default`, `flex`, `priority`, `scale`
- `status` (string) — The status of the response generation. One of `completed`, `failed`,
`in_progress`, `cancelled`, `queued`, or `incomplete`. Allowed values: `cancelled`, `completed`, `failed`, `in_progress`, `incomplete`, `queued`
- `temperature` (number; required; nullable; default `1`) — What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
We generally recommend altering this or `top_p` but not both.
- `text` (object) — Configuration options for a text response from the model. Can be plain
text or structured JSON data. Learn more:
- [Text inputs and outputs](https://platform.openai.com/docs/guides/text)
- [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- `tool_choice` (object | string [ToolChoiceAllowed, ToolChoiceCustom, ToolChoiceFunction, ToolChoiceMCP, ToolChoiceOptions, ToolChoiceTypes]; required) — How the model should select which tool (or tools) to use when generating
a response. See the `tools` parameter to see how to specify which tools
the model can call. Allowed values: `auto`, `none`, `required`
- `tools` (array<object [Tool]> [Tool]; required) — An array of tools the model may call while generating a response. You
can specify which tool to use by setting the `tool_choice` parameter.

We support the following categories of tools:
- **Built-in tools**: Tools that are provided by OpenAI that extend the
  model's capabilities, like [web search](https://platform.openai.com/docs/guides/tools-web-search)
  or [file search](https://platform.openai.com/docs/guides/tools-file-search). Learn more about
  [built-in tools](https://platform.openai.com/docs/guides/tools).
- **MCP Tools**: Integrations with third-party systems via custom MCP servers
  or predefined connectors such as Google Drive and SharePoint. Learn more about
  [MCP Tools](https://platform.openai.com/docs/guides/tools-connectors-mcp).
- **Function calls (custom tools)**: Functions that are defined by you,
  enabling the model to call your own code with strongly typed arguments
  and outputs. Learn more about
  [function calling](https://platform.openai.com/docs/guides/function-calling). You can also use
  custom tools to call your own code.
- `top_logprobs` (integer; nullable) — An integer between 0 and 20 specifying the number of most likely tokens to
return at each token position, each with an associated log probability.
- `top_p` (number; required; nullable; default `1`) — An alternative to sampling with temperature, called nucleus sampling,
where the model considers the results of the tokens with top_p probability
mass. So 0.1 means only the tokens comprising the top 10% probability mass
are considered.

We generally recommend altering this or `temperature` but not both.
- `truncation` (string; nullable; default `disabled`) — The truncation strategy to use for the model response.
- `auto`: If the input to this Response exceeds
  the model's context window size, the model will truncate the
  response to fit the context window by dropping items from the beginning of the conversation.
- `disabled` (default): If the input size will exceed the context window
  size for a model, the request will fail with a 400 error. Allowed values: `auto`, `disabled`
- `usage` (object [ResponseUsage]) — Represents token usage details including input tokens, output tokens,
a breakdown of output tokens, and the total tokens used.
- `user` (string) — This field is being replaced by `safety_identifier` and `prompt_cache_key`. Use `prompt_cache_key` instead to maintain caching optimizations.
A stable identifier for your end-users.
Used to boost cache hit rates by better bucketing similar requests and  to help OpenAI detect and prevent abuse. [Learn more](https://platform.openai.com/docs/guides/safety-best-practices#safety-identifiers). **Deprecated.**

### DELETE /responses/{response_id} — Delete a model response

Deletes a model response with the given ID.


#### Path Parameters
- `response_id` (string; required) — The ID of the response to delete.

#### HTTP 200 — OK
- No response body.

#### HTTP 404 — Not Found
**application/json**
- `code` (string; required; nullable)
- `message` (string; required)
- `param` (string; required; nullable)
- `type` (string; required)

### POST /responses/{response_id}/cancel — Cancel a response

Cancels a model response with the given ID. Only responses created with
the `background` parameter set to `true` can be cancelled.
[Learn more](https://platform.openai.com/docs/guides/background).


#### Path Parameters
- `response_id` (string; required) — The ID of the response to cancel.

#### HTTP 200 — OK
**application/json**
- `background` (boolean; nullable; default `False`) — Whether to run the model response in the background.
[Learn more](https://platform.openai.com/docs/guides/background).
- `conversation` (object [Conversation-2]; nullable) — The conversation that this response belongs to. Input items and output items from this response are automatically added to this conversation.
- `created_at` (number; required) — Unix timestamp (in seconds) of when this Response was created.
- `error` (object [ResponseError]; required; nullable) — An error object returned when the model fails to generate a Response.
- `id` (string; required) — Unique identifier for this Response.
- `incomplete_details` (object; required; nullable) — Details about why the response is incomplete.
- `instructions` (array<object [InputItem]> | string [InputItem]; required; nullable) — A system (or developer) message inserted into the model's context.

When using along with `previous_response_id`, the instructions from a previous
response will not be carried over to the next response. This makes it simple
to swap out system (or developer) messages in new responses.
- `max_output_tokens` (integer; nullable) — An upper bound for the number of tokens that can be generated for a response, including visible output tokens and [reasoning tokens](https://platform.openai.com/docs/guides/reasoning).
- `max_tool_calls` (integer; nullable) — The maximum number of total calls to built-in tools that can be processed in a response. This maximum number applies across all built-in tool calls, not per individual tool. Any further attempts to call a tool by the model will be ignored.
- `metadata` (object<string, string> [Metadata]; required; nullable) — Set of 16 key-value pairs that can be attached to an object. This can be
useful for storing additional information about the object in a structured
format, and querying for objects via API or the dashboard.

Keys are strings with a maximum length of 64 characters. Values are strings
with a maximum length of 512 characters.
- `model` (string [ModelIdsResponses]; required) — Model ID used to generate the response, like `gpt-4o` or `o3`. OpenAI
offers a wide range of models with different capabilities, performance
characteristics, and price points. Refer to the [model guide](https://platform.openai.com/docs/models)
to browse and compare available models. Allowed values (10 of 75 shown): `chatgpt-4o-latest`, `codex-mini-latest`, `computer-use-preview`, `computer-use-preview-2025-03-11`, `gpt-3.5-turbo`, `gpt-3.5-turbo-0125`, `gpt-3.5-turbo-0301`, `gpt-3.5-turbo-0613`, `gpt-3.5-turbo-1106`, `gpt-3.5-turbo-16k`, …
- `object` (string; required) — The object type of this resource - always set to `response`. Allowed values: `response`
- `output` (array<object [OutputItem]> [OutputItem]; required) — An array of content items generated by the model.

- The length and order of items in the `output` array is dependent
  on the model's response.
- Rather than accessing the first item in the `output` array and
  assuming it's an `assistant` message with the content generated by
  the model, you might consider using the `output_text` property where
  supported in SDKs.
- `output_text` (string; nullable) — SDK-only convenience property that contains the aggregated text output
from all `output_text` items in the `output` array, if any are present.
Supported in the Python and JavaScript SDKs.
- `parallel_tool_calls` (boolean; required; default `True`) — Whether to allow the model to run tool calls in parallel.
- `previous_response_id` (string; nullable) — The unique ID of the previous response to the model. Use this to
create multi-turn conversations. Learn more about
[conversation state](https://platform.openai.com/docs/guides/conversation-state). Cannot be used in conjunction with `conversation`.
- `prompt` (object [Prompt]; nullable) — Reference to a prompt template and its variables.
[Learn more](https://platform.openai.com/docs/guides/text?api-mode=responses#reusable-prompts).
- `prompt_cache_key` (string) — Used by OpenAI to cache responses for similar requests to optimize your cache hit rates. Replaces the `user` field. [Learn more](https://platform.openai.com/docs/guides/prompt-caching).
- `reasoning` (object [Reasoning]; nullable) — **gpt-5 and o-series models only**

Configuration options for
[reasoning models](https://platform.openai.com/docs/guides/reasoning).
- `safety_identifier` (string) — A stable identifier used to help detect users of your application that may be violating OpenAI's usage policies.
The IDs should be a string that uniquely identifies each user. We recommend hashing their username or email address, in order to avoid sending us any identifying information. [Learn more](https://platform.openai.com/docs/guides/safety-best-practices#safety-identifiers).
- `service_tier` (string [ServiceTier]; nullable; default `auto`) — Specifies the processing type used for serving the request.
  - If set to 'auto', then the request will be processed with the service tier configured in the Project settings. Unless otherwise configured, the Project will use 'default'.
  - If set to 'default', then the request will be processed with the standard pricing and performance for the selected model.
  - If set to '[flex](https://platform.openai.com/docs/guides/flex-processing)' or '[priority](https://openai.com/api-priority-processing/)', then the request will be processed with the corresponding service tier.
  - When not set, the default behavior is 'auto'.

  When the `service_tier` parameter is set, the response body will include the `service_tier` value based on the processing mode actually used to serve the request. This response value may be different from the value set in the parameter. Allowed values: `auto`, `default`, `flex`, `priority`, `scale`
- `status` (string) — The status of the response generation. One of `completed`, `failed`,
`in_progress`, `cancelled`, `queued`, or `incomplete`. Allowed values: `cancelled`, `completed`, `failed`, `in_progress`, `incomplete`, `queued`
- `temperature` (number; required; nullable; default `1`) — What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
We generally recommend altering this or `top_p` but not both.
- `text` (object) — Configuration options for a text response from the model. Can be plain
text or structured JSON data. Learn more:
- [Text inputs and outputs](https://platform.openai.com/docs/guides/text)
- [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- `tool_choice` (object | string [ToolChoiceAllowed, ToolChoiceCustom, ToolChoiceFunction, ToolChoiceMCP, ToolChoiceOptions, ToolChoiceTypes]; required) — How the model should select which tool (or tools) to use when generating
a response. See the `tools` parameter to see how to specify which tools
the model can call. Allowed values: `auto`, `none`, `required`
- `tools` (array<object [Tool]> [Tool]; required) — An array of tools the model may call while generating a response. You
can specify which tool to use by setting the `tool_choice` parameter.

We support the following categories of tools:
- **Built-in tools**: Tools that are provided by OpenAI that extend the
  model's capabilities, like [web search](https://platform.openai.com/docs/guides/tools-web-search)
  or [file search](https://platform.openai.com/docs/guides/tools-file-search). Learn more about
  [built-in tools](https://platform.openai.com/docs/guides/tools).
- **MCP Tools**: Integrations with third-party systems via custom MCP servers
  or predefined connectors such as Google Drive and SharePoint. Learn more about
  [MCP Tools](https://platform.openai.com/docs/guides/tools-connectors-mcp).
- **Function calls (custom tools)**: Functions that are defined by you,
  enabling the model to call your own code with strongly typed arguments
  and outputs. Learn more about
  [function calling](https://platform.openai.com/docs/guides/function-calling). You can also use
  custom tools to call your own code.
- `top_logprobs` (integer; nullable) — An integer between 0 and 20 specifying the number of most likely tokens to
return at each token position, each with an associated log probability.
- `top_p` (number; required; nullable; default `1`) — An alternative to sampling with temperature, called nucleus sampling,
where the model considers the results of the tokens with top_p probability
mass. So 0.1 means only the tokens comprising the top 10% probability mass
are considered.

We generally recommend altering this or `temperature` but not both.
- `truncation` (string; nullable; default `disabled`) — The truncation strategy to use for the model response.
- `auto`: If the input to this Response exceeds
  the model's context window size, the model will truncate the
  response to fit the context window by dropping items from the beginning of the conversation.
- `disabled` (default): If the input size will exceed the context window
  size for a model, the request will fail with a 400 error. Allowed values: `auto`, `disabled`
- `usage` (object [ResponseUsage]) — Represents token usage details including input tokens, output tokens,
a breakdown of output tokens, and the total tokens used.
- `user` (string) — This field is being replaced by `safety_identifier` and `prompt_cache_key`. Use `prompt_cache_key` instead to maintain caching optimizations.
A stable identifier for your end-users.
Used to boost cache hit rates by better bucketing similar requests and  to help OpenAI detect and prevent abuse. [Learn more](https://platform.openai.com/docs/guides/safety-best-practices#safety-identifiers). **Deprecated.**

#### HTTP 404 — Not Found
**application/json**
- `code` (string; required; nullable)
- `message` (string; required)
- `param` (string; required; nullable)
- `type` (string; required)

### GET /responses/{response_id}/input_items — List input items

Returns a list of input items for a given response.

#### Path Parameters
- `response_id` (string; required) — The ID of the response to retrieve input items for.

#### Query Parameters
- `limit` (integer; default `20`) — A limit on the number of objects to be returned. Limit can range between
1 and 100, and the default is 20.
- `order` (string) — The order to return the input items in. Default is `desc`.
- `asc`: Return the input items in ascending order.
- `desc`: Return the input items in descending order. Allowed values: `asc`, `desc`
- `after` (string) — An item ID to list items after, used in pagination.
- `include` (array<string [Includable]> [Includable]) — Additional fields to include in the response. See the `include`
parameter for Response creation above for more information. Allowed values: `code_interpreter_call.outputs`, `computer_call_output.output.image_url`, `file_search_call.results`, `message.input_image.image_url`, `message.output_text.logprobs`, `reasoning.encrypted_content`

#### HTTP 200 — OK
**application/json**
A list of Response items.

- `data` (array<object [ItemResource]> [ItemResource]; required) — A list of items used to generate this response.
- `first_id` (string; required) — The ID of the first item in the list.
- `has_more` (boolean; required) — Whether there are more items available.
- `last_id` (string; required) — The ID of the last item in the list.
- `object` (unspecified; required) — The type of object returned, must be `list`. Allowed values: `list`
