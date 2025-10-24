/**
 * Evaluation API Route
 *
 * Handles evaluation requests, calls GPT-5, and streams results back
 */

import { OpenAI } from 'openai';
import crypto from 'crypto';
import { EvaluationEngine } from '@/lib/evaluation/engine';
import type { PrescriptiveNorm, SharedPrimitive, EvaluationResult } from '@/lib/evaluation/types';
import { InMemorySharedEvaluationCache, PerUseCasePersistentSharedCache } from '@/lib/evaluation/shared-cache';
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

// Legacy per-evaluation in-memory shared cache helper removed.

function sha256(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

/**
 * Create or update obligation instance for a completed evaluation
 */
async function handleObligationInstanceUpdate(
  evaluationId: string,
  pnId: string,
  pnTitle: string | null,
  pnArticle: string | null,
  rootDecision: boolean
) {
  try {
    // Get evaluation details to find use_case_id
    const { data: evaluation } = await supabase
      .from('evaluations')
      .select('use_case_id')
      .eq('id', evaluationId)
      .single();

    if (!evaluation) {
      console.error(`❌ [Obligation] Evaluation ${evaluationId} not found`);
      return;
    }

    const useCaseId = evaluation.use_case_id;
    const applicabilityState = rootDecision ? 'applies' : 'not_applicable';
    const now = new Date().toISOString();

    // Check if obligation instance already exists
    const { data: existing } = await supabase
      .from('obligation_instances')
      .select('*')
      .eq('use_case_id', useCaseId)
      .eq('pn_id', pnId)
      .single();

    if (existing) {
      // Update existing obligation
      console.log(`🔄 [Obligation] Updating obligation ${existing.id} for PN ${pnId}`);

      await supabase
        .from('obligation_instances')
        .update({
          applicability_state: applicabilityState,
          latest_evaluation_id: evaluationId,
          root_decision: rootDecision,
          evaluated_at: now,
          pn_title: pnTitle || existing.pn_title,
          pn_article: pnArticle || existing.pn_article,
        })
        .eq('id', existing.id);

      // Log state change if applicability changed
      if (existing.applicability_state !== applicabilityState) {
        await supabase.from('obligation_status_history').insert({
          obligation_instance_id: existing.id,
          from_state: existing.applicability_state,
          to_state: applicabilityState,
          kind: 'applicability',
          changed_at: now,
        });
        console.log(`📝 [Obligation] Logged state change: ${existing.applicability_state} → ${applicabilityState}`);
      }
    } else {
      // Create new obligation instance
      console.log(`➕ [Obligation] Creating new obligation for PN ${pnId} × use case ${useCaseId}`);

      const { data: newObligation, error: insertError } = await supabase
        .from('obligation_instances')
        .insert({
          use_case_id: useCaseId,
          pn_id: pnId,
          pn_title: pnTitle,
          pn_article: pnArticle,
          applicability_state: applicabilityState,
          latest_evaluation_id: evaluationId,
          root_decision: rootDecision,
          evaluated_at: now,
          // Set implementation_state to not_started if it applies
          implementation_state: rootDecision ? 'not_started' : null,
        })
        .select()
        .single();

      if (insertError) {
        console.error(`❌ [Obligation] Error creating obligation:`, insertError);
        return;
      }

      // Log initial state
      if (newObligation) {
        await supabase.from('obligation_status_history').insert({
          obligation_instance_id: newObligation.id,
          from_state: null,
          to_state: applicabilityState,
          kind: 'applicability',
          changed_at: now,
        });
        console.log(`✅ [Obligation] Created obligation ${newObligation.id}`);
      }
    }
  } catch (error) {
    console.error(`❌ [Obligation] Error handling obligation instance:`, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📥 [API] Received evaluation request');

    const { prescriptiveNorm, sharedPrimitives, caseInput, evaluationId, baseEvaluationId, skipResolved } = await req.json();

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

    // Best-effort kickoff heartbeat
    if (evaluationId) {
      try {
        await supabase
          .from('evaluations')
          .update({ heartbeat_at: new Date().toISOString() as any })
          .eq('id', evaluationId);
      } catch {}
    }

    // Create a stream for progress updates
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Track which nodes we've already written (prevents duplicates)
    const writtenNodes = new Set<string>();

    // Track if writer is closed (prevent writing after completion)
    let writerClosed = false;

    // Determine use_case_id for persistent, per-use-case shared requirement cache
    let useCaseId: string | null = null;
    if (evaluationId) {
      const { data: evalMeta } = await supabase
        .from('evaluations')
        .select('use_case_id')
        .eq('id', evaluationId)
        .single();
      useCaseId = evalMeta?.use_case_id ?? null;
    }

    const sharedCache = useCaseId
      ? new PerUseCasePersistentSharedCache({
          useCaseId,
          sourceEvaluationId: evaluationId,
          pnId: (prescriptiveNorm as PrescriptiveNorm).id,
        })
      : new InMemorySharedEvaluationCache();

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

    // Seed pre-resolved primitives from a base evaluation (resume)
    let preResolved: Map<string, { decision: boolean; confidence?: number; reasoning?: string; citations?: any }> | undefined = undefined;
    if (skipResolved && (baseEvaluationId || evaluationId)) {
      const baseId = baseEvaluationId || evaluationId;
      try {
        const { data: existingResults } = await supabase
          .from('evaluation_results')
          .select('node_id, decision, confidence, reasoning, citations')
          .eq('evaluation_id', baseId as string);
        if (existingResults && existingResults.length > 0) {
          preResolved = new Map();
          for (const r of existingResults as any[]) {
            if (primitiveNodeIds.has(r.node_id)) {
              preResolved.set(r.node_id, {
                decision: !!r.decision,
                confidence: typeof r.confidence === 'number' ? r.confidence : undefined,
                reasoning: (r.reasoning as string) || undefined,
                citations: r.citations,
              });
            }
          }
          console.log(`⏭️  [API] Pre-resolved ${preResolved.size} primitive nodes from base evaluation ${baseId}`);
        }
      } catch (e) {
        console.warn('⚠️  [API] Failed to seed preResolved from base evaluation:', e);
      }
    }

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
                      prompt: state.result.prompt || null,
                      llm_raw_response: state.result.llm_raw_response || null,
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

            // Update heartbeat + progress for the evaluation row (best effort)
            if (evaluationId) {
              try {
                const completedPrimitiveCount = states.reduce((acc, s) => acc + (primitiveNodeIds.has(s.nodeId) && (s.status === 'completed' || s.status === 'skipped') ? 1 : 0), 0);
                await supabase
                  .from('evaluations')
                  .update({
                    heartbeat_at: new Date().toISOString() as any,
                    progress_current: completedPrimitiveCount,
                    progress_total: primitiveNodeIds.size,
                  } as any)
                  .eq('id', evaluationId as string);
              } catch (hbErr) {
                // ignore if columns don’t exist
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
          sharedCache,
          preResolved
        );

    console.log(`🔧 [API] Engine created, starting evaluation...`);

    let requestCount = 0;

    // Define evaluation function that calls GPT-5-mini
    const evaluateWithGPT5 = async (prompt: string): Promise<EvaluationResult> => {
      requestCount++;
      // Salt the prompt hash with useCaseId to avoid cross-use-case collisions
      const salt = useCaseId || evaluationId || 'global';
      const key = sha256(`${salt}::${prompt}`);
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
              'You answer one legal Question per call. Output only JSON: {"decision":boolean,"confidence":number,"reasoning":string}. Semantics: decision=true means YES to the Question; decision=false means NO. Do not decide overall compliance or apply exceptions—just answer the Question from the provided facts and context. confidence in [0,1].',
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
      let rawResponseObj: any;
      try {
        rawResponseObj = JSON.parse(content);
        parsed = {
          nodeId: '',
          decision: !!rawResponseObj.decision,
          confidence: Math.max(0, Math.min(1, Number(rawResponseObj.confidence) || 0.5)),
          reasoning: String(rawResponseObj.reasoning || ''),
          prompt: prompt, // Store full prompt for transparency
          llm_raw_response: rawResponseObj, // Store raw response for transparency
        };
      } catch {
        // Fallback to legacy parser
        parsed = parseEvaluationResponse(content);
        parsed.prompt = prompt; // Add transparency fields to fallback too
        parsed.llm_raw_response = { raw: content }; // Store raw string if JSON parse failed
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

          // Create/update obligation instance for this PN × Use Case
          await handleObligationInstanceUpdate(
            evaluationId,
            prescriptiveNorm.id,
            prescriptiveNorm.title || null,
            prescriptiveNorm.article_refs?.[0]?.article?.toString() || null,
            result.compliant
          );
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
        // nothing to release for persistent cache
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
