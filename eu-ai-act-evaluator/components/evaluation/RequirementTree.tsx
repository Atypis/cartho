'use client';

/**
 * Requirement Tree Visualization
 *
 * Displays the requirement tree using React Flow with live evaluation states
 */

import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { RequirementNode, EvaluationState, SharedPrimitive } from '@/lib/evaluation/types';
import { RequirementNodeComponent } from './RequirementNodeComponent';
import { FlowchartDecisionNode, FlowchartGateNode, FlowchartTerminalNode } from './FlowchartNode';
import { layoutFlowchart } from '@/lib/evaluation/flowchart-layout';
import { expandRequirements } from '@/lib/evaluation/expand';

interface RequirementTreeProps {
  nodes: RequirementNode[];
  rootId: string;
  sharedPrimitives?: SharedPrimitive[];
  evaluationStates?: EvaluationState[];
  onNodeClick?: (nodeId: string) => void;
  layoutMode?: 'tree' | 'flowchart';
}

const nodeTypes = {
  requirement: RequirementNodeComponent,
  decision: FlowchartDecisionNode,
  gate: FlowchartGateNode,
  terminal: FlowchartTerminalNode,
};

export function RequirementTree({
  nodes: requirementNodes,
  rootId,
  sharedPrimitives = [],
  evaluationStates = [],
  onNodeClick,
  layoutMode = 'tree',
}: RequirementTreeProps) {
  // Build expanded node map (includes shared primitive nodes)
  const expandedNodes = useMemo(() => {
    return expandRequirements(requirementNodes, sharedPrimitives);
  }, [requirementNodes, sharedPrimitives]);

  // Convert requirement nodes to React Flow nodes based on layout mode
  const { initialNodes, initialEdges } = useMemo(() => {
    if (layoutMode === 'flowchart') {
      const result = layoutFlowchart(expandedNodes, rootId, evaluationStates);
      return {
        initialNodes: result.nodes,
        initialEdges: result.edges,
      };
    } else {
      return {
        initialNodes: layoutNodes(expandedNodes, rootId, evaluationStates),
        initialEdges: generateEdges(expandedNodes),
      };
    }
  }, [expandedNodes, rootId, evaluationStates, layoutMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when evaluation states change
  useEffect(() => {
    setNodes(prevNodes =>
      prevNodes.map(node => {
        const state = evaluationStates.find(s => s.nodeId === node.id);
        if (state) {
          return {
            ...node,
            data: {
              ...node.data,
              status: state.status,
              result: state.result,
              error: state.error,
            },
          };
        }
        return node;
      })
    );
  }, [evaluationStates, setNodes]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 opacity-50 animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        fitViewOptions={{ padding: 0.3, maxZoom: 0.7 }}
      >
        <Background
          gap={50}
          size={1.5}
          color="rgba(148, 163, 184, 0.3)"
          style={{ opacity: 0.4 }}
        />
        <Controls
          className="!bg-slate-800/80 !backdrop-blur-md !border-slate-700/50 !shadow-2xl !rounded-2xl [&_button]:!bg-slate-700/50 [&_button]:!border-slate-600/50 [&_button:hover]:!bg-slate-600/50 [&_button]:!text-slate-300"
          showInteractive={false}
        />
        <MiniMap
          zoomable
          pannable
          className="!bg-slate-800/80 !backdrop-blur-md !border-slate-700/50 !shadow-2xl !rounded-2xl"
          maskColor="rgba(15, 23, 42, 0.7)"
          nodeColor={(node) => {
            if (node.type === 'terminal') return '#10b981';
            if (node.type === 'decision') return '#60a5fa';
            return '#94a3b8';
          }}
        />
        <Panel position="top-left" className="bg-slate-800/80 backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <div className="text-sm font-bold text-slate-100 tracking-tight">
              Requirement Flow
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Click nodes for detailed analysis
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

/**
 * Improved tree layout algorithm with better spacing for wide trees
 */
function layoutNodes(
  requirementNodes: RequirementNode[],
  rootId: string,
  evaluationStates: EvaluationState[]
): Node[] {
  const nodes: Node[] = [];
  const nodeMap = new Map(requirementNodes.map(n => [n.id, n]));

  const layerSpacing = 180;
  const baseNodeSpacing = 280;

  // First pass: calculate subtree widths
  const subtreeWidths = new Map<string, number>();

  function calculateWidth(nodeId: string): number {
    if (subtreeWidths.has(nodeId)) {
      return subtreeWidths.get(nodeId)!;
    }

    const node = nodeMap.get(nodeId);
    if (!node || !node.children || node.children.length === 0) {
      subtreeWidths.set(nodeId, 1);
      return 1;
    }

    const childrenWidth = node.children.reduce(
      (sum, childId) => sum + calculateWidth(childId),
      0
    );
    subtreeWidths.set(nodeId, Math.max(1, childrenWidth));
    return Math.max(1, childrenWidth);
  }

  calculateWidth(rootId);

  // Second pass: layout nodes with calculated widths
  function layoutNode(nodeId: string, x: number, depth: number): number {
    const reqNode = nodeMap.get(nodeId);
    if (!reqNode) return x;

    const state = evaluationStates.find(s => s.nodeId === nodeId);
    const width = subtreeWidths.get(nodeId) || 1;

    // Center the node in its allocated space
    const nodeX = x + (width * baseNodeSpacing) / 2 - baseNodeSpacing / 2;

    nodes.push({
      id: nodeId,
      type: 'requirement',
      position: { x: nodeX, y: depth * layerSpacing },
      data: {
        label: reqNode.label,
        kind: reqNode.kind,
        operator: reqNode.operator,
        status: state?.status || 'pending',
        result: state?.result,
        error: state?.error,
        question: reqNode.question,
        context: reqNode.context,
      },
    });

    if (reqNode.children && reqNode.children.length > 0) {
      let childX = x;
      for (const childId of reqNode.children) {
        const childWidth = subtreeWidths.get(childId) || 1;
        layoutNode(childId, childX, depth + 1);
        childX += childWidth * baseNodeSpacing;
      }
    }

    return x + width * baseNodeSpacing;
  }

  layoutNode(rootId, 0, 0);

  return nodes;
}

/**
 * Generate edges from parent-child relationships
 */
function generateEdges(requirementNodes: RequirementNode[]): Edge[] {
  const edges: Edge[] = [];

  for (const node of requirementNodes) {
    if (node.children) {
      for (const childId of node.children) {
        edges.push({
          id: `${node.id}-${childId}`,
          source: node.id,
          target: childId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        });
      }
    }
  }

  return edges;
}
