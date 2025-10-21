# UseCaseCockpit Integration Analysis - Complete Technical Documentation

## Executive Summary

The UseCaseCockpit component orchestrates a sophisticated multi-level evaluation system with live polling, real-time state synchronization, and progressive UI updates. It integrates three key subsystems:
1. **API Layer** - Evaluation engine & PN bundle loading
2. **Database Layer** - Supabase real-time subscription & result caching
3. **UI Layer** - Requirements tree view with live progress tracking

---

## 1. Component Architecture & State Management

### State Variables

```typescript
// Running evaluations tracking
runningEvaluations: Set<string>           // Set of active evaluation IDs
evaluationProgress: Map<string, {current, total}>  // Progress per evaluation
evaluationBundles: Map<string, any>       // Cached PN bundles to avoid refetches

// Expanded view state (inline TREEMAXX)
expandedPNId: string | null               // Currently expanded PN for tree view
expandedPNData: {
  evaluation,
  nodes,
  rootId,
  evaluationStates
}

// PN status catalog
pnStatuses: PNStatus[]                    // Current status of all PNs
// PNStatus = {
//   pnId, article, title,
//   status: 'applies'|'not-applicable'|'pending'|'evaluating',
//   evaluationId, evaluatedAt, rootDecision,
//   progressCurrent, progressTotal
// }
```

### State Lifecycle

```
Initial Load:
  1. Load PN catalog via /api/catalog
  2. Load use case data from Supabase
  3. Load all evaluations for the use case
  4. Build pnStatuses map (mark all as 'pending')
  
On Evaluation Trigger:
  1. Create evaluation record in DB (status='pending')
  2. Mark PNs as 'evaluating' in pnStatuses
  3. Start polling for results
  4. API evaluates and writes to DB
  5. Poll fetches results and updates progress
  6. Mark complete & reload UI
```

---

## 2. Detailed Function Analysis

### 2.1 runInlineEvaluation() [Lines 444-533]

**Purpose:** Trigger evaluation inline (stay on cockpit) instead of navigating to evaluation view

**Flow:**
```
1. setTriggering(true)
2. Create evaluation record: INSERT INTO evaluations
   - status='pending'
   - pn_ids=selectedPNs
   - use_case_id=useCaseId
3. Add to runningEvaluations set
4. Update DB status to 'running'
5. START POLLING (line 476)
6. Load PN bundle via /api/prescriptive/bundle
7. FOR EACH PN:
   - Call /api/evaluate (fire-and-forget, no await)
   - API will stream results AND write to DB
8. Call loadUseCaseAndEvaluations() to reload UI
9. setTriggering(false)
```

**Key Points:**
- Creates evaluation record FIRST (gets ID)
- Polling starts BEFORE API call (catches initial results)
- API calls are not awaited (background processing)
- Results written to DB by API endpoint
- loadUseCaseAndEvaluations() called to show "evaluating" status immediately

### 2.2 startPollingEvaluation() [Lines 351-441]

**Purpose:** Poll for progress and detect completion

**Polling Interval:** 1000ms (1 second)

**Each Poll:**
```
1. Fetch evaluation metadata from DB
   SELECT * FROM evaluations WHERE id=evaluationId
2. Fetch evaluation results count
   SELECT node_id FROM evaluation_results WHERE evaluation_id=evaluationId
3. Load PN bundle ONCE and CACHE
   - Avoids 100+ refetches during evaluation
   - Bundle cached in local variable `bundleCache`
4. COUNT PRIMITIVES = expandSharedRequirements().filter(n => n.kind='primitive')
5. Update evaluationProgress Map
   - current = results.length
   - total = primitive count
6. IF evaluation.status = 'completed' OR 'failed':
   - clearInterval(pollInterval)
   - Remove from runningEvaluations
   - Call loadUseCaseAndEvaluations() to reload
```

**Critical Insight:**
The total primitive count is recalculated on each poll because:
- Shared requirements are expanded AFTER fetching
- expandSharedRequirements() modifies node IDs
- Total changes when shared predicates are resolved

### 2.3 loadExpandedPNData() [Lines 596-662]

**Purpose:** Load full tree data for expanded PN view with evaluation states

**Process:**
```
1. Fetch evaluation metadata
2. Fetch ALL evaluation_results for this evaluation
   SELECT * FROM evaluation_results WHERE evaluation_id=evaluationId
3. Load PN bundle (single PN)
4. Expand shared requirements
5. Create evaluationStates:
   - For each result: status='completed'
   - For nodes without results: status='pending'
6. Set expandedPNData = {
     evaluation,
     nodes,
     rootId,
     evaluationStates
   }
```

**State Construction (Lines 627-652):**
```typescript
// Map results to completed states
const evaluationStates = (results || []).map(result => ({
  nodeId: result.node_id,
  status: 'completed',
  result: {
    nodeId: result.node_id,
    decision: result.decision,
    confidence: result.confidence,
    reasoning: result.reasoning,
    citations: result.citations
  }
}));

// Mark nodes without results as pending
const resultNodeIds = new Set(results.map(r => r.node_id));
for (const node of primitiveNodes) {
  if (!resultNodeIds.has(node.id)) {
    evaluationStates.push({
      nodeId: node.id,
      status: 'pending'
    });
  }
}
```

**CRITICAL ISSUE:** Nodes are never marked as 'evaluating' in this function
- Only 'completed' or 'pending' states
- No 'evaluating' status during polling

### 2.4 startLiveUpdates() [Lines 665-686]

**Purpose:** Continuously reload expanded data while evaluation is running

**Polling Interval:** 1000ms

**Each Poll:**
```
1. Check if still expanded: if (expandedPNId !== pnId) STOP
2. Check if still evaluating: if (pnStatus.status !== 'evaluating') STOP
3. Call loadExpandedPNData(pnId, evaluationId)
   - Fetches latest results
   - Rebuilds evaluationStates
```

**Handoff from startPollingEvaluation:**
```
startPollingEvaluation: Polls evaluation metadata + result count
  ↓ (when user expands PN)
startLiveUpdates: Polls actual result details
  ↓ (feeds into RequirementsGrid for tree updates)
```

---

## 3. Data Loading Flow - The Complete Picture

### Database Schema

```sql
-- Evaluation record
evaluations {
  id: string (UUID)
  use_case_id: string
  pn_ids: string[] (JSON array)
  status: 'pending'|'running'|'completed'|'failed'
  triggered_at: timestamp
  completed_at: timestamp | null
}

-- Individual node results
evaluation_results {
  id: string (UUID)
  evaluation_id: string (FK → evaluations)
  node_id: string (ID from requirement tree)
  decision: boolean
  confidence: number [0,1]
  reasoning: string
  citations: JSONB[]
  created_at: timestamp
}
```

### State Sources (Multiple Sources of Truth!)

```
Source 1: evaluations table (metadata)
  - Current status: pending/running/completed/failed
  - Used by: startPollingEvaluation()

Source 2: evaluation_results table (actual results)
  - Node decisions & reasoning
  - Used by: loadExpandedPNData()

Source 3: Client-side state (pnStatuses)
  - Cached PN status (pending/evaluating/applies/not-applicable)
  - Used by: UI rendering
  - Updates FROM: buildPNStatusMapOptimized()

Source 4: Live subscription (real-time DB changes)
  - Triggers reload of evaluations
  - Used by: Real-time UI updates
```

### Data Fetching Sequence

```
User clicks "Evaluate" on cockpit
  ↓
runInlineEvaluation(pnIds)
  ├─ INSERT evaluation (gets ID)
  ├─ UPDATE status='running'
  ├─ START startPollingEvaluation(id) ← Polling begins
  ├─ FETCH /api/prescriptive/bundle (load PN data)
  └─ POST /api/evaluate (fire-and-forget)
       └─ (runs in background)
          ├─ EvaluationEngine traverses tree
          ├─ For each primitive: call GPT-5
          ├─ Insert results to evaluation_results table
          ├─ Stream progress updates
          └─ Mark evaluation as 'completed'

Meanwhile... polling is happening:
startPollingEvaluation loop (every 1s):
  1. SELECT * FROM evaluations WHERE id=...
  2. SELECT node_id FROM evaluation_results WHERE evaluation_id=...
  3. Compare: results.length vs totalPrimitives
  4. Update evaluationProgress state
  5. UI re-renders progress bar
  6. When status='completed', STOP polling + reload UI
```

### PN Status Determination (buildPNStatusMapOptimized)

**Three categories of evaluations:**

```typescript
// 1. RUNNING evaluations
for (const eval of evaluations.filter(e => e.status === 'running')) {
  for (const pnId of eval.pn_ids) {
    // Mark PN as 'evaluating'
    statusMap.set(pnId, { status: 'evaluating', evaluationId: eval.id })
  }
}

// 2. COMPLETED evaluations
for (const eval of completedEvaluations) {
  // Load results from DB
  const results = SELECT * FROM evaluation_results WHERE evaluation_id=...
  
  // Expand PN to get nodes
  const bundle = FETCH /api/prescriptive/bundle
  const expandedNodes = expandSharedRequirements(...)
  
  // Find ROOT result (determines applicability)
  const rootResult = results.find(r => r.node_id === rootId)
  
  if (rootResult) {
    const decision = rootResult.decision
    statusMap.set(pnId, {
      status: decision ? 'applies' : 'not-applicable',
      rootDecision: decision,
      progressCurrent: completedCount,
      progressTotal: primitiveCount
    })
  }
}

// 3. UNEVALUATED PNs
for (const pn of availablePNs) {
  if (!statusMap.has(pn.id)) {
    statusMap.set(pn.id, { status: 'pending' })
  }
}
```

---

## 4. Live Update Mechanism & Event Driven Updates

### Update Triggers

```
Trigger 1: Real-time Supabase subscription (Line 112)
  supabase
    .channel(`usecase_cockpit_${useCaseId}`)
    .on('postgres_changes', {
      event: '*',
      table: 'evaluations',
      filter: `use_case_id=eq.${useCaseId}`
    }, () => {
      loadUseCaseAndEvaluations()  ← Reloads everything
    })

Trigger 2: Polling completion (Line 417-432)
  if (evaluation.status === 'completed') {
    clearInterval(pollInterval)
    loadUseCaseAndEvaluations()
  }

Trigger 3: Live updates for expanded PN (Line 682)
  await loadExpandedPNData(pnId, evaluationId)
```

### Bundle Caching Strategy

```typescript
// In startPollingEvaluation() - Line 355-387
let bundleCache: null | Bundle = null

pollInterval = setInterval(async () => {
  if (!bundleCache) {
    // Load ONCE on first poll
    bundleCache = await fetch('/api/prescriptive/bundle?pnIds=...')
    console.log('Cached bundle for evaluation')
  }
  
  // Reuse on subsequent polls
  if (bundleCache) {
    // Use to calculate totalPrimitives
  }
}, 1000)
```

**Impact:** 
- First poll: ~200-500ms (bundle fetch)
- Subsequent polls: ~50-100ms (in-memory calculation)

---

## 5. Current Issues & Root Causes

### Issue 1: "completed: 0" in Tree When Results Exist

**Root Cause:** `loadExpandedPNData()` only creates 'completed' and 'pending' states

```typescript
// Line 627 - only two states created
const evaluationStates = [
  ...completedResults.map(r => ({ status: 'completed', ... })),
  ...nodesWithoutResults.map(n => ({ status: 'pending' }))
]
// NO states with status: 'evaluating'
```

**Why it matters:**
- RequirementsGrid counts: `completed = evaluationStates.filter(s => s.status === 'completed').length`
- If a node is still evaluating, it won't have a result yet
- So it's marked 'pending', not 'evaluating'
- Progress bar doesn't show accurate progress during live evaluation

**Fix:** Check engine state or pass current node ID being evaluated

### Issue 2: Node ID Mismatch (Potential)

**Problem Area:** Shared requirement expansion

```
Original node ID: "REQ-004"  (references shared: "qp:is_provider")
After expansion:  "REQ-004-expanded.qp-is_provider.1"
```

**Reconciliation happens in:**
1. API writes results with expanded node IDs
2. loadExpandedPNData() expands again locally
3. If expansion differs, results won't match

**Mitigation:** expandSharedRequirements() is deterministic
- Same input → same output
- Called from: API (evaluate/route.ts) + UI (cockpit)

### Issue 3: Missing "evaluating" Status

**Where created:**
- buildPNStatusMapOptimized(): Creates 'evaluating' for running evals ✓
- loadExpandedPNData(): Does NOT create 'evaluating' ✗
- Polling doesn't update node status during evaluation

**Consequence:** 
- UI shows "pending" during evaluation
- No visual feedback while computing
- Only shows "completed" after DB write

---

## 6. Sequence Diagram: Complete User Flow

```
FLOW: User clicks "Evaluate PN-04" from cockpit
===============================================

Time  Browser          Cockpit             Supabase         /api/evaluate      Engine
────  ──────────────   ──────────────      ────────────     ──────────────     ────────
  0   
      │ click           │
      ├─────────────────→ runInlineEvaluation(['PN-04'])
      │                 │
      │                 │ 1. CREATE EVAL
      │                 ├────────INSERT───────→ id='eval-123', status='pending'
      │                 │                     
      │                 ├─────UPDATE─────────→ status='running'
      │                 │
      │                 │ 2. START POLLING (every 1s)
      │                 │
      │                 │ 3. LOAD BUNDLE
      │                 ├──────GET /api/prescriptive/bundle────→ Load PN data
      │
  0.1 │                 │                                         PN bundle cached
      │
      │                 │ 4. TRIGGER EVALUATION (fire & forget)
      │                 ├─────────────POST /api/evaluate─────────────→
      │                 │     evaluationId='eval-123'            
      │                 │     prescriptiveNorm={...}
      │                 │     caseInput=useCase.description
      │                 │
      │                 │ (function returns here - no await)
      │                 │
      │                 │ Meanwhile in API:
      │                 │                     ├─ Expand tree
      │                 │                     ├─ Count primitives
      │                 │                     │
      │                 │                     └─ FOR EACH PRIM:
      │                 │                        ├─ Build prompt
      │                 │                        ├─────────────────────→ Call GPT-5
      │                 │                        │                     │
  1.0 │                 │ POLL #1               │                     │← "YES, 0.85"
      │                 ├──────SELECT───────────→ Count=0
      │                 ├──────SELECT results──→ 0 results
      │                 │ Progress: 0/12        │
      │                 │                        ├─ INSERT result
      │                 │                        ├────INSERT──────────→ save result 1
      │                 │
  1.5 │                 │                        ├─ Call GPT-5 #2
      │                 │                        │                     │
      │                 │                        │                     │← "NO, 0.72"
      │                 │                        ├─ INSERT result 2
      │                 │                        ├────INSERT──────────→ save result 2
      │
  2.0 │                 │ POLL #2               │
      │                 ├──────SELECT───────────→ Status='running'
      │                 ├──────SELECT results──→ 2 results
      │                 │ Progress: 2/12        │
      │                 │ UPDATE evaluationProgress state
      │                 │                        ├─ Call GPT-5 #3
      │                 │                        │                     │
      │                 │                        │                     │← "YES, 0.91"
      │                 │                        ├─ INSERT result 3
      │
  3.0 │                 │ POLL #3               │
      │                 ├──────SELECT───────────→ Status='running'
      │                 ├──────SELECT results──→ 3 results
      │                 │ Progress: 3/12        │ (continues evaluating...)
      │
  ... │                 │ ...                   │
      │                 │ (polling continues)   │
      │
 12.0 │                 │ POLL #12              │
      │                 ├──────SELECT───────────→ Status='completed'
      │                 ├──────SELECT results──→ 12 results
      │                 │ Progress: 12/12       │
      │                 │ STOP POLLING          │
      │                 ├────clearInterval()    │
      │                 │                        │
      │                 │ 5. RELOAD UI
      │                 ├──────SELECT────────────────→ All evaluations
      │                 ├──────SELECT────────────────→ All results
      │                 ├──buildPNStatusMapOptimized()
      │                 │    Find root result
      │                 │    rootDecision = true
      │                 │    Mark PN as 'applies'
      │                 │
      │                 └─→ setPNStatuses([...])
      │                    
      │←────────────────── UI Updated!
      │ PN moved to "APPLIES" section (green)
      │
 12.5 │
      │ Click expand arrow
      ├─────────────────→ handleExpandPN('PN-04')
      │                 │
      │                 │ 6. LOAD TREE
      │                 ├──────SELECT results──────→ All 12 with details
      │                 │
      │                 ├─ buildExpandedTree()
      │                 ├─ evaluationStates = [
      │                 │    { nodeId, status:'completed', result: {...} },
      │                 │    ...
      │                 │  ]
      │
      │←────────────────── RequirementsGrid rendered
      │ Shows tree with:
      │  • Checkmarks/X marks on each node
      │  • Confidence % badges
      │  • Reasoning on hover
```

---

## 7. State Synchronization & Polling Strategy

### Polling Intervals

```
startPollingEvaluation():  Every 1000ms
  └─ Checks: evaluations.status + evaluation_results.count
  └─ Updates: evaluationProgress Map
  └─ Stops when: status === 'completed'

startLiveUpdates():        Every 1000ms
  └─ Checks: evaluationStates + node results
  └─ Calls: loadExpandedPNData()
  └─ Stops when: PN collapsed or evaluation complete
```

### Debouncing & Throttling

```
Bundle caching:
  ✓ Cached after first fetch
  ✓ Reused in polling loop
  ✓ Prevents N+1 fetches

Real-time subscription:
  ✓ Triggers on evaluations table change
  ✓ Calls loadUseCaseAndEvaluations()
  ✓ Potential race with polling

No debouncing on:
  ✗ loadUseCaseAndEvaluations() - called every poll
  ✗ buildPNStatusMapOptimized() - called every poll
  ✗ Result queries - no batching
```

### Multiple Sources of Truth Conflicts

```
Conflict 1: Polling + Real-time subscription
Problem:
  • Polling calls loadUseCaseAndEvaluations() every 1s
  • Real-time subscription also calls it
  • Both query DB independently
  
Solution: Not explicitly handled
  • Both fetch fresh data (no race condition risk)
  • State is read-only aggregate (no write conflicts)
  • If divergent, polling updates take precedence (more frequent)

Conflict 2: Client cache vs DB
Problem:
  • pnStatuses cached in state
  • DB updates asynchronously
  • UI shows stale data briefly
  
Solution: Polling refreshes every 1s
  • Stale data window: <1000ms
  • User sees updates within 1s

Conflict 3: Shared requirement expansion
Problem:
  • Expansion happens in API (during evaluation)
  • Expansion happens in UI (during display)
  • IDs might diverge if logic differs
  
Solution: expandSharedRequirements() is deterministic
  • Same code in both places
  • Same logic = same IDs
  • No divergence risk (except if code changes)
```

---

## 8. Auto-Scroll Behavior

### RequirementsGrid Auto-Scroll (Line 56-66)

```typescript
useEffect(() => {
  if (isEvaluationFinishedForHook && summaryCardRef.current) {
    summaryCardRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
    setSummaryExpanded(true)
  }
}, [isEvaluationFinishedForHook])
```

**Triggers when:**
- Evaluation complete (status === 'completed')
- All primitive nodes have results
- NOT while running

### TreeNode Auto-Scroll (Line 494-501)

```typescript
useEffect(() => {
  if (isActiveSubsumption && nodeRef.current) {
    nodeRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }
}, [isActiveSubsumption])
```

**Triggers when:**
- Node is being evaluated (status === 'evaluating')
- Node is primitive (actual LLM call, not composite)
- Scrolls to center of viewport

---

## 9. Summary: Key Takeaways

### Architecture Strengths
1. **Decoupled polling** - Evaluation runs async, UI polls independently
2. **Bundle caching** - Prevents N+1 API calls during polling
3. **Deterministic expansion** - Shared requirements predictable
4. **Real-time subscription** - Fallback for missed polls
5. **Inline expansion** - Tree view with live progress

### Current Limitations
1. **No 'evaluating' status in tree** - Only shows 'pending' until DB write
2. **1-second polling lag** - Not real-time (but sufficient for UX)
3. **No result streaming to UI** - Must wait for DB write then poll
4. **Multiple reloads per poll** - buildPNStatusMapOptimized() heavy
5. **No optimistic updates** - UI lags behind evaluation progress

### Recommended Optimizations
1. Stream results from API → client (WebSocket or SSE)
2. Create 'evaluating' states in loadExpandedPNData()
3. Debounce loadUseCaseAndEvaluations() calls
4. Cache pnStatuses between polls (compute delta)
5. Use Result<T> pattern for error handling

---

## File Structure Reference

```
/components/usecase/UseCaseCockpit.tsx
  ├─ runInlineEvaluation() - Lines 444-533
  ├─ startPollingEvaluation() - Lines 351-441
  ├─ loadExpandedPNData() - Lines 596-662
  ├─ startLiveUpdates() - Lines 665-686
  └─ buildPNStatusMapOptimized() - Lines 171-303

/components/evaluation/RequirementsGrid.tsx
  ├─ Auto-scroll effect - Lines 56-66
  ├─ TreeNode component - Lines 439-777
  └─ Status icon logic - Lines 584-608

/app/api/evaluate/route.ts
  ├─ POST handler - Lines 25-236
  ├─ Progress callback - Lines 58-96
  └─ DB write logic - Lines 59-89

/app/api/prescriptive/bundle/route.ts
  ├─ GET handler - Lines 34-99
  └─ Bundle assembly - Lines 54-86

/lib/evaluation/expand-shared.ts
  ├─ expandSharedRequirements() - Lines 14-92
  └─ expandSharedTree() - Lines 97-171

/lib/evaluation/types.ts
  ├─ EvaluationState - Lines 105-110
  └─ NodeStatus - Line 8

/lib/supabase/types.ts
  ├─ evaluations table - Lines 89-119
  └─ evaluation_results table - Lines 121-150
```

---

END OF ANALYSIS DOCUMENT
