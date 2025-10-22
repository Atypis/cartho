/**
 * Evaluation API Route
 *
 * Handles evaluation requests, calls GPT-5, and streams results back
 */

import { OpenAI } from 'openai';
import crypto from 'crypto';
import { EvaluationEngine } from '@/lib/evaluation/engine';
import type { PrescriptiveNorm, SharedPrimitive, EvaluationResult } from '@/lib/evaluation/types';
import { InMemorySharedEvaluationCache } from '@/lib/evaluation/shared-cache';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory cache for node evaluations within the process
const evalCache = new Map<string, EvaluationResult>();

type SharedEvaluationContext = {
  cache: InMemorySharedEvaluationCache;
  refCount: number;
  cleanupTimer?: NodeJS.Timeout;
};

const SHARED_CONTEXT_TTL_MS = 5 * 60 * 1000;
const sharedEvaluationContexts = new Map<string, SharedEvaluationContext>();

function acquireSharedCache(evaluationId?: string | null) {
  if (!evaluationId) {
    return {
      cache: new InMemorySharedEvaluationCache(),
      release: () => {},
    };
  }

  let context = sharedEvaluationContexts.get(evaluationId);
  if (!context) {
    context = {
      cache: new InMemorySharedEvaluationCache(),
      refCount: 0,
    };
    sharedEvaluationContexts.set(evaluationId, context);
  }

  context.refCount += 1;
  if (context.cleanupTimer) {
    clearTimeout(context.cleanupTimer);
    context.cleanupTimer = undefined;
  }

  const release = () => {
    const stored = sharedEvaluationContexts.get(evaluationId);
    if (!stored) return;

    stored.refCount -= 1;
    if (stored.refCount <= 0 && !stored.cleanupTimer) {
      stored.cleanupTimer = setTimeout(() => {
        const latest = sharedEvaluationContexts.get(evaluationId);
        if (latest && latest.refCount <= 0) {
          sharedEvaluationContexts.delete(evaluationId);
        }
      }, SHARED_CONTEXT_TTL_MS);
    }
  };

  return { cache: context.cache, release };
}

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

    // Create a stream for progress updates
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Track which nodes we've already written (prevents duplicates)
    const writtenNodes = new Set<string>();

    // Track if writer is closed (prevent writing after completion)
    let writerClosed = false;

    const { cache: sharedCache, release: releaseSharedCache } = acquireSharedCache(evaluationId);

    // Build set of primitive node IDs (to filter composites from DB writes)
    const primitiveNodeIds = new Set<string>();
    const tempEngine = new EvaluationEngine(
      prescriptiveNorm as PrescriptiveNorm,
      sharedPrimitives as SharedPrimitive[] || [],
      undefined,
      sharedCache
    );
    // Access expanded nodes to identify primitives
    for (const node of (tempEngine as any).expandedNodes || []) {
      if (node.kind === 'primitive') {
        primitiveNodeIds.add(node.id);
      }
    }
    console.log(`🔍 [API] Identified ${primitiveNodeIds.size} primitive nodes to track`);

    // Start evaluation in background
    (async () => {
      try {
        // Create evaluation engine with progress callback
        const engine = new EvaluationEngine(
          prescriptiveNorm as PrescriptiveNorm,
          sharedPrimitives as SharedPrimitive[] || [],
          async (states) => {
            // Write completed primitive results to database (WRITE-ONCE with cache)
            if (evaluationId) {
              const completedStates = states.filter(s => s.status === 'completed' && s.result);

              for (const state of completedStates) {
                // ONLY write primitive nodes (filter out composites)
                const isPrimitive = primitiveNodeIds.has(state.nodeId);

                // Check in-memory cache first (fast, no race conditions)
                if (isPrimitive && !writtenNodes.has(state.nodeId) && state.result) {
                  // Write new result
                  const { error } = await supabase
                    .from('evaluation_results')
                    .insert({
                      evaluation_id: evaluationId,
                      node_id: state.nodeId,
                      decision: state.result.decision,
                      confidence: state.result.confidence,
                      reasoning: state.result.reasoning,
                      citations: state.result.citations || [],
                    });

                  if (!error) {
                    writtenNodes.add(state.nodeId);
                    console.log(`💾 [DB] Wrote result for ${state.nodeId}: ${state.result.decision ? 'YES' : 'NO'}`);
                  } else if (error.code === '23505') {
                    // Unique constraint violation (already exists) - add to cache
                    writtenNodes.add(state.nodeId);
                    console.log(`⚠️  [DB] Skipped duplicate for ${state.nodeId}`);
                  } else {
                    console.error(`❌ [DB] Error writing ${state.nodeId}:`, error);
                  }
                } else if (!isPrimitive) {
                  // Composite node - skip writing to database
                  console.log(`⏭️  [DB] Skipped composite node ${state.nodeId}`);
                }
              }
            }

            // Stream progress update (only if writer not closed)
            if (!writerClosed) {
              try {
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ type: 'progress', states })}\n\n`)
                );
              } catch (error) {
                console.error('⚠️  [API] Failed to write progress (stream likely closed):', error);
                writerClosed = true; // Mark as closed to prevent further attempts
              }
            }
          },
          sharedCache
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
        writerClosed = true; // Mark as closed BEFORE closing
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

        writerClosed = true; // Mark as closed BEFORE closing
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
            })}\n\n`
          )
        );
        await writer.close();
      } finally {
        releaseSharedCache();
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
