'use client';

/**
 * Live Requirements Grid
 *
 * Shows the requirements grid structure immediately, even before evaluation completes.
 * Updates live as results come in.
 */

import { useEffect, useState } from 'react';
import type { PrescriptiveNorm, EvaluationState } from '@/lib/evaluation/types';

interface RequirementsGridProps {
  evaluationId: string;
  pnIds: string[];
  status: string;
  results: any[];
  onSelectNode: (nodeId: string) => void;
}

export function RequirementsGrid({
  evaluationId,
  pnIds,
  status,
  results,
  onSelectNode,
}: RequirementsGridProps) {
  const [pnData, setPnData] = useState<PrescriptiveNorm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptiveNorms();
  }, [pnIds]);

  const loadPrescriptiveNorms = async () => {
    setLoading(true);
    try {
      // Load PN data from the data/prescriptive-norms folder
      const loadedPNs: PrescriptiveNorm[] = [];
      for (const pnId of pnIds) {
        const response = await fetch(`/data/prescriptive-norms/${pnId}.json`);
        if (response.ok) {
          const data = await response.json();
          loadedPNs.push(data);
        } else {
          console.error(`Failed to load ${pnId}: ${response.status}`);
        }
      }
      setPnData(loadedPNs);
    } catch (error) {
      console.error('Error loading prescriptive norms:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-500 text-sm">Loading requirements structure...</div>
      </div>
    );
  }

  if (pnData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-500 text-sm">No prescriptive norms found</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {pnData.map((pn) => (
        <div key={pn.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          {/* PN Header */}
          <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-neutral-900">{pn.title}</h3>
            <p className="text-sm text-neutral-600 mt-1">
              {pn.legal_consequence.verbatim}
            </p>
          </div>

          {/* Requirements Tree */}
          <div className="p-6">
            <RequirementTree
              pn={pn}
              rootId={pn.requirements.root}
              results={results}
              status={status}
              onSelectNode={onSelectNode}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Requirement Tree Component - Hybrid Layout
function RequirementTree({
  pn,
  rootId,
  results,
  status,
  onSelectNode,
}: {
  pn: PrescriptiveNorm;
  rootId: string;
  results: any[];
  status: string;
  onSelectNode: (nodeId: string) => void;
}) {
  const nodes = pn.requirements.nodes;
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const rootNode = nodeMap.get(rootId);

  if (!rootNode) return null;

  // Get root-level children (first tier)
  const rootChildren = rootNode.children?.map(id => nodeMap.get(id)).filter(Boolean) || [];

  return (
    <div className="space-y-6">
      {/* Horizontal Root Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rootChildren.map((child) => (
          <RootRequirementCard
            key={child.id}
            node={child}
            nodeMap={nodeMap}
            results={results}
            status={status}
            onSelectNode={onSelectNode}
          />
        ))}
      </div>
    </div>
  );
}

// Root Requirement Card (Top-level gates)
function RootRequirementCard({
  node,
  nodeMap,
  results,
  status,
  onSelectNode,
}: {
  node: any;
  nodeMap: Map<string, any>;
  results: any[];
  status: string;
  onSelectNode: (nodeId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const result = results.find(r => r.node_id === node.id);

  const getNodeColor = () => {
    if (status !== 'completed' || !result) {
      return 'border-neutral-200 bg-white';
    }
    return result.decision ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`border rounded-lg ${getNodeColor()} overflow-hidden`}>
      {/* Root Card Header */}
      <button
        onClick={() => {
          onSelectNode(node.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        className="w-full p-4 text-left hover:bg-opacity-80 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="text-sm font-semibold text-neutral-900 mb-1">
              {node.label}
            </div>
            {node.question && (
              <div className="text-xs text-neutral-600 mt-2">
                {node.question.prompt}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {status !== 'completed' ? (
              <span className="text-xs px-2 py-1 rounded bg-neutral-100 text-neutral-600">
                Pending
              </span>
            ) : result ? (
              <span className={`text-xs px-2 py-1 rounded ${
                result.decision ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {result.decision ? '✓' : '✗'}
              </span>
            ) : null}
            {hasChildren && (
              <svg
                className={`w-4 h-4 text-neutral-400 transition-transform ${
                  expanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* Vertical Sub-Requirements */}
      {hasChildren && expanded && (
        <div className="border-t border-neutral-200 bg-neutral-50 p-3 space-y-2">
          {node.children.map((childId: string) => {
            const childNode = nodeMap.get(childId);
            if (!childNode) return null;
            return (
              <SubRequirementNode
                key={childId}
                node={childNode}
                nodeMap={nodeMap}
                results={results}
                status={status}
                onSelectNode={onSelectNode}
                depth={1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Sub-Requirement Node (Vertical layout beneath root cards)
function SubRequirementNode({
  node,
  nodeMap,
  results,
  status,
  onSelectNode,
  depth,
}: {
  node: any;
  nodeMap: Map<string, any>;
  results: any[];
  status: string;
  onSelectNode: (nodeId: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const result = results.find(r => r.node_id === node.id);
  const hasChildren = node.children && node.children.length > 0;

  const getNodeColor = () => {
    if (status !== 'completed' || !result) {
      return 'border-neutral-200 bg-white text-neutral-700';
    }
    return result.decision ? 'border-green-400 bg-green-50 text-green-900' : 'border-red-400 bg-red-50 text-red-900';
  };

  return (
    <div style={{ marginLeft: `${(depth - 1) * 1}rem` }}>
      <button
        onClick={() => {
          onSelectNode(node.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        className={`w-full text-left px-3 py-2 rounded border text-xs ${getNodeColor()} hover:shadow-sm transition-all`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{node.label}</div>
            {node.question && (
              <div className="text-[10px] text-neutral-600 mt-1 line-clamp-1">
                {node.question.prompt}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {status !== 'completed' ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                Pending
              </span>
            ) : result ? (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                result.decision ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {result.decision ? '✓' : '✗'}
              </span>
            ) : null}
            {hasChildren && (
              <svg
                className={`w-3 h-3 text-neutral-400 transition-transform ${
                  expanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* Nested children */}
      {hasChildren && expanded && (
        <div className="mt-2 space-y-2">
          {node.children.map((childId: string) => {
            const childNode = nodeMap.get(childId);
            if (!childNode) return null;
            return (
              <SubRequirementNode
                key={childId}
                node={childNode}
                nodeMap={nodeMap}
                results={results}
                status={status}
                onSelectNode={onSelectNode}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Detail Panel Component
export function DetailPanel({ nodeId }: { nodeId: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-900 mb-2">Node Details</h3>
      <p className="text-xs text-neutral-600">Selected node: {nodeId}</p>
    </div>
  );
}
