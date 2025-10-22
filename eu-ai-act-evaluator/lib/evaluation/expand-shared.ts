/**
 * Expand Shared Requirements
 *
 * Takes primitive nodes that reference shared predicates (e.g., qp:is_provider)
 * and expands them into their full requirement trees
 */

import type { RequirementNode, SharedPrimitive } from './types';

/**
 * Expand all nodes that reference shared primitives
 * Returns a new array with expanded nodes
 */
export function expandSharedRequirements(
  nodes: RequirementNode[],
  sharedPrimitives: SharedPrimitive[]
): RequirementNode[] {
  const sharedMap = new Map(sharedPrimitives.map(sp => [sp.id, sp]));
  const expandedNodes: RequirementNode[] = [];

  function expandNode(node: RequirementNode, parentPrefix: string = ''): RequirementNode {
    // If this is a primitive with a ref to a shared predicate, expand it
    if (node.kind === 'primitive' && node.ref && sharedMap.has(node.ref)) {
      const shared = sharedMap.get(node.ref)!;

      // Create a composite node that represents the expansion
      const expandedNode: RequirementNode = {
        id: node.id,
        label: node.label,
        kind: 'composite',
        operator: 'allOf', // The shared requirement must be satisfied
        children: [],
        sources: node.sources,
        context: node.context,
      };

      // Expand the shared primitive's logic tree
      const sharedNodes = shared.logic.nodes;
      const sharedRoot = sharedNodes.find(n => n.id === shared.logic.root)!;

      // Recursively expand the shared tree
      const expandedSharedNodes = expandSharedTree(
        sharedRoot,
        sharedNodes,
        `${node.id}-expanded`,
        sharedMap,
        shared.id
      );

      // Add all expanded nodes to our collection
      expandedNodes.push(...expandedSharedNodes);

      // Update the children reference
      expandedNode.children = [expandedSharedNodes[0].id]; // Point to the root of expanded tree

      return expandedNode;
    }

    // If composite, recursively expand children
    if (node.kind === 'composite' && node.children) {
      const expandedChildren = node.children.map((childId, idx) => {
        const childNode = nodes.find(n => n.id === childId);
        if (childNode) {
          const expanded = expandNode(childNode, `${parentPrefix}.${idx}`);
          expandedNodes.push(expanded);
          return expanded.id;
        }
        return childId;
      });

      return {
        ...node,
        children: expandedChildren,
      };
    }

    // Regular primitive or terminal node
    return node;
  }

  // Start expansion from root
  for (const node of nodes) {
    if (!expandedNodes.find(n => n.id === node.id)) {
      const expanded = expandNode(node);
      if (!expandedNodes.find(n => n.id === expanded.id)) {
        expandedNodes.push(expanded);
      }
    }
  }

  return expandedNodes;
}

/**
 * Helper: Expand a shared predicate's tree into a new set of nodes
 */
function expandSharedTree(
  rootNode: RequirementNode,
  allNodes: RequirementNode[],
  idPrefix: string,
  sharedMap: Map<string, SharedPrimitive>,
  sharedPrimitiveId: string
): RequirementNode[] {
  const result: RequirementNode[] = [];
  const nodeMap = new Map(allNodes.map(n => [n.id, n]));

  function expand(node: RequirementNode, depth: number = 0): RequirementNode {
    // Create new ID with prefix
    const newId = `${idPrefix}.${node.id}`;

    // If this node also references a shared primitive, recursively expand it
    if (node.kind === 'primitive' && node.ref && sharedMap.has(node.ref)) {
      const shared = sharedMap.get(node.ref)!;
      const sharedNodes = shared.logic.nodes;
      const sharedRoot = sharedNodes.find(n => n.id === shared.logic.root)!;

      // Recursively expand
      const nestedExpanded = expandSharedTree(
        sharedRoot,
        sharedNodes,
        newId,
        sharedMap,
        shared.id
      );

      result.push(...nestedExpanded);

      // Return a composite that points to the nested expansion
      const compositeNode: RequirementNode = {
        id: newId,
        label: node.label,
        kind: 'composite',
        operator: 'allOf',
        children: [nestedExpanded[0].id],
        sources: node.sources,
        context: node.context,
        sharedRequirement: {
          primitiveId: sharedPrimitiveId,
          nodeId: node.id,
        },
      };

      return compositeNode;
    }

    // If composite, expand children
    if (node.kind === 'composite' && node.children) {
      const expandedChildren: string[] = [];

      for (const childId of node.children) {
        const child = nodeMap.get(childId);
        if (child) {
          const expandedChild = expand(child, depth + 1);
          result.push(expandedChild);
          expandedChildren.push(expandedChild.id);
        }
      }

      return {
        ...node,
        id: newId,
        children: expandedChildren,
        sharedRequirement: {
          primitiveId: sharedPrimitiveId,
          nodeId: node.id,
        },
      };
    }

    // Regular primitive
    return {
      ...node,
      id: newId,
      sharedRequirement: {
        primitiveId: sharedPrimitiveId,
        nodeId: node.id,
      },
    };
  }

  const expandedRoot = expand(rootNode);
  result.unshift(expandedRoot); // Add root at the beginning

  return result;
}
