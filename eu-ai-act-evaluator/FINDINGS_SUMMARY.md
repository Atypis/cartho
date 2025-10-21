# Evaluation API Flow - Critical Findings Summary

## Quick Reference: Architecture at a Glance

```
POST /api/evaluate
       │
       ├─ Create writtenNodes Set (tracks DB writes)
       ├─ Create SSE stream
       └─ Start async evaluation
              │
              ├─ new EvaluationEngine()
              │  └─ expandSharedRequirements()
              │
              ├─ engine.evaluate() - Recursive tree traversal
              │  ├─ Primitive: Call GPT-5-mini, updateState
              │  │  └─ onStateUpdate callback fires
              │  │     └─ Insert result to DB + track in writtenNodes
              │  └─ Composite: Combine children, updateState
              │     └─ onStateUpdate callback fires
              │        └─ Filtered out before DB (or should be)
              │
              ├─ Update evaluations.status='completed'
              │
              └─ Send SSE 'complete' event
                 └─ Client receives and saves again (redundant!)

Database Results:
├─ evaluations: 1 row (metadata + status)
└─ evaluation_results: N rows (one per node)
```

---

## 1. REQUEST FLOW

**Input (HTTP POST):**
```json
{
  "prescriptiveNorm": { ... },
  "sharedPrimitives": [ ... ],
  "caseInput": "string",
  "evaluationId": "uuid"
}
```

**Processing:**
1. Parse request
2. Create writtenNodes Set<string>
3. Create TransformStream for SSE
4. Fire async evaluation in background

**Output:** Streaming SSE response
```
data: {"type":"progress","states":[...]}
data: {"type":"complete","result":{...}}
```

---

## 2. EVALUATION ENGINE

**Initialization:**
- expandSharedRequirements() transforms nodes
- Build nodeMap & evaluationStates Map
- Register onStateUpdate callback

**Tree Traversal:**
- Depth-first recursive evaluation
- evaluateNode() → [primitive OR composite]
- Primitive: LLM call, state update
- Composite: Combine children, state update

**Key Method: updateState(nodeId, update)**
- Updates evaluationStates Map
- Calls onStateUpdate with ALL current states
- Happens for each state transition

---

## 3. STATE LIFECYCLE

```
pending → evaluating → completed (or error)
```

**Primitive nodes:**
- pending (initial)
- evaluating (before LLM call)
- completed (after LLM result received)

**Composite nodes:**
- pending (initial)
- evaluating (before processing children)
- completed (after children combined)

**Note:** Both receive results, but only primitives should be saved to DB

---

## 4. CALLBACK MECHANISM (onStateUpdate)

Called after EVERY state update with array of ALL current states.

**Pattern in route.ts (lines 58-96):**
```typescript
async (states) => {
  if (evaluationId) {
    const completedStates = states.filter(s => 
      s.status === 'completed' && s.result
    );

    for (const state of completedStates) {
      if (!writtenNodes.has(state.nodeId) && state.result) {
        // Insert to evaluation_results
        const { error } = await supabase
          .from('evaluation_results')
          .insert({...});

        if (!error) {
          writtenNodes.add(state.nodeId);
        } else if (error.code === '23505') {
          writtenNodes.add(state.nodeId);  // Duplicate
        }
      }
    }
  }

  // Stream progress
  await writer.write(encoder.encode(...));
}
```

---

## 5. DATABASE SCHEMA

**evaluations table:**
```sql
id (UUID, PK)
use_case_id (UUID, FK)
pn_ids (UUID[] array)
triggered_at (TIMESTAMP, auto)
completed_at (TIMESTAMP, nullable)
status (ENUM: pending|running|completed|failed)
progress_current (INTEGER, set on completion)
progress_total (INTEGER, set on completion)
```

**evaluation_results table:**
```sql
id (UUID, PK)
evaluation_id (UUID, FK, NOT NULL)
node_id (VARCHAR, NOT NULL)
decision (BOOLEAN, NOT NULL)
confidence (NUMERIC 0-1, NOT NULL)
reasoning (TEXT, NOT NULL)
citations (JSONB array, optional)
created_at (TIMESTAMP, auto)

UNIQUE CONSTRAINT: (evaluation_id, node_id)
```

---

## 6. COLUMNS WRITTEN

**evaluation_results writes:**
- evaluation_id (from route parameter)
- node_id (state.nodeId)
- decision (state.result.decision)
- confidence (state.result.confidence)
- reasoning (state.result.reasoning)
- citations (state.result.citations || [])
- Auto: id, created_at

**evaluations updates:**
- status: 'completed'
- completed_at: ISO timestamp
- progress_current: primitive count (set to same as progress_total)
- progress_total: primitive count

---

## 7. DUPLICATE PREVENTION: writtenNodes Set

**Purpose:** Track nodeIds already written to prevent duplicates

**Mechanism:**
```typescript
const writtenNodes = new Set<string>();

// Before insert:
if (!writtenNodes.has(state.nodeId)) {
  // Try insert
  
  if (!error) {
    writtenNodes.add(state.nodeId);
  } else if (error.code === '23505') {
    // Unique constraint violation (already exists)
    writtenNodes.add(state.nodeId);
  }
}
```

**Why it works:**
- O(1) lookup before DB operation
- JavaScript single-threaded event loop
- Database UNIQUE (eval_id, node_id) as backup
- Error 23505 handled gracefully

---

## 8. CRITICAL ISSUES IDENTIFIED

### Issue 1: Composite Nodes Are Written to Database
**Severity:** HIGH

**Problem:**
- Engine gives composite nodes results (decision + confidence)
- Callback doesn't filter by node.kind
- ALL completed states with results get written
- Composites shouldn't be in evaluation_results

**Current fix:** None (writtenNodes prevents duplicates, not composites)

**Proper fix:** Add node.kind filter
```typescript
const node = nodeMap.get(state.nodeId);
if (node?.kind === 'primitive' && !writtenNodes.has(state.nodeId)) {
  // Insert
}
```

### Issue 2: Client Saves Results Again
**Severity:** MEDIUM

**Problem:**
- Server writes results during evaluation (via callback)
- Client writes same results again after completion
- Database UNIQUE constraint catches duplicates
- Redundant queries

**Current behavior:** Both saves succeed eventually via 23505 handling

**Proper fix:** Remove client-side save (page.tsx lines 405-430)

### Issue 3: writtenNodes Doesn't Filter Composites
**Severity:** MEDIUM

**Problem:**
- writtenNodes.has() checks if node was written
- Doesn't check if node.kind === 'primitive'
- Composite nodes written once, then skipped

**Impact:** Database stores redundant composite results

---

## 9. RACE CONDITION ANALYSIS

**Risk Level:** LOW (but not zero)

**Why LOW:**
1. JavaScript single-threaded event loop
2. writtenNodes.add() is synchronous
3. updateState() is synchronous
4. Callbacks fire serially

**Scenario where it could fail:**
1. Primitive P1 completed
2. updateState(P1, {completed}) called
3. onStateUpdate callback fired ASYNC
4. writtenNodes.has(P1) → false
5. Supabase.insert(P1) sent to DB [PENDING]
6. Before insert completes, another callback fires
7. writtenNodes.has(P1) → false (still!)
8. Supabase.insert(P1) sent again [PENDING]
9. Both reach database simultaneously
10. First succeeds, second gets 23505

**Mitigation:** writtenNodes.add() AFTER insert returns + DB constraint

---

## 10. LLM INTEGRATION

**Model:** gpt-5-mini
**Settings:**
- reasoning_effort: 'high'
- response_format: JSON object

**Response Expected:**
```json
{
  "decision": boolean,
  "confidence": 0.0-1.0,
  "reasoning": "string"
}
```

**Caching:** Per-prompt SHA256 cache to avoid duplicate calls

**Timing:** ~2-10 seconds per call (total 15-70 seconds for typical PN)

---

## 11. SSE STREAMING

**Events:**
1. Multiple 'progress' events during evaluation
2. Single 'complete' event at end

**Format:**
```
data: {"type":"progress","states":[...]}
data: {"type":"complete","result":{...}}
```

**Client Processing (page.tsx):**
- Reads SSE stream
- Updates UI on progress events
- Saves results on complete event (redundant!)

---

## 12. KEY METRICS

**Example PN with 6 primitives, 4 composites (10 total):**
- LLM calls: 6
- Callback invocations: ~20 (2 per node)
- DB rows written: 6 (if filtered) or 10 (current)
- Time: 15-70 seconds
- SSE events: ~30+ progress events + 1 complete

---

## 13. WHAT GETS WRITTEN WHERE

**evaluations table:**
- One row per evaluation
- Status progression: pending → running → completed
- Created by client, updated by server

**evaluation_results table:**
- One row per node (should be per primitive only)
- Created incrementally via callback during evaluation
- Also saved by client after evaluation completes

**Current redundancy:** Both primitive AND composite nodes in results table

---

## 14. SUMMARY OF DATA TRANSFORMATIONS

```
HTTP POST JSON
    ↓
TypeScript types (PrescriptiveNorm, SharedPrimitive[])
    ↓
Node expansion (shared refs replaced)
    ↓
evaluationStates Map initialization
    ↓
Tree traversal + LLM calls
    ↓
State updates + updateState() calls
    ↓
onStateUpdate callback fires
    ↓
Filter completed states
    ↓
writtenNodes deduplication check
    ↓
Supabase INSERT evaluation_results
    ↓
SSE event sent to client
    ↓
Client receives and updates UI
    ↓
Client inserts again (redundant)
    ↓
Final DB state with primitive + composite results
```

---

## 15. RECOMMENDATIONS

1. **Add node.kind filter before DB writes**
   - Only insert primitive nodes
   - Prevents database bloat

2. **Remove client-side save**
   - Trust server callback
   - Reduces redundant queries

3. **Improve progress tracking**
   - Track progress_current separately from progress_total
   - Update dynamically, not just on completion

4. **Consider batching for large PNs**
   - If 1000+ primitives, batch inserts
   - May improve performance

5. **Document composite vs primitive semantics**
   - Currently ambiguous
   - Could cause confusion in future development

