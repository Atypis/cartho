import type { EvaluationResult } from './types';
import { supabase } from '@/lib/supabase/client';

export interface SharedEvaluationCache {
  getOrEvaluate(
    key: string,
    evaluator: () => Promise<EvaluationResult>
  ): Promise<EvaluationResult>;
}

export class InMemorySharedEvaluationCache implements SharedEvaluationCache {
  private readonly cache = new Map<string, Promise<EvaluationResult>>();

  async getOrEvaluate(
    key: string,
    evaluator: () => Promise<EvaluationResult>
  ): Promise<EvaluationResult> {
    if (!this.cache.has(key)) {
      const promise = (async () => {
        const result = await evaluator();
        return this.cloneResult(result);
      })();
      this.cache.set(key, promise);
    }

    const cached = await this.cache.get(key)!;
    return this.cloneResult(cached);
  }

  private cloneResult(result: EvaluationResult): EvaluationResult {
    const clone: EvaluationResult = {
      nodeId: result.nodeId,
      decision: result.decision,
      confidence: result.confidence,
      reasoning: result.reasoning,
    };

    if (result.citations !== undefined) {
      clone.citations = Array.isArray(result.citations)
        ? [...result.citations]
        : result.citations;
    }

    return clone;
  }
}

/**
 * Persistent, per-use-case cache for shared requirement assessments.
 * - Scopes cache entries by `use_case_id` to prevent cross-use-case leakage
 * - Persists to Supabase so results survive process restarts
 * - Uses a per-request in-memory layer to avoid repeated DB hits
 */
export class PerUseCasePersistentSharedCache implements SharedEvaluationCache {
  private readonly useCaseId: string;
  private readonly sourceEvaluationId?: string | null;
  private readonly pnId?: string | null;
  private readonly local = new Map<string, Promise<EvaluationResult>>();

  constructor(opts: { useCaseId: string; sourceEvaluationId?: string | null; pnId?: string | null }) {
    this.useCaseId = opts.useCaseId;
    this.sourceEvaluationId = opts.sourceEvaluationId;
    this.pnId = opts.pnId;
  }

  async getOrEvaluate(key: string, evaluator: () => Promise<EvaluationResult>): Promise<EvaluationResult> {
    // Per-request memory layer
    if (!this.local.has(key)) {
      const promise = (async () => {
        // 1) Check Supabase persistent cache
        const { data: rawExisting, error: readError } = await supabase
          .from('shared_requirement_assessments' as any)
          .select('decision, confidence, reasoning, citations')
          .eq('use_case_id', this.useCaseId)
          .eq('shared_key', key)
          .single();

        const existing: any = rawExisting as any;
        if (existing && !readError) {
          return this.cloneResult({
            nodeId: '',
            decision: existing.decision as any,
            confidence: (existing.confidence as any) ?? 0.5,
            reasoning: (existing.reasoning as any) ?? '',
            citations: (existing.citations as any) ?? [],
          });
        }

        // 2) Evaluate and persist (write-once via upsert on uniq composite key)
        const evaluated = await evaluator();
        const payload: any = {
          use_case_id: this.useCaseId,
          shared_key: key,
          decision: evaluated.decision,
          confidence: evaluated.confidence,
          reasoning: evaluated.reasoning,
          citations: evaluated.citations ?? [],
          source_evaluation_id: this.sourceEvaluationId ?? null,
          pn_id: this.pnId ?? null,
        };

        // Best-effort upsert; if the table doesn't exist or constraint errors occur, ignore and continue.
        try {
          await supabase
            .from('shared_requirement_assessments' as any)
            .upsert(payload, { onConflict: 'use_case_id,shared_key' } as any);
        } catch (e) {
          // Swallow errors to avoid breaking the evaluation flow.
          console.error('⚠️  [SharedCache] Persist failed, continuing with evaluated result:', e);
        }

        return this.cloneResult(evaluated);
      })();

      this.local.set(key, promise);
    }

    const cached = await this.local.get(key)!;
    return this.cloneResult(cached);
  }

  private cloneResult(result: EvaluationResult): EvaluationResult {
    const clone: EvaluationResult = {
      nodeId: result.nodeId,
      decision: result.decision,
      confidence: result.confidence,
      reasoning: result.reasoning,
    };

    if (result.citations !== undefined) {
      clone.citations = Array.isArray(result.citations) ? [...result.citations] : result.citations;
    }

    return clone;
  }
}
