import type { RequirementNode, SharedPrimitive, Context } from './types';

function cloneNode(node: RequirementNode): RequirementNode {
  return {
    ...node,
    children: node.children ? [...node.children] : undefined,
    question: node.question ? { ...node.question } : undefined,
    context: cloneContext(node.context),
    sources: node.sources ? node.sources.map(source => ({ ...source })) : undefined,
    ref: node.ref,
  };
}

function cloneContext(context?: Context): Context | undefined {
  if (!context) return undefined;
  return {
    items: context.items.map(item => ({
      ...item,
      sources: item.sources ? item.sources.map(source => ({ ...source })) : undefined,
    })),
  };
}

function mergeContexts(primary?: Context, secondary?: Context): Context | undefined {
  if (!primary && !secondary) return undefined;
  if (primary && !secondary) return cloneContext(primary);
  if (!primary && secondary) return cloneContext(secondary);
  const primaryItems = primary?.items ?? [];
  const secondaryItems = secondary?.items ?? [];
  return {
    items: [...primaryItems.map(item => ({
      ...item,
      sources: item.sources ? item.sources.map(source => ({ ...source })) : undefined,
    })), ...secondaryItems.map(item => ({
      ...item,
      sources: item.sources ? item.sources.map(source => ({ ...source })) : undefined,
    }))],
  };
}

interface ExpandOptions {
  namespace?: string;
}

export function expandRequirements(
  nodes: RequirementNode[],
  sharedPrimitives: SharedPrimitive[]
): RequirementNode[] {
  const primitiveMap = new Map(sharedPrimitives.map(p => [p.id, p]));
  const expandedMap = new Map<string, RequirementNode>();
  const queue: RequirementNode[] = nodes.map(node => cloneNode(node));

  while (queue.length > 0) {
    const node = queue.shift()!;

    if (!node.ref) {
      if (!expandedMap.has(node.id)) {
        expandedMap.set(node.id, node);
      }
      continue;
    }

    const primitive = primitiveMap.get(node.ref);
    if (!primitive) {
      // Unknown ref, keep node as-is
      const clone = { ...node };
      clone.children = node.children ? [...node.children] : undefined;
      expandedMap.set(node.id, clone);
      continue;
    }

    const namespace = `${node.ref.replace(/:/g, '-')}:${node.id}`;
    const primitiveRoot = primitive.logic.nodes.find(n => n.id === primitive.logic.root);

    if (!primitiveRoot) {
      // Malformed primitive, keep original
      const clone = { ...node };
      clone.children = node.children ? [...node.children] : undefined;
      expandedMap.set(node.id, clone);
      continue;
    }

    const rootClone = cloneNode(node);
    rootClone.ref = undefined;

    if (primitiveRoot.kind === 'primitive') {
      rootClone.kind = 'primitive';
      rootClone.operator = undefined;
      rootClone.question = primitiveRoot.question ? { ...primitiveRoot.question } : rootClone.question;
      rootClone.context = mergeContexts(rootClone.context, primitiveRoot.context);
      rootClone.children = undefined;
    } else {
      rootClone.kind = primitiveRoot.kind;
      rootClone.operator = primitiveRoot.operator;
      rootClone.question = undefined;
      rootClone.context = mergeContexts(rootClone.context, primitiveRoot.context);
      rootClone.children = primitiveRoot.children
        ? primitiveRoot.children.map(childId =>
            childId === primitive.logic.root ? node.id : `${namespace}:${childId}`
          )
        : undefined;
    }

    expandedMap.set(node.id, rootClone);

    for (const primitiveNode of primitive.logic.nodes) {
      if (primitiveNode.id === primitive.logic.root) {
        continue;
      }

      const clonedPrimitiveNode = cloneNode(primitiveNode);
      const namespacedId = `${namespace}:${primitiveNode.id}`;
      clonedPrimitiveNode.id = namespacedId;

      if (primitiveNode.children && primitiveNode.children.length > 0) {
        clonedPrimitiveNode.children = primitiveNode.children.map(childId =>
          childId === primitive.logic.root ? node.id : `${namespace}:${childId}`
        );
      }

      if (primitiveNode.ref) {
        // Queue for further expansion if nested refs exist
        queue.push(clonedPrimitiveNode);
      } else {
        expandedMap.set(namespacedId, clonedPrimitiveNode);
      }
    }
  }

  return Array.from(expandedMap.values());
}

