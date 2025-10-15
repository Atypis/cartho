# EU AI Act Evaluator - Frontend Redesign Specification

**Document Type:** Implementation Specification
**Version:** 1.0
**Date:** 2025-10-15
**Status:** Locked for Implementation

---

## Overview

This document specifies the complete redesign of the EU AI Act Evaluator frontend, moving from a React Flow-based flowchart visualization to a clean, tabular Prüfungsschema-style assessment interface.

---

## Design Decisions (Locked)

### 1. **No Edges** ✓
- Requirements relationships shown through structure and color only
- No connecting lines between nodes
- Visual clarity through position, indentation, and status colors

### 2. **Custom Tabular Layout** ✓
- **No React Flow** - Custom implementation using standard React/CSS
- Table-like structure with rows and columns
- Simple DOM structure for better control and performance

### 3. **Hybrid Layout** ✓
- **Root-level requirements:** Horizontal (side-by-side)
- **Sub-requirements:** Vertical expansion (stacked rows)
- **Important:** These are NOT alternative paths - they are requirements that must be evaluated
- If actual alternatives exist (anyOf), they are grouped as a single requirement with internal structure

---

## Structural Understanding (PN-04 Example)

### Current Structure:
```
PN-04: AI Literacy Duty

R-1 (allOf - ALL must be true)
  ├─ R-1.1: Global scope gate (primitive)
  └─ R-1.2: Actor qualification (anyOf - ONE must be true)
       ├─ R-1.2.1: Is provider (primitive)
       └─ R-1.2.2: Is deployer (primitive)
```

### Visual Representation:
```
┌────────────────────────────────────────────────────────────┐
│  PN-04: AI Literacy Duty                                   │
│  "Providers and deployers shall ensure AI literacy..."      │
└────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────────┐
│  I. Global Scope     │  II. Actor Qualification             │
│     Gate             │                                      │
│                      │                                      │
│  □ In scope (Art.2)  │  Actor is provider OR deployer:      │
│                      │    □ Is provider (Art. 3(2))         │
│                      │    □ Is deployer (Art. 3(4))         │
└──────────────────────┴──────────────────────────────────────┘
```

**Key insight:**
- R-1.1 and R-1.2 are **both requirements** (allOf) → show horizontally as separate requirement blocks
- R-1.2.1 and R-1.2.2 are **alternatives** (anyOf) → show vertically within R-1.2 block with OR logic

---

## Layout Algorithm

### Step 1: Identify Root-Level Requirements
- Start at root node
- If root is `allOf`: each child is a root-level requirement → horizontal columns
- If root is `anyOf`: root is a single requirement with alternatives → single column
- If root is `primitive`: single requirement → single column

### Step 2: Layout Each Root-Level Requirement Vertically
- Each requirement block expands vertically
- Sub-requirements stack from top to bottom
- Indentation shows hierarchy depth
- `anyOf` groups show alternatives within the same block (with OR indicator)
- `allOf` groups show cumulative checks (with AND indicator if needed)

### Step 3: Numbering System
- Root-level: I, II, III, IV...
- Second-level: A, B, C...
- Third-level: 1, 2, 3...
- Fourth-level: a, b, c...

Example:
```
I.   Global Scope Gate
II.  Actor Qualification
     A. Provider (alternative)
     B. Deployer (alternative)
III. (Future requirement)
```

---

## Visual Design Specification

### Color Palette (From design.md)
```css
/* Status Colors */
--color-pending: #A3A3A3     /* neutral-400 */
--color-evaluating: #3B82F6  /* blue-500 */
--color-pass: #16A34A        /* green-600 */
--color-fail: #DC2626        /* red-600 */
--color-skipped: #D4D4D4     /* neutral-300, with opacity */

/* Structural Colors */
--color-bg: #FFFFFF
--color-surface: #FAFAFA     /* neutral-50 */
--color-border: #E5E5E5      /* neutral-200 */
--color-text-primary: #0A0A0A
--color-text-secondary: #525252
--color-text-tertiary: #A3A3A3
```

### Typography
```css
/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');

--font-serif: 'Playfair Display', Georgia, serif
--font-sans: 'Inter', -apple-system, system-ui, sans-serif

/* Sizes */
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 20px
--text-2xl: 24px
--text-3xl: 32px
```

### Spacing Scale
```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px
```

---

## Component Structure

### Main Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Left Sidebar (400px)          │  Main Canvas (flex-1)      │
│  ─────────────────────         │  ─────────────────────     │
│  • Header                       │  • Obligation Header       │
│  • PN Selection                 │  • Requirements Grid       │
│  • Case Input                   │  • Detail Panel (selected) │
│  • Results Summary              │                            │
└─────────────────────────────────────────────────────────────┘
```

### Left Sidebar Structure
```tsx
<div className="w-[400px] bg-white border-r border-neutral-200 flex flex-col">
  {/* Header */}
  <div className="p-8 border-b border-neutral-200">
    <h1 className="font-serif text-3xl text-neutral-900">
      EU AI Act Evaluator
    </h1>
    <p className="text-sm text-neutral-600 mt-2">
      Evaluate compliance with prescriptive norms
    </p>
  </div>

  {/* Content (scrollable) */}
  <div className="flex-1 overflow-y-auto">
    {/* Step 1: PN Selection */}
    {/* Step 2: Case Input */}
    {/* Step 3: Results */}
  </div>
</div>
```

### Main Canvas Structure
```tsx
<div className="flex-1 flex flex-col bg-stone-50">
  {/* Obligation Header (always visible) */}
  <div className="bg-white border-b border-neutral-200 p-8">
    <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
      Article {article}
    </div>
    <h2 className="font-serif text-2xl text-neutral-900 mb-3">
      {pn.title}
    </h2>
    <div className="text-sm text-neutral-700 leading-relaxed">
      {pn.legal_consequence.verbatim}
    </div>
  </div>

  {/* Requirements Grid (scrollable) */}
  <div className="flex-1 overflow-auto p-8">
    <RequirementsGrid ... />
  </div>

  {/* Detail Panel (fixed at bottom, appears on selection) */}
  {selectedNode && (
    <div className="bg-white border-t border-neutral-200 p-6">
      <DetailPanel node={selectedNode} />
    </div>
  )}
</div>
```

---

## Requirements Grid Component

### Layout Logic

```tsx
interface RequirementsGridProps {
  nodes: RequirementNode[];
  rootId: string;
  evaluationStates: EvaluationState[];
  onNodeClick: (nodeId: string) => void;
}

function RequirementsGrid({ nodes, rootId, evaluationStates, onNodeClick }: RequirementsGridProps) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const root = nodeMap.get(rootId);

  // Determine layout strategy
  const rootLevelRequirements = root.kind === 'composite' && root.operator === 'allOf'
    ? root.children.map(id => nodeMap.get(id))
    : [root];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-lg font-semibold text-neutral-900">
        Requirements Assessment
      </div>

      {/* Horizontal grid of root-level requirements */}
      <div className="grid gap-6" style={{
        gridTemplateColumns: `repeat(${rootLevelRequirements.length}, 1fr)`,
        minWidth: 'fit-content'
      }}>
        {rootLevelRequirements.map((req, idx) => (
          <RequirementBlock
            key={req.id}
            node={req}
            nodeMap={nodeMap}
            evaluationStates={evaluationStates}
            onNodeClick={onNodeClick}
            numberPrefix={toRomanNumeral(idx + 1)} // I, II, III...
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}
```

### Requirement Block Component

```tsx
interface RequirementBlockProps {
  node: RequirementNode;
  nodeMap: Map<string, RequirementNode>;
  evaluationStates: EvaluationState[];
  onNodeClick: (nodeId: string) => void;
  numberPrefix: string;
  depth: number;
}

function RequirementBlock({
  node,
  nodeMap,
  evaluationStates,
  onNodeClick,
  numberPrefix,
  depth
}: RequirementBlockProps) {
  const state = evaluationStates.find(s => s.nodeId === node.id);
  const status = state?.status || 'pending';
  const result = state?.result;

  const isSkipped = status === 'pending' && someParentFailed();
  const opacity = isSkipped ? 'opacity-60' : 'opacity-100';

  return (
    <div className="space-y-3">
      {/* Header card (always visible) */}
      <div
        className={`
          bg-white border rounded-lg p-4 cursor-pointer
          transition-all duration-200
          ${opacity}
          ${getStatusBorderClass(status, result)}
          hover:shadow-md
        `}
        onClick={() => onNodeClick(node.id)}
      >
        {/* Number + Label */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-xs font-mono text-neutral-400 w-8">
            {numberPrefix}.
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-neutral-900">
              {node.label}
            </div>
            {/* Operator badge if composite */}
            {node.kind === 'composite' && (
              <div className="mt-2">
                <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded">
                  {node.operator === 'allOf' ? 'ALL required' : 'ONE required'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            {getStatusIcon(status, result)}
          </div>
        </div>

        {/* Confidence if completed */}
        {status === 'completed' && result && (
          <div className="mt-3 text-xs text-neutral-600 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-neutral-400" />
            {(result.confidence * 100).toFixed(0)}% confidence
          </div>
        )}
      </div>

      {/* Children (if composite, expand vertically) */}
      {node.kind === 'composite' && node.children && (
        <div className="space-y-2 pl-6 border-l-2 border-neutral-200">
          {node.children.map((childId, idx) => {
            const child = nodeMap.get(childId);
            return (
              <RequirementBlock
                key={childId}
                node={child}
                nodeMap={nodeMap}
                evaluationStates={evaluationStates}
                onNodeClick={onNodeClick}
                numberPrefix={`${numberPrefix}.${toLetterOrNumber(idx, depth + 1)}`}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper: I, II, III → A, B, C → 1, 2, 3 → a, b, c
function toLetterOrNumber(index: number, depth: number): string {
  if (depth === 1) return String.fromCharCode(65 + index); // A, B, C
  if (depth === 2) return (index + 1).toString();           // 1, 2, 3
  if (depth === 3) return String.fromCharCode(97 + index); // a, b, c
  return (index + 1).toString(); // fallback
}
```

### Status Styling Helpers

```tsx
function getStatusBorderClass(status: NodeStatus, result?: EvaluationResult): string {
  if (status === 'evaluating') {
    return 'border-blue-500 bg-blue-50';
  }
  if (status === 'completed') {
    return result?.decision
      ? 'border-green-500 bg-green-50'
      : 'border-red-500 bg-red-50';
  }
  if (status === 'error') {
    return 'border-red-600 bg-red-50';
  }
  return 'border-neutral-200'; // pending
}

function getStatusIcon(status: NodeStatus, result?: EvaluationResult): JSX.Element {
  if (status === 'evaluating') {
    return (
      <div className="w-5 h-5">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-200 border-t-blue-500" />
      </div>
    );
  }
  if (status === 'completed') {
    return (
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        result?.decision ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <span className={`text-xs font-bold ${
          result?.decision ? 'text-green-600' : 'text-red-600'
        }`}>
          {result?.decision ? '✓' : '✗'}
        </span>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-xs font-bold text-red-600">!</span>
      </div>
    );
  }
  // pending
  return (
    <div className="w-5 h-5 rounded-full border-2 border-neutral-300" />
  );
}
```

---

## Detail Panel Component

```tsx
interface DetailPanelProps {
  node: RequirementNode;
  state?: EvaluationState;
}

function DetailPanel({ node, state }: DetailPanelProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
            Selected Requirement
          </div>
          <div className="text-lg font-semibold text-neutral-900">
            {node.label}
          </div>
        </div>
        <button
          className="text-neutral-400 hover:text-neutral-900"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Question (for primitives) */}
      {node.kind === 'primitive' && node.question && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
            Question
          </div>
          <div className="text-sm text-neutral-900 leading-relaxed">
            {node.question.prompt}
          </div>
          {node.question.help && (
            <div className="mt-2 text-sm text-neutral-600 bg-neutral-50 rounded p-3">
              {node.question.help}
            </div>
          )}
        </div>
      )}

      {/* Legal Context */}
      {node.context?.items && node.context.items.length > 0 && (
        <div className="border-t border-neutral-200 pt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
            Legal Context
          </div>
          <div className="space-y-4">
            {node.context.items.map((item, idx) => (
              <div key={idx} className="pl-4 border-l-2 border-neutral-200">
                <div className="text-xs font-medium text-neutral-700 mb-1">
                  {item.label}
                </div>
                <div className="text-sm text-neutral-600 leading-relaxed">
                  {item.text}
                </div>
                {item.sources?.[0] && (
                  <div className="mt-2 text-xs font-mono text-neutral-500">
                    Art. {item.sources[0].article}
                    {item.sources[0].paragraph && `(${item.sources[0].paragraph})`}
                    {item.sources[0].point && ` pt. ${item.sources[0].point}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Result */}
      {state?.status === 'completed' && state.result && (
        <div className="border-t border-neutral-200 pt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
            Evaluation Result
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${
                state.result.decision ? 'text-green-600' : 'text-red-600'
              }`}>
                {state.result.decision ? 'YES ✓' : 'NO ✗'}
              </span>
              <span className="text-sm text-neutral-600">
                {(state.result.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <div className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-4 leading-relaxed">
              {state.result.reasoning}
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {state?.status === 'evaluating' && (
        <div className="flex items-center gap-3 text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600" />
          <span className="text-sm font-medium">Evaluating...</span>
        </div>
      )}

      {/* Error state */}
      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm font-medium text-red-900 mb-1">Error</div>
          <div className="text-sm text-red-700">{state.error}</div>
        </div>
      )}
    </div>
  );
}
```

---

## Gray-Out Logic (Skip Evaluation)

### Rule:
When a requirement fails and further evaluation is pointless, gray out descendant requirements.

### Implementation:

```tsx
function someParentFailed(
  nodeId: string,
  nodes: RequirementNode[],
  evaluationStates: EvaluationState[]
): boolean {
  // Walk up the tree to find if any parent failed
  const parents = getParentChain(nodeId, nodes);

  for (const parentId of parents) {
    const parent = nodes.find(n => n.id === parentId);
    const state = evaluationStates.find(s => s.nodeId === parentId);

    // If parent is allOf and failed → children are skipped
    if (parent?.operator === 'allOf' && state?.status === 'completed' && !state.result?.decision) {
      return true;
    }

    // If parent is anyOf and ONE child passed → other children are skipped
    if (parent?.operator === 'anyOf') {
      const siblings = parent.children || [];
      const passedSibling = siblings.find(sibId => {
        const sibState = evaluationStates.find(s => s.nodeId === sibId);
        return sibState?.status === 'completed' && sibState.result?.decision;
      });
      if (passedSibling && passedSibling !== nodeId) {
        return true; // This node is skipped because sibling already satisfied anyOf
      }
    }
  }

  return false;
}
```

---

## File Structure Changes

### New Files to Create:
```
eu-ai-act-evaluator/
├── components/
│   ├── evaluation/
│   │   ├── RequirementsGrid.tsx           (NEW - main grid)
│   │   ├── RequirementBlock.tsx           (NEW - single requirement card)
│   │   ├── DetailPanel.tsx                (NEW - bottom panel)
│   │   └── [OLD React Flow files - DELETE]
│   └── layout/
│       ├── Sidebar.tsx                    (NEW - left sidebar)
│       └── MainCanvas.tsx                 (NEW - right canvas)
├── lib/
│   └── evaluation/
│       ├── layout-utils.ts                (NEW - numbering, parent chain)
│       └── skip-logic.ts                  (NEW - gray-out logic)
└── app/
    ├── page.tsx                           (MODIFY - new structure)
    └── globals.css                        (MODIFY - add fonts)
```

### Files to Delete:
- `RequirementTree.tsx` (React Flow version)
- `FlowchartNode.tsx`
- `flowchart-layout.ts`
- Any React Flow dependencies from package.json

---

## Implementation Phases

### Phase 1: Layout Foundation (1-2 hours)
- [ ] Set up new file structure
- [ ] Implement RequirementsGrid with horizontal root layout
- [ ] Implement RequirementBlock with vertical children
- [ ] Add numbering system (I, A, 1, a)
- [ ] Test with PN-04

### Phase 2: Styling & Interaction (1 hour)
- [ ] Apply Legora design system (colors, typography, spacing)
- [ ] Add status icons and border colors
- [ ] Implement click handlers
- [ ] Add DetailPanel component
- [ ] Test interactive states

### Phase 3: Evaluation Integration (1 hour)
- [ ] Connect to existing evaluation API
- [ ] Implement gray-out logic for skipped nodes
- [ ] Add loading states and animations
- [ ] Test full evaluation flow with PN-04

### Phase 4: Polish (30 min)
- [ ] Add smooth transitions
- [ ] Refine spacing and alignment
- [ ] Add keyboard navigation (optional)
- [ ] Final testing

**Total Estimated Time:** 3-4 hours

---

## Success Criteria

✅ No React Flow dependency
✅ Clean tabular layout with horizontal root requirements
✅ Vertical expansion for sub-requirements
✅ Proper numbering (I, II, III → A, B, C → 1, 2, 3)
✅ Status colors (gray → blue → green/red)
✅ Gray-out logic for skipped requirements
✅ Legora-inspired professional aesthetic
✅ DetailPanel shows full context on selection
✅ Works with PN-04 sample data

---

## Open Questions (Answer Before Implementation)

1. ❓ **Default Expansion:** Should all requirements be expanded by default, or start collapsed with expand/collapse controls?
   - **Proposal:** Start fully expanded for simplicity (can add collapse later)

2. ❓ **Selected Node Highlight:** How to indicate which node is selected?
   - **Proposal:** Add blue border (`border-blue-500`) to selected card

3. ❓ **Detail Panel Position:** Bottom (as spec'd) or right sidebar?
   - **Proposal:** Bottom panel (more horizontal space for context)

4. ❓ **Mobile Responsive:** Still desktop-only?
   - **Proposal:** Desktop-only for now (can adapt later)

---

**Document Status:** ✅ Locked for Implementation
**Next Step:** Implement Phase 1 (Layout Foundation)
