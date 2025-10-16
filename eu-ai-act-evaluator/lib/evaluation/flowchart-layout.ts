/**
 * Flowchart Layout Algorithm (Proper Logic Branching)
 *
 * Handles allOf and anyOf operators correctly:
 * - allOf: Sequential checks, all must pass
 * - anyOf: Try each branch, stop on first success
 */

import type { Node, Edge } from '@xyflow/react';
import type { RequirementNode, EvaluationState } from './types';

interface FlowchartLayoutOptions {
  verticalSpacing: number;
  horizontalSpacing: number;
  startX: number;
  startY: number;
}

const defaultOptions: FlowchartLayoutOptions = {
  verticalSpacing: 220,
  horizontalSpacing: 450,
  startX: 600,
  startY: 100,
};

interface LayoutResult {
  lastY: number;
  lastNodeId?: string; // Last primitive node in this path
}

export function layoutFlowchart(
  requirementNodes: RequirementNode[],
  rootId: string,
  evaluationStates: EvaluationState[],
  options: Partial<FlowchartLayoutOptions> = {}
): { nodes: Node[]; edges: Edge[] } {
  const opts = { ...defaultOptions, ...options };
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map(requirementNodes.map(n => [n.id, n]));
  let terminalCounter = 0;
  const currentY = opts.startY;

  function getState(nodeId: string) {
    return evaluationStates.find(s => s.nodeId === nodeId);
  }

  function createTerminalId() {
    return `terminal-${terminalCounter++}`;
  }

  function addPrimitiveNode(id: string, reqNode: RequirementNode, x: number, y: number): Node {
    const state = getState(id);
    const node: Node = {
      id,
      type: 'decision',
      position: { x, y },
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
    };
    nodes.push(node);
    return node;
  }

  function addTerminalNode(id: string, label: string, x: number, y: number): Node {
    const node: Node = {
      id,
      type: 'terminal',
      position: { x, y },
      data: {
        label,
        kind: 'terminal' as const,
        status: 'pending' as const,
      },
    };
    nodes.push(node);
    return node;
  }

  function addGateNode(id: string, reqNode: RequirementNode, x: number, y: number): Node {
    const state = getState(id);
    const node: Node = {
      id,
      type: 'gate',
      position: { x, y },
      data: {
        label: reqNode.label,
        kind: 'composite' as const,
        operator: reqNode.operator,
        status: state?.status || 'pending',
      },
    };
    nodes.push(node);
    return node;
  }

  function addEdge(
    sourceId: string,
    targetId: string,
    label?: string,
    style?: 'success' | 'failure' | 'default',
    sourceHandle?: string,
    targetHandle?: string,
    pathOffset?: number
  ) {
    const edgeStyle = style === 'success'
      ? { stroke: '#10b981', strokeWidth: 2.5, strokeOpacity: 0.7 }
      : style === 'failure'
      ? { stroke: '#f43f5e', strokeWidth: 2.5, strokeOpacity: 0.7 }
      : { stroke: '#cbd5e1', strokeWidth: 2, strokeOpacity: 0.6 };

    edges.push({
      id: `${sourceId}-${targetId}-${label || ''}`,
      source: sourceId,
      target: targetId,
      sourceHandle: sourceHandle || 'bottom',
      targetHandle: targetHandle || 'top',
      type: 'smoothstep',
      label: label || '',
      labelStyle: {
        fontSize: 10,
        fontWeight: '600',
        fill: style === 'success' ? '#059669' : style === 'failure' ? '#e11d48' : '#64748b',
        letterSpacing: '0.03em',
      },
      labelBgStyle: {
        fill: 'white',
        fillOpacity: 0.95,
        rx: 6,
      },
      labelBgPadding: [8, 4] as [number, number],
      style: edgeStyle,
      animated: false,
      pathOptions: { offset: pathOffset ?? 10, borderRadius: 20 },
    });
  }

  /**
   * Layout allOf: All children must pass sequentially
   */
  function layoutAllOf(
    nodeId: string,
    node: RequirementNode,
    x: number,
    startY: number,
    nextNodeId?: string // What to connect to on success
  ): LayoutResult {
    const gateNode = addGateNode(nodeId, node, x, startY);

    if (!node.children || node.children.length === 0) {
      return { lastY: startY, lastNodeId: gateNode.id };
    }

    const branchBottoms: number[] = [];
    const failId = createTerminalId();
    const failNode = addTerminalNode(failId, '✗ Requirement not met', x + opts.horizontalSpacing, startY + opts.verticalSpacing);

    let localY = startY + opts.verticalSpacing;
    let lastPrimitiveId: string | undefined;

    for (let i = 0; i < node.children.length; i++) {
      const childId = node.children[i];
      const childNode = nodeMap.get(childId);
      if (!childNode) continue;

      const isLast = i === node.children.length - 1;

      // Layout child
      const childResult = layoutNode(
        childId,
        childNode,
        x,
        localY,
        isLast ? nextNodeId : node.children[i + 1]
      );

      if (i === 0) {
        addEdge(nodeId, childId, '', 'default', 'bottom', 'top');
      }

      // Track last primitive for connecting
      if (childResult.lastNodeId) {
        lastPrimitiveId = childResult.lastNodeId;
      }

      if (childResult.lastNodeId && (childNode.kind !== 'composite' || childNode.operator === 'allOf')) {
        addEdge(childResult.lastNodeId, failNode.id, 'NO', 'failure', 'right', 'left', 50);
      }

      branchBottoms.push(childResult.lastY);
      localY = childResult.lastY + opts.verticalSpacing;
    }

    if (branchBottoms.length > 0) {
      const minY = Math.min(...branchBottoms);
      const maxY = Math.max(...branchBottoms);
      failNode.position.y = minY + (maxY - minY) / 2;
    }

    return {
      lastY: localY,
      lastNodeId: lastPrimitiveId,
    };
  }

  /**
   * Layout anyOf: Try each branch, stop on first success
   */
  function layoutAnyOf(
    nodeId: string,
    node: RequirementNode,
    x: number,
    startY: number,
    nextNodeId?: string // What to connect to on success
  ): LayoutResult {
    const gateNode = addGateNode(nodeId, node, x, startY);

    if (!node.children || node.children.length === 0) {
      return { lastY: startY, lastNodeId: gateNode.id };
    }

    const branchSpacing = opts.horizontalSpacing;
    const totalWidth = branchSpacing * Math.max(node.children.length - 1, 0);
    const baseX = x - totalWidth / 2;
    const childY = startY + opts.verticalSpacing;

    const branchBottoms: number[] = [];
    const failId = createTerminalId();
    const failNode = addTerminalNode(failId, '✗ None match', x + totalWidth / 2 + branchSpacing, childY);

    let maxBranchBottom = childY;
    let lastBranchSuccess: string | undefined;

    for (let i = 0; i < node.children.length; i++) {
      const childId = node.children[i];
      const childNode = nodeMap.get(childId);
      if (!childNode) continue;

      const childX = baseX + i * branchSpacing;
      const sourceHandle = childX < x ? 'left' : childX > x ? 'right' : 'bottom';
      const offset = childX === x ? 10 : childX < x ? -80 : 80;

      addEdge(nodeId, childId, '', 'default', sourceHandle, 'top', offset);

      const childResult = layoutNode(childId, childNode, childX, childY, nextNodeId);

      if (childResult.lastNodeId) {
        addEdge(childResult.lastNodeId, failNode.id, 'NO', 'failure', 'right', 'left', 40);
        lastBranchSuccess = childResult.lastNodeId;
      }

      branchBottoms.push(childResult.lastY);
      maxBranchBottom = Math.max(maxBranchBottom, childResult.lastY);
    }

    if (branchBottoms.length > 0) {
      const minY = Math.min(...branchBottoms);
      const maxY = Math.max(...branchBottoms);
      failNode.position.y = minY + (maxY - minY) / 2;
    }

    return {
      lastY: maxBranchBottom + opts.verticalSpacing,
      lastNodeId: lastBranchSuccess,
    };
  }

  /**
   * Layout a single node
   */
  function layoutNode(
    nodeId: string,
    node: RequirementNode,
    x: number,
    y: number,
    nextNodeId?: string
  ): LayoutResult {
    if (node.kind === 'composite') {
      if (node.operator === 'allOf') {
        return layoutAllOf(nodeId, node, x, y, nextNodeId);
      } else if (node.operator === 'anyOf') {
        return layoutAnyOf(nodeId, node, x, y, nextNodeId);
      }

      addGateNode(nodeId, node, x, y);
      return { lastY: y, lastNodeId: nodeId };
    }

    // Primitive node
    addPrimitiveNode(nodeId, node, x, y);

    // Connect YES to next node if provided
    if (nextNodeId) {
      addEdge(nodeId, nextNodeId, 'YES', 'success', 'bottom', 'top');
    }

    return {
      lastY: y,
      lastNodeId: nodeId,
    };
  }

  // Start layout from root
  const rootNode = nodeMap.get(rootId);
  if (rootNode) {
    const result = layoutNode(rootId, rootNode, opts.startX, currentY);

    // Add final success terminal
    if (result.lastNodeId) {
      const finalY = result.lastY + opts.verticalSpacing;
      const finalId = createTerminalId();
      addTerminalNode(finalId, '✓ All requirements met', opts.startX, finalY);
      addEdge(result.lastNodeId, finalId, 'YES', 'success', 'bottom', 'top');
    }
  }

  return { nodes, edges };
}
