# UseCaseCockpit Integration - Complete Documentation Index

## Overview

This documentation set provides an exhaustive technical analysis of how the UseCaseCockpit component integrates with the EU AI Act evaluation system. It maps data flows, state management, polling strategies, and identifies current issues and optimization opportunities.

**Total Documentation:** 1,168 lines across 2 comprehensive files

---

## Document Files

### 1. USECASE_COCKPIT_INTEGRATION_ANALYSIS.md (722 lines)

**Primary technical reference** - Complete architectural analysis

#### Sections:

1. **Component Architecture & State Management** (Lines 1-60)
   - State variables overview
   - State lifecycle diagram
   - Initial load sequence
   - Evaluation trigger flow

2. **Detailed Function Analysis** (Lines 62-260)
   
   - **runInlineEvaluation()** [Lines 444-533 in source]
     - Purpose: Trigger inline evaluation (stay on cockpit)
     - 9-step flow with timing
     - Key insight: Returns immediately while API processes async
   
   - **startPollingEvaluation()** [Lines 351-441 in source]
     - Purpose: Poll for progress and detect completion
     - Polling interval: 1000ms
     - Bundle caching strategy to avoid N+1 fetches
     - Critical insight: Total primitives recalculated each poll
   
   - **loadExpandedPNData()** [Lines 596-662 in source]
     - Purpose: Load full tree data for expanded view
     - Process: Fetch results → Expand tree → Create states
     - CRITICAL ISSUE: Never marks nodes as 'evaluating'
   
   - **startLiveUpdates()** [Lines 665-686 in source]
     - Purpose: Continuously reload data while evaluating
     - Polling interval: 1000ms
     - Handoff mechanism from main polling

3. **Data Loading Flow** (Lines 262-355)
   - Database schema for evaluations & results
   - Multiple sources of truth (4 sources identified)
   - Complete data fetching sequence
   - PN status determination algorithm
   - Three categories: running, completed, unevaluated

4. **Live Update Mechanism** (Lines 357-415)
   - Three update triggers:
     1. Real-time Supabase subscription
     2. Polling completion
     3. Live updates for expanded PN
   - Bundle caching strategy with impact metrics
     * First poll: 200-500ms (bundle fetch)
     * Subsequent: 50-100ms (in-memory)

5. **Current Issues & Root Causes** (Lines 417-465)
   - **Issue 1:** "completed: 0" in tree when results exist
     * Root cause: Only 'completed'/'pending' states created
     * Impact: No visual feedback while evaluating
   - **Issue 2:** Node ID mismatch (potential)
     * Problem: Shared requirement expansion differs between API/UI
     * Mitigation: deterministic expansion function
   - **Issue 3:** Missing 'evaluating' status
     * Where created/missing in various functions
     * Consequences for UI feedback

6. **Complete User Flow Sequence** (Lines 467-580)
   - Time-annotated diagram from click to tree rendering
   - 12 major steps documented
   - Shows: Database updates, polling loop, API processing, UI rendering
   - Timing annotations: t=0, t=0.1, t=1.0, t=1.5, ... t=12.5

7. **State Synchronization & Polling Strategy** (Lines 582-650)
   - Polling interval summary
   - Debouncing & throttling analysis
   - Three major conflict scenarios:
     1. Polling + Real-time subscription race
     2. Client cache vs DB divergence
     3. Shared requirement expansion differences

8. **Auto-Scroll Behavior** (Lines 652-685)
   - RequirementsGrid auto-scroll (summary card)
     * Triggers: evaluation complete + all nodes have results
     * Smooth scroll to start position
     * Expands summary automatically
   - TreeNode auto-scroll (current node)
     * Triggers: only during active subsumption
     * Scrolls to center of viewport
     * For primitive nodes being evaluated

9. **Summary & Takeaways** (Lines 687-722)
   - Architecture strengths (5 listed)
   - Current limitations (5 listed)
   - Recommended optimizations (5 listed)
   - File structure reference with line numbers

---

### 2. USECASE_COCKPIT_SEQUENCE_DIAGRAMS.md (446 lines)

**Visual reference** - 10 Mermaid sequence/state diagrams

#### Diagrams:

1. **Complete Evaluation Flow (User Perspective)** - Lines 1-60
   - 13-step sequence from click to tree rendering
   - Shows: Cockpit → DB → API → Engine → GPT-5 → Back
   - Highlights: async nature, bundling, polling detection

2. **Polling Loop Detail** - Lines 62-90
   - Zoom into the 1-second polling mechanism
   - Shows: Status check → Result count → Bundle cache logic
   - Loop condition & exit criteria

3. **Live Expansion & Tree Update** - Lines 92-130
   - Sequence from user expanding PN to tree rendering
   - Intermediate step: loadExpandedPNData()
   - Loop: startLiveUpdates() for live polling during expansion

4. **Result State Transitions** - Lines 132-155
   - State machine for individual node evaluation
   - States: Pending → Evaluating → Completed
   - Error handling path
   - ISSUE highlighted: Jump from pending to completed (no evaluating shown)

5. **Data Flow Architecture** - Lines 157-195
   - Graph showing all subsystems:
     * UI Components (Cockpit, RequirementsGrid, TreeNode)
     * Client State (pnStatuses, evaluationProgress, etc)
     * Backend (DB, API, Engine, GPT-5)
     * Cache
   - All connections and data flows shown

6. **State Machine - Evaluation Lifecycle** - Lines 197-220
   - 11-step flow: Create → Poll → Trigger → Process → Write → Loop → Complete → Reload → Display
   - Timing: Each step labeled
   - Key highlight: E and F (API processing + DB writes) happen concurrently

7. **Bundle Caching Strategy** - Lines 222-250
   - Shows caching isolation per evaluation instance
   - Important note: Each evaluation has its OWN bundleCache
   - Not shared between instances
   - Explains why first poll is slower (~300ms vs ~50ms)

8. **Node Status Flow (Single Primitive)** - Lines 252-270
   - State transitions: Pending → Evaluating → Completed
   - Or: Evaluating → Error → Pending (for retry)
   - ISSUE callout: No 'evaluating' status shown in tree view

9. **Multi-Source Truth Resolution** - Lines 272-310
   - Four data sources illustrated:
     1. evaluations.status (DB)
     2. evaluation_results (DB)
     3. pnStatuses (Client)
     4. Real-time subscription
   - Who reads what / who writes what
   - Conflict resolution flow

10. **Error Scenarios** - Lines 312-340
    - Four error paths illustrated:
      1. API success path (green)
      2. Node error → Mark 'error' → Continue
      3. Network error → Mark 'failed' → Stop polling
      4. Polling timeout → Manual abort
    - Shows recovery mechanisms

---

## Quick Reference Guide

### Function Locations in Source Code

| Function | File | Lines | Purpose |
|----------|------|-------|---------|
| `runInlineEvaluation()` | UseCaseCockpit.tsx | 444-533 | Trigger inline evaluation |
| `startPollingEvaluation()` | UseCaseCockpit.tsx | 351-441 | Poll for progress |
| `loadExpandedPNData()` | UseCaseCockpit.tsx | 596-662 | Load tree with results |
| `startLiveUpdates()` | UseCaseCockpit.tsx | 665-686 | Live polling for expanded PN |
| `buildPNStatusMapOptimized()` | UseCaseCockpit.tsx | 171-303 | Build PN status catalog |
| `TreeNode()` | RequirementsGrid.tsx | 439-777 | Interactive tree node |
| `POST /api/evaluate` | app/api/evaluate/route.ts | 25-236 | Evaluation API |
| `GET /api/prescriptive/bundle` | app/api/prescriptive/bundle/route.ts | 34-99 | Bundle loader |
| `EvaluationEngine.evaluate()` | lib/evaluation/engine.ts | 252-272 | Tree evaluation |
| `expandSharedRequirements()` | lib/evaluation/expand-shared.ts | 14-92 | Shared requirement expansion |

### Key Polling Intervals

```
startPollingEvaluation():  1000ms
startLiveUpdates():        1000ms
Stale data window:         < 1000ms
First bundle fetch:        200-500ms
Subsequent polls:          50-100ms
```

### Database Tables

```
evaluations {
  id, use_case_id, pn_ids, status, triggered_at, completed_at
}

evaluation_results {
  id, evaluation_id, node_id, decision, confidence, reasoning, citations
}
```

### State Variables

```typescript
runningEvaluations: Set<string>
evaluationProgress: Map<string, {current, total}>
pnStatuses: PNStatus[]
expandedPNId: string | null
expandedPNData: {evaluation, nodes, rootId, evaluationStates}
evaluationBundles: Map<string, any>
```

---

## Known Issues Summary

### Issue 1: No 'Evaluating' Status in Tree View

**Location:** `loadExpandedPNData()` lines 627-652
**Severity:** Medium
**Impact:** Users see "pending" during evaluation, no progress feedback
**Fix:** Detect current node from engine state

### Issue 2: Polling Lag (1 second)

**Location:** `startPollingEvaluation()` line 437
**Severity:** Low
**Impact:** UI updates every 1 second (not real-time)
**Fix:** Use SSE/WebSocket streaming

### Issue 3: Multiple Reloads Per Poll

**Location:** `loadUseCaseAndEvaluations()` called every poll
**Severity:** Low
**Impact:** Unnecessary computation
**Fix:** Debounce or compute delta

---

## Architecture Patterns

### 1. Async Evaluation Pattern

```
UI Action
  ↓
Create DB record
  ↓ (returns immediately)
Start polling
  ↓
Fire API request (async)
  ↓ (don't await)
Meanwhile: API evaluates + writes DB
Meanwhile: Polling detects + updates UI
  ↓
Polling detects completion
  ↓
Reload UI with final results
```

### 2. Bundle Caching Pattern

```
First poll:
  bundleCache = null
  Fetch from /api/prescriptive/bundle
  Cache locally (200-500ms)

Subsequent polls:
  bundleCache exists
  Use cached value (50-100ms)
  Calculate primitives from cache
```

### 3. Three-Level Polling Pattern

```
Level 1: startPollingEvaluation()
  └─ Polls: evaluations.status + results.count
  └─ Updates: evaluationProgress
  └─ Used for: Overall progress bar

Level 2: startLiveUpdates()
  └─ Polls: loadExpandedPNData() every 1s
  └─ Updates: expandedPNData
  └─ Used for: Tree node details

Real-time: Supabase subscription
  └─ Listens: evaluations table changes
  └─ Triggers: loadUseCaseAndEvaluations()
  └─ Fallback: Catches missed polls
```

---

## Integration Points

### With RequirementsGrid (Tree View)

```
Input:
  - nodes: RequirementNode[]
  - evaluationStates: EvaluationState[]
  - isRunning: boolean
  - totalNodes: number

Output:
  - Renders tree with node colors
  - Shows progress bar
  - Auto-scrolls on completion
  - Renders summary card
```

### With API `/api/evaluate`

```
Request:
  {
    evaluationId,
    prescriptiveNorm,
    sharedPrimitives,
    caseInput
  }

Response: SSE stream
  data: {type: 'progress', states}
  data: {type: 'complete', result}
  data: {type: 'error', error}

Side effects:
  - INSERT evaluation_results (DB)
  - UPDATE evaluations (DB)
```

### With Supabase

```
Subscriptions:
  channel: `usecase_cockpit_${useCaseId}`
  table: evaluations
  filter: use_case_id=eq.${useCaseId}
  events: INSERT, UPDATE, DELETE

Queries:
  SELECT evaluations
  SELECT evaluation_results
  INSERT/UPDATE evaluations
  INSERT evaluation_results
```

---

## Recommendations for Further Optimization

### High Priority

1. **Add 'evaluating' status to tree view**
   - Modify `loadExpandedPNData()` to detect current node
   - Show spinner for nodes being evaluated
   - Better UX feedback

2. **Implement result streaming**
   - Use SSE or WebSocket from API
   - Push results to UI as they complete
   - Eliminate polling delay

### Medium Priority

3. **Debounce state reloads**
   - Batch multiple poll updates
   - Reduce computation overhead
   - Cache pnStatuses between polls

4. **Optimize bundle loading**
   - Share bundle cache across evaluations of same PN
   - Pre-fetch common bundles
   - Cache in localStorage for persistence

### Low Priority

5. **Add error recovery**
   - Retry failed node evaluations
   - Exponential backoff for GPT-5 calls
   - Better error messages

---

## Testing Checklist

- [ ] Evaluation completes successfully (all nodes complete)
- [ ] Progress bar updates as results arrive
- [ ] Tree expands with correct node colors
- [ ] Auto-scroll to summary after completion
- [ ] Multiple concurrent evaluations work correctly
- [ ] Real-time subscription triggers reload
- [ ] Bundle cache prevents duplicate fetches
- [ ] Polling stops when evaluation completes
- [ ] Error handling gracefully degrades
- [ ] Node IDs match between API and UI (after expansion)

---

## File Locations

All relevant source files:

```
Component
  /components/usecase/UseCaseCockpit.tsx
  /components/evaluation/RequirementsGrid.tsx
  /components/evaluation/RequirementBlock.tsx

API Routes
  /app/api/evaluate/route.ts
  /app/api/prescriptive/bundle/route.ts
  /app/api/catalog/route.ts

Engine
  /lib/evaluation/engine.ts
  /lib/evaluation/expand-shared.ts
  /lib/evaluation/types.ts
  /lib/evaluation/layout-utils.ts

Database
  /lib/supabase/types.ts
  /lib/supabase/client.ts
```

---

## Document History

- **Created:** October 21, 2025
- **Analysis Depth:** Very thorough (as requested)
- **Coverage:** All 4 mission objectives fully addressed
- **Code Review:** Complete walkthrough of all key functions
- **Diagrams:** 10 comprehensive sequence/state diagrams

---

## How to Use This Documentation

### For Understanding the System
1. Start with **Data Flow Architecture** diagram
2. Read **Component Architecture & State Management** section
3. Study **Complete User Flow Sequence** diagram

### For Debugging Issues
1. Find function in **Function Locations** table
2. Read detailed analysis in **Detailed Function Analysis** section
3. Check **Known Issues Summary**
4. Review relevant diagram in **Sequence Diagrams** file

### For Optimization
1. Read **Architecture Patterns** section
2. Review **Recommendations for Further Optimization**
3. Check **Testing Checklist** before implementing

### For Integration Work
1. Study **Integration Points** section
2. Review relevant API/component in source files
3. Check function signatures in **Detailed Function Analysis**

---

## End of Index

Total lines of documentation: 1,168
Total pages (estimated): ~20 pages
Diagrams: 10
Functions analyzed: 10
Issues identified: 3
Recommendations: 5

For complete technical details, see:
- USECASE_COCKPIT_INTEGRATION_ANALYSIS.md (main reference)
- USECASE_COCKPIT_SEQUENCE_DIAGRAMS.md (visual reference)

