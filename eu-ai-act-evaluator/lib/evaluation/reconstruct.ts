/**
 * Evaluation Reconstruction Helpers
 *
 * Given persisted primitive results, rebuild composite decisions,
 * short-circuit skips, and node-level evaluation states.
 */

import type {
  PrescriptiveNorm,
  SharedPrimitive,
  RequirementNode,
  EvaluationState,
} from './types';
import { expandSharedRequirements } from './expand-shared';

interface EvaluationResultRow {
  node_id: string;
  decision: boolean;
  confidence: number | null;
  reasoning: string | null;
  citations?: unknown;
}

interface NodeComputation {
  decision: boolean | null;
  confidence: number | null;
}

export interface ReconstructedEvaluation {
  nodes: RequirementNode[];
  states: EvaluationState[];
  primitiveTotal: number;
  primitiveResolved: number;
  rootDecision: boolean | null;
}

/**
 * Rebuild evaluation states from stored primitive results.
 */
export function reconstructEvaluation(
  prescriptiveNorm: PrescriptiveNorm,
  sharedPrimitives: SharedPrimitive[] = [],
  results: EvaluationResultRow[] = []
): ReconstructedEvaluation {
  const expandedNodes = expandSharedRequirements(
    prescriptiveNorm.requirements.nodes,
    sharedPrimitives
  );

  const nodeMap = new Map(expandedNodes.map(node => [node.id, node]));
  const resultMap = new Map(results.map(row => [row.node_id, row]));
  const stateMap = new Map<string, EvaluationState>();

  const primitiveNodes = expandedNodes.filter(node => node.kind === 'primitive');
  let resolvedPrimitiveCount = 0;

  const markSkipped = (nodeId: string) => {
    if (stateMap.has(nodeId)) return;
    const node = nodeMap.get(nodeId);
    if (!node) return;

    stateMap.set(nodeId, {
      nodeId,
      status: 'skipped',
    });

    if (node.kind === 'primitive') {
      resolvedPrimitiveCount += 1;
      return;
    }

    for (const childId of node.children ?? []) {
      markSkipped(childId);
    }
  };

  const evaluateNode = (nodeId: string): NodeComputation => {
    if (stateMap.has(nodeId)) {
      const existing = stateMap.get(nodeId)!;
      const decision = existing.result?.decision ?? null;
      const confidence = existing.result?.confidence ?? null;
      return { decision, confidence };
    }

    const node = nodeMap.get(nodeId);
    if (!node) {
      throw new Error(`Node not found during reconstruction: ${nodeId}`);
    }

    if (node.kind === 'primitive') {
      const stored = resultMap.get(nodeId);
      if (stored) {
        const confidence = stored.confidence ?? 0.5;
        stateMap.set(nodeId, {
          nodeId,
          status: 'completed',
          result: {
            nodeId,
            decision: stored.decision,
            confidence,
            reasoning: stored.reasoning ?? '',
            citations: stored.citations ?? [],
          },
        });
        resolvedPrimitiveCount += 1;
        return { decision: stored.decision, confidence };
      }

      return { decision: null, confidence: null };
    }

    const childIds = node.children ?? [];
    const childDecisions: Array<boolean | null> = [];
    const childConfidences: number[] = [];

    const addChildComputation = (childId: string | undefined, computation: NodeComputation) => {
      if (typeof childId === 'string') {
        childDecisions.push(computation.decision);
        if (typeof computation.confidence === 'number') {
          childConfidences.push(computation.confidence);
        }
      }
    };

    const skipRemainingChildren = (startIndex: number) => {
      for (let i = startIndex; i < childIds.length; i += 1) {
        markSkipped(childIds[i]);
      }
    };

    let decision: boolean | null = null;
    let hasUnknown = false;

    if (node.operator === 'allOf') {
      decision = true;
      for (let idx = 0; idx < childIds.length; idx += 1) {
        const childId = childIds[idx];
        const computation = evaluateNode(childId);
        addChildComputation(childId, computation);

        if (computation.decision === false) {
          decision = false;
          skipRemainingChildren(idx + 1);
          break;
        }
        if (computation.decision === null) {
          hasUnknown = true;
        }
      }

      if (decision !== false) {
        decision = hasUnknown ? null : true;
      }
    } else if (node.operator === 'anyOf') {
      decision = false;
      for (let idx = 0; idx < childIds.length; idx += 1) {
        const childId = childIds[idx];
        const computation = evaluateNode(childId);
        addChildComputation(childId, computation);

        if (computation.decision === true) {
          decision = true;
          skipRemainingChildren(idx + 1);
          break;
        }
        if (computation.decision === null) {
          hasUnknown = true;
        }
      }

      if (decision !== true) {
        decision = hasUnknown ? null : false;
      }
    } else if (node.operator === 'not') {
      const firstChildId = childIds[0];
      const childComputation = firstChildId ? evaluateNode(firstChildId) : { decision: null, confidence: null };
      addChildComputation(firstChildId, childComputation);
      decision = childComputation.decision === null ? null : !childComputation.decision;
    } else if (node.operator === 'xor') {
      let trueCount = 0;
      for (const childId of childIds) {
        const computation = evaluateNode(childId);
        addChildComputation(childId, computation);
        if (computation.decision === true) {
          trueCount += 1;
        }
        if (computation.decision === null) {
          hasUnknown = true;
        }
      }
      decision = hasUnknown ? null : trueCount === 1;
    } else {
      throw new Error(`Unsupported operator during reconstruction: ${node.operator}`);
    }

    const confidence = childConfidences.length > 0 ? Math.min(...childConfidences) : 0.5;
    const hasProgress = childDecisions.some(dec => dec !== null);

    if (!stateMap.has(nodeId) || decision !== null) {
      stateMap.set(nodeId, {
        nodeId,
        status: decision === null ? (hasProgress ? 'evaluating' : 'pending') : 'completed',
        result:
          decision === null
            ? undefined
            : {
                nodeId,
                decision,
                confidence,
                reasoning: 'Derived from child evaluations.',
                citations: [],
              },
      });
    } else if (stateMap.get(nodeId)?.status === 'pending' && hasProgress) {
      stateMap.set(nodeId, {
        nodeId,
        status: 'evaluating',
      });
    }

    return { decision, confidence };
  };

  const rootId = prescriptiveNorm.requirements.root;
  const { decision: rootDecision } = evaluateNode(rootId);

  for (const node of expandedNodes) {
    if (!stateMap.has(node.id)) {
      stateMap.set(node.id, {
        nodeId: node.id,
        status: 'pending',
      });
    }
  }

  return {
    nodes: expandedNodes,
    states: Array.from(stateMap.values()),
    primitiveTotal: primitiveNodes.length,
    primitiveResolved: resolvedPrimitiveCount,
    rootDecision: rootDecision ?? null,
  };
}
