/**
 * Evaluation Engine
 *
 * Traverses the requirement tree and evaluates each node using GPT-5
 */

import type {
  PrescriptiveNorm,
  RequirementNode,
  EvaluationResult,
  EvaluationState,
  SharedPrimitive,
} from './types';
import { expandSharedRequirements } from './expand-shared';
import type { SharedEvaluationCache } from './shared-cache';

export class EvaluationEngine {
  private pn: PrescriptiveNorm;
  private expandedNodes: RequirementNode[];
  private nodeMap: Map<string, RequirementNode>;
  private evaluationStates: Map<string, EvaluationState>;
  private onStateUpdate?: (states: EvaluationState[]) => void;
  private sharedCache?: SharedEvaluationCache;

  constructor(
    pn: PrescriptiveNorm,
    sharedPrimitives: SharedPrimitive[] = [],
    onStateUpdate?: (states: EvaluationState[]) => void,
    sharedCache?: SharedEvaluationCache
  ) {
    this.pn = pn;
    this.expandedNodes = expandSharedRequirements(pn.requirements.nodes, sharedPrimitives);
    this.nodeMap = new Map();
    this.evaluationStates = new Map();
    this.onStateUpdate = onStateUpdate;
    this.sharedCache = sharedCache;

    // Build node map from PN
    this.buildNodeMap();
  }

  /**
   * Build a flat map of all nodes for easy lookup
   */
  private buildNodeMap() {
    for (const node of this.expandedNodes) {
      this.nodeMap.set(node.id, node);

      // Initialize evaluation state
      this.evaluationStates.set(node.id, {
        nodeId: node.id,
        status: 'pending',
      });
    }
  }

  /**
   * Update evaluation state and notify listeners
   */
  private updateState(nodeId: string, update: Partial<EvaluationState>) {
    const current = this.evaluationStates.get(nodeId);
    if (current) {
      const updated = { ...current, ...update };
      this.evaluationStates.set(nodeId, updated);

      if (this.onStateUpdate) {
        this.onStateUpdate(Array.from(this.evaluationStates.values()));
      }
    }
  }

  /**
   * Mark a node and its descendants as skipped (short-circuited branch)
   */
  private markSkipped(nodeId: string) {
    const existing = this.evaluationStates.get(nodeId);
    if (existing && existing.status !== 'pending' && existing.status !== 'evaluating') {
      return;
    }

    this.updateState(nodeId, { status: 'skipped' });

    const node = this.nodeMap.get(nodeId);
    if (node?.kind === 'composite') {
      for (const childId of node.children ?? []) {
        this.markSkipped(childId);
      }
    }
  }

  /**
   * Evaluate a single primitive node using LLM
   */
  private async evaluatePrimitive(
    node: RequirementNode,
    caseInput: string,
    evaluateFn: (prompt: string) => Promise<EvaluationResult>
  ): Promise<EvaluationResult> {
    if (!node.question) {
      throw new Error(`Primitive node ${node.id} has no question`);
    }

    console.log(`  🔍 [ENGINE] Evaluating primitive: ${node.id} - "${node.label}"`);

    // Mark as evaluating
    this.updateState(node.id, { status: 'evaluating' });

    // Build prompt from node data
    const prompt = this.buildPrompt(node, caseInput);

    const sharedKey = this.getSharedRequirementKey(node);

    try {
      // Call LLM evaluation function
      const rawResult = await (sharedKey && this.sharedCache
        ? this.sharedCache.getOrEvaluate(sharedKey, async () => {
            const sharedResult = await evaluateFn(prompt);
            return { ...sharedResult, nodeId: '' };
          })
        : evaluateFn(prompt));

      const result: EvaluationResult = {
        ...rawResult,
        nodeId: node.id,
      };

      if (rawResult.citations !== undefined) {
        result.citations = Array.isArray(rawResult.citations)
          ? [...rawResult.citations]
          : rawResult.citations;
      }

      // Update state with result
      this.updateState(node.id, {
        status: 'completed',
        result,
      });

      return result;
    } catch (error) {
      this.updateState(node.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private getSharedRequirementKey(node: RequirementNode): string | null {
    if (!node.sharedRequirement) {
      return null;
    }

    const { primitiveId, nodeId } = node.sharedRequirement;
    if (!primitiveId || !nodeId) {
      return null;
    }

    return `${primitiveId}::${nodeId}`;
  }

  /**
   * Build LLM prompt for a primitive node
   */
  private buildPrompt(node: RequirementNode, caseInput: string): string {
    let prompt = `# Legal Requirement Evaluation\n\n`;
    prompt += `## Question\n${node.question!.prompt}\n\n`;

    if (node.question!.help) {
      prompt += `## Guidance\n${node.question!.help}\n\n`;
    }

    // Add context items
    if (node.context && node.context.items.length > 0) {
      prompt += `## Legal Context\n`;
      for (const item of node.context.items) {
        prompt += `### ${item.label}\n`;
        prompt += `${item.text}\n\n`;
      }
    }

    // Add case facts
    prompt += `## Case Facts\n${caseInput}\n\n`;

    // Add instructions
    prompt += `## Task\n`;
    prompt += `Based on the case facts and legal context above, determine if the requirement is satisfied.\n\n`;
    prompt += `Respond with:\n`;
    prompt += `1. Decision: YES or NO\n`;
    prompt += `2. Confidence: A number between 0.0 and 1.0\n`;
    prompt += `3. Reasoning: 2-3 sentences citing specific facts from the case\n`;

    return prompt;
  }

  /**
   * Evaluate a composite node (allOf / anyOf / not)
   */
  private async evaluateComposite(
    node: RequirementNode,
    caseInput: string,
    evaluateFn: (prompt: string) => Promise<EvaluationResult>
  ): Promise<boolean> {
    if (!node.children || node.children.length === 0) {
      throw new Error(`Composite node ${node.id} has no children`);
    }

    console.log(`  📦 [ENGINE] Evaluating composite: ${node.id} (${node.operator}) - "${node.label}"`);

    this.updateState(node.id, { status: 'evaluating' });

    const childResults: boolean[] = [];

    for (let idx = 0; idx < node.children.length; idx += 1) {
      const childId = node.children[idx];
      const childNode = this.nodeMap.get(childId);
      if (!childNode) {
        throw new Error(`Child node not found: ${childId}`);
      }

      const result = await this.evaluateNode(childNode, caseInput, evaluateFn);
      childResults.push(result);

      // Short-circuit optimization
      if (node.operator === 'allOf' && !result) {
        // If any child fails in allOf, we can stop
        for (let j = idx + 1; j < node.children.length; j += 1) {
          this.markSkipped(node.children[j]);
        }
        break;
      } else if (node.operator === 'anyOf' && result) {
        // If any child succeeds in anyOf, we can stop
        for (let j = idx + 1; j < node.children.length; j += 1) {
          this.markSkipped(node.children[j]);
        }
        break;
      }
    }

    // Apply operator logic
    let decision: boolean;
    let reasoning: string;

    if (node.operator === 'allOf') {
      decision = childResults.every(r => r === true);
      reasoning = decision
        ? 'All sub-requirements were satisfied.'
        : 'At least one required condition was not satisfied.';
    } else if (node.operator === 'anyOf') {
      decision = childResults.some(r => r === true);
      reasoning = decision
        ? 'One of the alternative conditions was satisfied.'
        : 'None of the alternative conditions were satisfied.';
    } else if (node.operator === 'not') {
      // NOT operator: negates the single child result
      decision = !childResults[0];
      reasoning = decision
        ? 'The negated condition was satisfied (child was false).'
        : 'The negated condition was not satisfied (child was true).';
    } else if (node.operator === 'xor') {
      // XOR: exactly one child true
      const trueCount = childResults.filter(Boolean).length;
      decision = trueCount === 1;
      reasoning = decision
        ? 'Exactly one of the conditions was satisfied.'
        : 'XOR requires exactly one true; this condition did not meet that.';
    } else {
      throw new Error(`Unknown operator: ${node.operator}`);
    }

    const childConfidences = (node.children || [])
      .map(childId => this.evaluationStates.get(childId)?.result?.confidence)
      .filter((conf): conf is number => typeof conf === 'number');

    const confidence = childConfidences.length > 0
      ? Math.min(...childConfidences)
      : 0.5;

    this.updateState(node.id, {
      status: 'completed',
      result: {
        nodeId: node.id,
        decision,
        confidence,
        reasoning,
      },
    });

    return decision;
  }

  /**
   * Evaluate a single node (dispatches to primitive or composite)
   */
  private async evaluateNode(
    node: RequirementNode,
    caseInput: string,
    evaluateFn: (prompt: string) => Promise<EvaluationResult>
  ): Promise<boolean> {
    if (node.kind === 'primitive') {
      const result = await this.evaluatePrimitive(node, caseInput, evaluateFn);
      return result.decision;
    } else if (node.kind === 'composite') {
      return await this.evaluateComposite(node, caseInput, evaluateFn);
    }

    throw new Error(`Unknown node kind: ${node.kind}`);
  }

  /**
   * Start evaluation from the root node
   */
  async evaluate(
    caseInput: string,
    evaluateFn: (prompt: string) => Promise<EvaluationResult>
  ): Promise<{ compliant: boolean; states: EvaluationState[] }> {
    const rootNode = this.nodeMap.get(this.pn.requirements.root);
    if (!rootNode) {
      throw new Error(`Root node not found: ${this.pn.requirements.root}`);
    }

    try {
      const result = await this.evaluateNode(rootNode, caseInput, evaluateFn);

      return {
        compliant: result,
        states: Array.from(this.evaluationStates.values()),
      };
    } catch (error) {
      console.error('Evaluation error:', error);
      throw error;
    }
  }

  /**
   * Get current evaluation states
   */
  getStates(): EvaluationState[] {
    return Array.from(this.evaluationStates.values());
  }
}
