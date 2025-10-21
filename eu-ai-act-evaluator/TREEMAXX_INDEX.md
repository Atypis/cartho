# TREEMAXX Documentation Index

## Overview
TREEMAXX is the tree visualization system for live legal requirement evaluation in the EU AI Act evaluator. This index helps navigate the comprehensive documentation.

## The Three Guides

### 1. TREEMAXX_SUMMARY.md (START HERE)
**Best for:** Quick orientation, quick reference, debugging
**Length:** 466 lines, 14 KB
**Read time:** 5-10 minutes

Key sections:
- System Architecture Overview
- The isActiveSubsumption Magic
- Key Component Props Reference
- 5-Step Live Evaluation Cycle
- Visual State Matrix (table)
- Troubleshooting Checklist
- Console logging for debugging

**Use this when:** You need a quick answer or are debugging a specific issue.

### 2. TREEMAXX_RENDERING_GUIDE.md (COMPREHENSIVE REFERENCE)
**Best for:** Deep technical understanding, implementation details
**Length:** 1000 lines, 36 KB
**Read time:** 30-45 minutes for full read, but sections can be read independently

Key sections:
1. EvaluationState Object Shape (types and lifecycle)
2. Component Hierarchy & Data Flow (parent to child relationships)
3. State Flow: How evaluationStates Propagate (detailed walkthrough)
4. RequirementsGrid Component (stats calculation, progress, auto-scroll)
5. TreeNode Component (the TREEMAXX magic with 4 auto-behaviors)
6. RequirementBlock Component (grid view alternative)
7. Skip Logic (smart evaluation optimization)
8. Backend Evaluation Engine (how results get to DB)
9. CSS Animation Classes (visual effects)
10. Complete State Update Lifecycle (full sequence diagram)
11. Visual Feedback (conditions for each state)
12. Performance Optimizations (caching, polling, skip logic)
13. Key Design Patterns (5 patterns identified)
14. Debugging & Monitoring (console logs)

**Use this when:** You need to understand how a specific part works or implement a feature.

### 3. TREEMAXX_COMPONENT_FLOW.md (VISUAL DIAGRAMS)
**Best for:** Visual learners, architecture understanding, workflow sequences
**Length:** 724 lines, 40 KB
**Read time:** 15-25 minutes

Key sections:
1. Component Hierarchy Tree (ASCII diagram)
2. Data Flow: Evaluation to Screen (complete flow diagram)
3. EvaluationState Lifecycle (state transitions)
4. TreeNode Decision Tree (logic flow when re-rendering)
5. State Update Sequence During Live Evaluation (timeline)
6. Skip Logic Visualization (allOf/anyOf examples)
7. CSS Class Application by Status (visual states)
8. Polling & Update Frequency (timeline with millisecond precision)
9. Composite Node Status Calculation
10. Error Handling & Recovery

**Use this when:** You want to understand relationships, flows, or need a visual reference.

## Quick Navigation

### I want to understand...

**How live evaluation works?**
→ TREEMAXX_SUMMARY.md → "5-Step Live Evaluation Cycle"
→ TREEMAXX_COMPONENT_FLOW.md → "State Update Sequence During Live Evaluation"
→ TREEMAXX_RENDERING_GUIDE.md → "Section 3: State Flow"

**What isActiveSubsumption is?**
→ TREEMAXX_SUMMARY.md → "The TREEMAXX Magic: isActiveSubsumption"
→ TREEMAXX_RENDERING_GUIDE.md → "Section 5: TreeNode Component"
→ TREEMAXX_COMPONENT_FLOW.md → "Section 4: TreeNode Decision Tree"

**How components connect?**
→ TREEMAXX_COMPONENT_FLOW.md → "Section 1: Component Hierarchy Tree"
→ TREEMAXX_RENDERING_GUIDE.md → "Section 2: Component Hierarchy & Data Flow"

**Why my evaluation isn't updating?**
→ TREEMAXX_SUMMARY.md → "Troubleshooting Checklist"
→ TREEMAXX_SUMMARY.md → "Console Logging for Debugging"
→ TREEMAXX_RENDERING_GUIDE.md → "Section 14: Debugging & Monitoring"

**The visual/styling for each state?**
→ TREEMAXX_SUMMARY.md → "Visual State Matrix" (table)
→ TREEMAXX_RENDERING_GUIDE.md → "Section 9: CSS Animation Classes"
→ TREEMAXX_COMPONENT_FLOW.md → "Section 7: CSS Class Application by Status"

**Skip logic?**
→ TREEMAXX_SUMMARY.md → "Skip Logic Rules"
→ TREEMAXX_RENDERING_GUIDE.md → "Section 7: Skip Logic"
→ TREEMAXX_COMPONENT_FLOW.md → "Section 6: Skip Logic Visualization"

**How polling works?**
→ TREEMAXX_RENDERING_GUIDE.md → "Section 3: State Flow"
→ TREEMAXX_COMPONENT_FLOW.md → "Section 8: Polling & Update Frequency"

**Performance optimization?**
→ TREEMAXX_RENDERING_GUIDE.md → "Section 12: Performance Optimizations"
→ TREEMAXX_SUMMARY.md → "Performance Optimizations"

## Section Cross-Reference

| Topic | Summary | Rendering Guide | Component Flow |
|-------|---------|-----------------|-----------------|
| Architecture | System overview | Sections 1-3 | Section 1 |
| isActiveSubsumption | "The Magic" | Section 5 | Section 4 |
| Component props | Props reference | Inline in sections | Section 1 |
| State lifecycle | Visual matrix | Sections 1, 10 | Section 3 |
| Auto-behaviors | useEffect hooks | Section 5 | Section 2, 4 |
| Skip logic | Rules table | Section 7 | Section 6 |
| CSS/Styling | Classes summary | Section 9 | Section 7 |
| Polling | Interval/timing | Sections 3-4 | Section 8 |
| Performance | Optimization list | Section 12 | Throughout |
| Debugging | Checklist | Section 14 | Throughout |

## Key Concepts Quick Lookup

### EvaluationState
Defined in: `/lib/evaluation/types.ts`
Explained in: 
- TREEMAXX_RENDERING_GUIDE.md Section 1
- TREEMAXX_COMPONENT_FLOW.md Section 3

```typescript
{
  nodeId: string,
  status: 'pending' | 'evaluating' | 'completed' | 'error',
  result?: { decision, confidence, reasoning, citations },
  error?: string
}
```

### The Magic Formula
```typescript
isActiveSubsumption = isEvaluating && isPrimitive
```
Explained in:
- TREEMAXX_SUMMARY.md → "The TREEMAXX Magic"
- TREEMAXX_RENDERING_GUIDE.md Section 5
- TREEMAXX_COMPONENT_FLOW.md Section 4

### 4 Auto-Behaviors
When `isActiveSubsumption === true`:
1. Auto-expand
2. Auto-show details
3. Auto-select
4. Auto-scroll

Explained in:
- TREEMAXX_RENDERING_GUIDE.md Section 5
- TREEMAXX_SUMMARY.md → "useEffect Hooks in TreeNode"

### Polling Interval
1000ms (every 1 second)

Explained in:
- TREEMAXX_COMPONENT_FLOW.md Section 8
- TREEMAXX_SUMMARY.md → "Performance Optimization"

### Skip Logic Rules
- **allOf**: If any child fails → skip remaining children
- **anyOf**: If any child passes → skip all remaining children

Explained in:
- TREEMAXX_SUMMARY.md → "Skip Logic Rules"
- TREEMAXX_RENDERING_GUIDE.md Section 7
- TREEMAXX_COMPONENT_FLOW.md Section 6

## File Locations

| Component | File | Lines |
|-----------|------|-------|
| Main tree container | `/components/evaluation/RequirementsGrid.tsx` | 437 |
| Individual card | `/components/evaluation/RequirementBlock.tsx` | 330 |
| State management | `/components/usecase/UseCaseCockpit.tsx` | 1060 |
| Types & interfaces | `/lib/evaluation/types.ts` | 111 |
| Skip logic | `/lib/evaluation/skip-logic.ts` | 78 |
| Evaluation engine | `/lib/evaluation/engine.ts` | (see docs) |
| Backend API | `/app/api/evaluate/route.ts` | (see docs) |

## Study Path Recommendations

### Path 1: New Developer (Understanding the system)
1. Start: TREEMAXX_SUMMARY.md → System Architecture Overview
2. Read: TREEMAXX_COMPONENT_FLOW.md → Component Hierarchy Tree
3. Learn: TREEMAXX_RENDERING_GUIDE.md → Section 2 (Component Hierarchy)
4. Deep dive: TREEMAXX_RENDERING_GUIDE.md → Sections 3-5 (State Flow & Components)
5. Reference: TREEMAXX_COMPONENT_FLOW.md → Section 5 (Timeline)

### Path 2: Debugging Issue
1. Start: TREEMAXX_SUMMARY.md → Troubleshooting Checklist
2. Check: Console logs mentioned in TREEMAXX_SUMMARY.md
3. If needed: TREEMAXX_RENDERING_GUIDE.md → Section 14 (Debugging)
4. Reference: TREEMAXX_COMPONENT_FLOW.md → Relevant section

### Path 3: Extending Features
1. Start: TREEMAXX_SUMMARY.md → Next Steps
2. Understand: TREEMAXX_RENDERING_GUIDE.md → Section 14 (Key Patterns)
3. Reference: TREEMAXX_RENDERING_GUIDE.md → Relevant sections
4. Implement: Use code examples from guides

### Path 4: Performance Optimization
1. Start: TREEMAXX_SUMMARY.md → "Performance Optimizations"
2. Deep dive: TREEMAXX_RENDERING_GUIDE.md → Section 12
3. Reference: TREEMAXX_COMPONENT_FLOW.md → Section 8 (Polling)

## Quick Reference Tables

### Visual State Matrix
See: TREEMAXX_SUMMARY.md → "Visual State Matrix"
Also in: TREEMAXX_COMPONENT_FLOW.md → "Section 7: CSS Class Application by Status"

### Component Props
See: TREEMAXX_SUMMARY.md → "Key Component Props"
Also in: TREEMAXX_RENDERING_GUIDE.md → "Section 4"

### useEffect Hooks
See: TREEMAXX_SUMMARY.md → "useEffect Hooks in TreeNode"
Also in: TREEMAXX_RENDERING_GUIDE.md → "Section 5: TreeNode Component"

## Related Source Files

These files implement the concepts in these documents:

- `/components/evaluation/RequirementsGrid.tsx` - Main component + TreeNode recursive
- `/components/evaluation/RequirementBlock.tsx` - Grid view alternative
- `/components/usecase/UseCaseCockpit.tsx` - State management & polling
- `/lib/evaluation/types.ts` - Type definitions
- `/lib/evaluation/skip-logic.ts` - Skip logic implementation
- `/lib/evaluation/engine.ts` - Backend evaluation engine
- `/app/api/evaluate/route.ts` - API route

## How to Keep These Docs Updated

When making changes to TREEMAXX:

1. **Component prop changes?**
   → Update "Key Component Props" in TREEMAXX_SUMMARY.md

2. **Polling interval changed?**
   → Update timing in all three docs (search for "1000ms")

3. **New auto-behavior added?**
   → Update "4 Auto-Behaviors" in all three docs

4. **CSS classes changed?**
   → Update "CSS Classes by Status" in TREEMAXX_SUMMARY.md
   → Update Section 9 in TREEMAXX_RENDERING_GUIDE.md
   → Update Section 7 in TREEMAXX_COMPONENT_FLOW.md

5. **New component added?**
   → Update "Component Hierarchy" in TREEMAXX_COMPONENT_FLOW.md
   → Update "Section 2" in TREEMAXX_RENDERING_GUIDE.md

6. **Performance optimization?**
   → Update "Performance Optimizations" in TREEMAXX_SUMMARY.md
   → Update "Section 12" in TREEMAXX_RENDERING_GUIDE.md

---

Generated: October 21, 2025
Analyzed files:
- RequirementsGrid.tsx
- RequirementBlock.tsx
- UseCaseCockpit.tsx
- types.ts
- skip-logic.ts
- evaluate/route.ts
