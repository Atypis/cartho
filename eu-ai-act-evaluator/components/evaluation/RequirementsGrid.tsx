'use client';

/**
 * Requirements Grid Component
 *
 * Main layout component that displays requirements in a tabular structure:
 * - Root-level requirements horizontally
 * - Sub-requirements expand vertically
 */

import { RequirementBlock } from './RequirementBlock';
import { toRomanNumeral } from '@/lib/evaluation/layout-utils';
import type { RequirementNode, EvaluationState } from '@/lib/evaluation/types';

interface RequirementsGridProps {
  nodes: RequirementNode[];
  rootId: string;
  evaluationStates: EvaluationState[];
  onNodeClick: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export function RequirementsGrid({
  nodes,
  rootId,
  evaluationStates,
  onNodeClick,
  selectedNodeId,
}: RequirementsGridProps) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const root = nodeMap.get(rootId);

  if (!root) {
    return (
      <div className="text-center py-12 text-neutral-500">
        No requirements found
      </div>
    );
  }

  // Determine root-level requirements
  // If root is allOf, each child is a top-level requirement (horizontal layout)
  // Otherwise, root itself is the only top-level requirement
  const rootLevelRequirements =
    root.kind === 'composite' && root.operator === 'allOf' && root.children
      ? root.children.map(id => nodeMap.get(id)).filter((n): n is RequirementNode => n !== undefined)
      : [root];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
          Requirements Assessment
        </h3>
        <p className="text-sm text-neutral-600">
          Click on any requirement to see detailed information
        </p>
      </div>

      {/* Horizontal Grid of Root-Level Requirements */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${rootLevelRequirements.length}, minmax(280px, 1fr))`,
        }}
      >
        {rootLevelRequirements.map((req, idx) => (
          <RequirementBlock
            key={req.id}
            node={req}
            nodeMap={nodeMap}
            allNodes={nodes}
            evaluationStates={evaluationStates}
            onNodeClick={onNodeClick}
            numberPrefix={toRomanNumeral(idx + 1)} // I, II, III...
            depth={0}
            selectedNodeId={selectedNodeId}
          />
        ))}
      </div>
    </div>
  );
}
