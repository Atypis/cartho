import type { EvaluationResult } from './types';

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
