/**
 * Evaluation API Route
 *
 * Handles evaluation requests, calls GPT-5, and streams results back
 */

import { OpenAI } from 'openai';
import crypto from 'crypto';
import { EvaluationEngine } from '@/lib/evaluation/engine';
import type { PrescriptiveNorm, SharedPrimitive, EvaluationResult } from '@/lib/evaluation/types';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory cache for node evaluations within the process
const evalCache = new Map<string, EvaluationResult>();

function sha256(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    console.log('📥 [API] Received evaluation request');

    const { prescriptiveNorm, sharedPrimitives, caseInput, evaluationId } = await req.json();

    if (!prescriptiveNorm || !caseInput) {
      console.log('❌ [API] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 [API] Evaluating PN: ${prescriptiveNorm.id}`);
    console.log(`📄 [API] Case input length: ${caseInput.length} chars`);
    console.log(`📝 [API] Evaluation ID: ${evaluationId || 'none'}`);

    // Create Supabase client for database writes
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create a stream for progress updates
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start evaluation in background
    (async () => {
      try {
        // Create evaluation engine with progress callback
        const engine = new EvaluationEngine(
          prescriptiveNorm as PrescriptiveNorm,
          sharedPrimitives as SharedPrimitive[] || [],
          async (states) => {
            // Write completed primitive results to database
            if (evaluationId) {
              const completedStates = states.filter(s => s.status === 'completed' && s.result);

              for (const state of completedStates) {
                // Check if already written
                const { data: existing } = await supabase
                  .from('evaluation_results')
                  .select('id')
                  .eq('evaluation_id', evaluationId)
                  .eq('node_id', state.nodeId)
                  .single();

                if (!existing && state.result) {
                  // Write new result
                  await supabase
                    .from('evaluation_results')
                    .insert({
                      evaluation_id: evaluationId,
                      node_id: state.nodeId,
                      decision: state.result.decision,
                      confidence: state.result.confidence,
                      reasoning: state.result.reasoning,
                      citations: state.result.citations || [],
                    });

                  console.log(`💾 [DB] Wrote result for ${state.nodeId}: ${state.result.decision ? 'YES' : 'NO'}`);
                }
              }
            }

            // Stream progress update
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ type: 'progress', states })}\n\n`)
            );
          }
        );

    console.log(`🔧 [API] Engine created, starting evaluation...`);

    let requestCount = 0;

    // Define evaluation function that calls GPT-5-mini
    const evaluateWithGPT5 = async (prompt: string): Promise<EvaluationResult> => {
      requestCount++;
      const key = sha256(prompt);
      const cached = evalCache.get(key);
      if (cached) {
        console.log(`⚡ [Cache] Hit for request #${requestCount}`);
        return cached;
      }

      console.log(`🤖 [GPT-5-mini] Request #${requestCount} - Sending to OpenAI...`);

      const response = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a legal expert evaluating compliance with the EU AI Act. Respond ONLY with a single JSON object: {"decision":boolean,"confidence":number,"reasoning":string}. Confidence in [0,1].',
          },
          {
            role: 'user',
            content: prompt + '\n\nReturn JSON only with keys: decision, confidence, reasoning.',
          },
        ],
        reasoning_effort: 'high',
        response_format: { type: 'json_object' } as any,
      });

      const content = response.choices[0].message.content || '';
      console.log(`✅ [GPT-5-mini] Response #${requestCount} received (${content.length} chars)`);

      // Prefer JSON parse
      let parsed: EvaluationResult;
      try {
        const obj = JSON.parse(content);
        parsed = {
          nodeId: '',
          decision: !!obj.decision,
          confidence: Math.max(0, Math.min(1, Number(obj.confidence) || 0.5)),
          reasoning: String(obj.reasoning || ''),
        };
      } catch {
        // Fallback to legacy parser
        parsed = parseEvaluationResponse(content);
      }

      console.log(
        `   Decision: ${parsed.decision ? 'YES ✓' : 'NO ✗'} (confidence: ${(parsed.confidence * 100).toFixed(0)}%)`
      );

      evalCache.set(key, parsed);
      return parsed;
    };

        // Run evaluation
        console.log(`⚙️  [ENGINE] Starting tree traversal...`);
        const result = await engine.evaluate(caseInput, evaluateWithGPT5);

        console.log(`🎯 [API] Evaluation complete!`);
        console.log(`   Total GPT-5-mini requests: ${requestCount}`);
        console.log(`   Final verdict: ${result.compliant ? 'COMPLIANT ✓' : 'NON-COMPLIANT ✗'}`);
        console.log(`   Evaluated nodes: ${result.states.length}`);

        // Update evaluation status to completed
        if (evaluationId) {
          const primitiveCount = result.states.filter(s => s.result).length;
          await supabase
            .from('evaluations')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              progress_current: primitiveCount,
              progress_total: primitiveCount,
            })
            .eq('id', evaluationId);

          console.log(`✅ [DB] Marked evaluation ${evaluationId} as completed`);
        }

        // Send final result
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`)
        );
        await writer.close();
      } catch (error) {
        console.error('❌ [API] Evaluation error:', error);

        // Mark evaluation as failed
        if (evaluationId) {
          await supabase
            .from('evaluations')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', evaluationId);

          console.log(`❌ [DB] Marked evaluation ${evaluationId} as failed`);
        }

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
            })}\n\n`
          )
        );
        await writer.close();
      }
    })();

    // Return streaming response
    return new Response(stream.readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('❌ [API] Setup error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Parse GPT-5 response into structured evaluation result
 */
function parseEvaluationResponse(content: string): EvaluationResult {
  // Extract decision (YES/NO)
  const decisionMatch = content.match(/Decision:\s*(YES|NO)/i);
  const decision = decisionMatch ? decisionMatch[1].toUpperCase() === 'YES' : false;

  // Extract confidence (0.0-1.0)
  const confidenceMatch = content.match(/Confidence:\s*([\d.]+)/i);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;

  // Extract reasoning
  const reasoningMatch = content.match(/Reasoning:\s*([\s\S]+?)(?=\n\n|$)/i);
  const reasoning = reasoningMatch ? reasoningMatch[1].trim() : content;

  return {
    nodeId: '', // Will be set by engine
    decision,
    confidence: Math.max(0, Math.min(1, confidence)),
    reasoning,
  };
}
