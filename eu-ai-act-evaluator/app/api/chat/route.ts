/**
 * AI Chat API Route
 *
 * Handles chat interactions with AI SDK v5 and tool calling
 * Powered by Claude 3.5 Haiku (Anthropic)
 */

import { anthropic, AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    messages: convertToModelMessages(messages),
    // Enable extended thinking for complex legal reasoning
    providerOptions: {
      anthropic: {
        thinking: { type: 'enabled', budgetTokens: 10000 },
      } satisfies AnthropicProviderOptions,
    },
    headers: {
      'anthropic-beta': 'interleaved-thinking-2025-05-14',
    },
    // Enable multi-step tool calling (up to 15 steps)
    stopWhen: stepCountIs(15),
    system: `You are a process assistant for EU AI Act compliance evaluation. Your role is strictly limited to:

1. **Gathering information**: Ask clarifying questions to fully understand AI system use-cases
2. **Tool management**: Use your tools to create use-cases, trigger evaluations, and retrieve results
3. **Process facilitation**: Guide users through the evaluation workflow

IMPORTANT LIMITATIONS:
- Do NOT provide legal advice or interpret EU AI Act obligations yourself
- Do NOT answer questions about compliance requirements directly
- For all legal evaluations, you MUST use the evaluation tools
- Your only job is to gather complete information and manage the evaluation process

When a user describes an AI system:
- Ask clarifying questions if the description is incomplete or ambiguous
- Once you have sufficient information, create a use-case using the create_use_case tool
- Offer to trigger an evaluation against relevant prescriptive norms

Available tools:
- create_use_case: Document a new AI system
- list_use_cases: Show existing documented systems
- trigger_evaluation: Start compliance evaluation against prescriptive norms
- get_evaluation_results: Retrieve completed evaluation results

Be conversational, concise, and focused on process management, not legal interpretation.`,
    tools: {
      create_use_case: tool({
        description: 'Create a new AI system use-case for compliance evaluation',
        inputSchema: z.object({
          title: z.string().describe('Short descriptive title for the use-case (e.g., "Healthcare Chatbot")'),
          description: z.string().describe('Detailed description of the AI system, including: what it does, who uses it, where it operates, and any other relevant context'),
          tags: z.array(z.string()).optional().describe('Optional tags for categorization (e.g., ["healthcare", "chatbot"])'),
        }),
        execute: async ({ title, description, tags }) => {
          const { data, error } = await supabase
            .from('use_cases')
            .insert({
              title,
              description,
              created_in_session_id: sessionId,
              tags: tags || [],
            })
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to create use-case: ${error.message}`);
          }

          return {
            success: true,
            use_case: data,
            message: `Created use-case "${title}" with ID ${data.id}`,
          };
        },
      }),

      list_use_cases: tool({
        description: 'List all existing use-cases',
        inputSchema: z.object({}),
        execute: async () => {
          const { data, error } = await supabase
            .from('use_cases')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            throw new Error(`Failed to list use-cases: ${error.message}`);
          }

          return {
            success: true,
            use_cases: data,
            count: data.length,
          };
        },
      }),

      trigger_evaluation: tool({
        description: 'Trigger a compliance evaluation of a use-case against one or more prescriptive norms',
        inputSchema: z.object({
          use_case_id: z.string().describe('UUID of the use-case to evaluate'),
          pn_ids: z.array(z.string()).describe('Array of prescriptive norm IDs to evaluate against (e.g., ["PN-04"])'),
        }),
        execute: async ({ use_case_id, pn_ids }) => {
          // Create evaluation record
          const { data: evaluation, error: evalError } = await supabase
            .from('evaluations')
            .insert({
              use_case_id,
              pn_ids,
              status: 'pending',
              triggered_in_session_id: sessionId,
            })
            .select()
            .single();

          if (evalError) {
            throw new Error(`Failed to create evaluation: ${evalError.message}`);
          }

          // TODO: Trigger actual evaluation process (queue job, etc.)
          // For now, we'll mark it as pending and return the ID

          return {
            success: true,
            evaluation_id: evaluation.id,
            message: `Evaluation ${evaluation.id} created and pending execution for ${pn_ids.length} prescriptive norm(s)`,
          };
        },
      }),

      get_evaluation_results: tool({
        description: 'Retrieve results of a completed evaluation',
        inputSchema: z.object({
          evaluation_id: z.string().describe('UUID of the evaluation'),
        }),
        execute: async ({ evaluation_id }) => {
          // Get evaluation metadata
          const { data: evaluation, error: evalError } = await supabase
            .from('evaluations')
            .select('*')
            .eq('id', evaluation_id)
            .single();

          if (evalError) {
            throw new Error(`Failed to get evaluation: ${evalError.message}`);
          }

          // Get results
          const { data: results, error: resultsError } = await supabase
            .from('evaluation_results')
            .select('*')
            .eq('evaluation_id', evaluation_id);

          if (resultsError) {
            throw new Error(`Failed to get results: ${resultsError.message}`);
          }

          return {
            success: true,
            evaluation,
            results,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}

