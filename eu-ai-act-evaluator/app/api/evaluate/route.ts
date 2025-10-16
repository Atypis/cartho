/**
 * Evaluation API Route
 *
 * Handles evaluation requests, calls GPT-5, and streams results back
 */

import { OpenAI } from 'openai';
import { EvaluationEngine } from '@/lib/evaluation/engine';
import type { PrescriptiveNorm, SharedPrimitive, EvaluationResult } from '@/lib/evaluation/types';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      console.log(`🤖 [GPT-5-mini] Request #${requestCount} - Sending to OpenAI...`);

      const response = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a legal expert evaluating compliance with the EU AI Act. Analyze the case facts carefully and provide precise, well-reasoned decisions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        reasoning_effort: 'high', // Use high reasoning for complex legal analysis
        // Note: GPT-5 models only support temperature=1.0 (default)
      });

      const content = response.choices[0].message.content || '';

      console.log(`✅ [GPT-5-mini] Response #${requestCount} received (${content.length} chars)`);

      // Parse the response (expecting structured format)
      const parsed = parseEvaluationResponse(content);
      console.log(`   Decision: ${parsed.decision ? 'YES ✓' : 'NO ✗'} (confidence: ${(parsed.confidence * 100).toFixed(0)}%)`);

      return parsed;
    };

        // Run evaluation
        console.log(`⚙️  [ENGINE] Starting tree traversal...`);
        const result = await engine.evaluate(caseInput, evaluateWithGPT5);

        console.log(`🎯 [API] Evaluation complete!`);
        console.log(`   Total GPT-5-mini requests: ${requestCount}`);
        console.log(`   Final verdict: ${result.compliant ? 'COMPLIANT ✓' : 'NON-COMPLIANT ✗'}`);
        console.log(`   Evaluated nodes: ${result.states.length}`);

        // Send final result
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`)
        );
        await writer.close();
      } catch (error) {
        console.error('❌ [API] Evaluation error:', error);
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
