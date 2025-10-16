/**
 * Skip Logic for Gray-out Requirements
 *
 * Determines when a requirement should be grayed out because
 * evaluation is unnecessary (parent already failed or sibling already satisfied)
 */

import type { RequirementNode, EvaluationState } from './types';

/**
 * Check if a node should be skipped (grayed out) based on parent states
 */
export function shouldSkipNode(
  nodeId: string,
  nodes: RequirementNode[],
  evaluationStates: EvaluationState[]
): boolean {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const parents = getParentChain(nodeId, nodes);

  for (const parentId of parents) {
    const parent = nodeMap.get(parentId);
    if (!parent) continue;

    const parentState = evaluationStates.find(s => s.nodeId === parentId);

    // If parent is allOf and any child failed → all other children are skipped
    if (parent.operator === 'allOf') {
      const failedSibling = parent.children?.find(childId => {
        const childState = evaluationStates.find(s => s.nodeId === childId);
        return childState?.status === 'completed' && childState.result?.decision === false;
      });

      if (failedSibling && failedSibling !== nodeId) {
        // Check if this node comes after the failed sibling in the evaluation order
        const failedIndex = parent.children?.indexOf(failedSibling) ?? -1;
        const nodeIndex = parent.children?.indexOf(nodeId) ?? -1;
        if (nodeIndex > failedIndex) {
          return true;
        }
      }
    }

    // If parent is anyOf and one child passed → all other children are skipped
    if (parent.operator === 'anyOf') {
      const passedSibling = parent.children?.find(childId => {
        const childState = evaluationStates.find(s => s.nodeId === childId);
        return childState?.status === 'completed' && childState.result?.decision === true;
      });

      if (passedSibling && passedSibling !== nodeId) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get the chain of parent node IDs from root to the given node
 */
function getParentChain(nodeId: string, nodes: RequirementNode[]): string[] {
  const parents: string[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Find parents by checking which nodes have this nodeId as a child
  for (const node of nodes) {
    if (node.children?.includes(nodeId)) {
      parents.push(node.id);
      // Recursively get grandparents
      parents.push(...getParentChain(node.id, nodes));
    }
  }

  return parents.reverse(); // Reverse to get root-to-node order
}
