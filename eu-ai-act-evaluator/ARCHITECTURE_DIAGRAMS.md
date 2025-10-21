# Evaluation API - Visual Architecture Diagrams

## 1. Complete Request-to-Database Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ CLIENT (page.tsx - line 319)                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ POST /api/evaluate {                                                        │
│   evaluationId: "abc-123",                                                  │
│   prescriptiveNorm: {...},                                                  │
│   sharedPrimitives: [...],                                                  │
│   caseInput: "Use case description"                                         │
│ }                                                                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ API ROUTE (route.ts - line 25)                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 1. Parse request body (line 29)                                            │
│ 2. Create writtenNodes = new Set() (line 49)                               │
│ 3. Create TransformStream (line 45)                                        │
│ 4. Start async evaluation (line 52)                                        │
│ 5. Return streaming response immediately                                    │
│                                                                              │
│ Background Task:                                                             │
│ ├─ new EvaluationEngine(pn, shared, onStateUpdate) (line 55)              │
│ └─ engine.evaluate(caseInput, evaluateWithGPT5) (line 160)                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ async background
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ EVALUATION ENGINE INITIALIZATION (engine.ts - line 23)                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Constructor:                                                                 │
│ 1. expandSharedRequirements(nodes, sharedPrimitives)                       │
│    - Primitive nodes with .ref → Composite wrappers                        │
│    - Shared primitive tree injected                                        │
│    - New IDs: "node-id-expanded.child-id"                                 │
│                                                                              │
│ 2. buildNodeMap()                                                           │
│    - Map<nodeId, RequirementNode>                                          │
│    - Map<nodeId, EvaluationState> with status='pending'                    │
│                                                                              │
│ 3. Store onStateUpdate callback                                             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ engine.evaluate(caseInput, evaluateWithGPT5)
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ TREE TRAVERSAL - RECURSIVE EVALUATION (engine.ts - line 252)               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ evaluateNode(rootNode, caseInput, evaluateFn)                              │
│ │                                                                            │
│ ├─ IF node.kind === 'PRIMITIVE' ───────────────────────────────────────┐  │
│ │                                                                      │  │
│ │  1. updateState(nodeId, {status: 'evaluating'})                    │  │
│ │     └─ onStateUpdate callback fires with ALL states                │  │
│ │                                                                      │  │
│ │  2. buildPrompt(node, caseInput)                                   │  │
│ │     ├─ node.question.prompt                                        │  │
│ │     ├─ node.question.help                                          │  │
│ │     ├─ node.context.items[]                                        │  │
│ │     └─ caseInput (facts)                                           │  │
│ │                                                                      │  │
│ │  3. evaluateWithGPT5(prompt)                                       │  │
│ │     ├─ sha256(prompt) cache key                                    │  │
│ │     ├─ openai.chat.completions.create({                          │  │
│ │     │    model: 'gpt-5-mini',                                     │  │
│ │     │    reasoning_effort: 'high',                                │  │
│ │     │    response_format: { type: 'json_object' }                │  │
│ │     │  })                                                          │  │
│ │     └─ Parse → { decision, confidence, reasoning }               │  │
│ │                                                                      │  │
│ │  4. updateState(nodeId, {status: 'completed', result})           │  │
│ │     └─ onStateUpdate callback fires with ALL states                │  │
│ │        └─ DATABASE WRITE HAPPENS HERE (see 7.1)                   │  │
│ │                                                                      │  │
│ │  5. Return result.decision (boolean)                               │  │
│ │                                                                      │  │
│ └──────────────────────────────────────────────────────────────────┘  │
│ │                                                                      │
│ ├─ IF node.kind === 'COMPOSITE' ───────────────────────────────────┐  │
│ │                                                                   │  │
│ │  1. updateState(nodeId, {status: 'evaluating'})                 │  │
│ │     └─ onStateUpdate fires                                       │  │
│ │                                                                   │  │
│ │  2. For each child in node.children:                            │  │
│ │     ├─ evaluateNode(child, ...) [RECURSION]                    │  │
│ │     └─ Push result to childResults[]                            │  │
│ │     └─ Short-circuit:                                            │  │
│ │        ├─ allOf: break if result=false                          │  │
│ │        └─ anyOf: break if result=true                           │  │
│ │                                                                   │  │
│ │  3. Apply operator logic:                                        │  │
│ │     ├─ allOf:  decision = childResults.every(r => r)           │  │
│ │     ├─ anyOf:  decision = childResults.some(r => r)            │  │
│ │     ├─ not:    decision = !childResults[0]                      │  │
│ │     └─ xor:    decision = (count === 1)                         │  │
│ │                                                                   │  │
│ │  4. confidence = Math.min(...childConfidences)                 │  │
│ │                                                                   │  │
│ │  5. updateState(nodeId, {status: 'completed', result})         │  │
│ │     └─ onStateUpdate fires                                       │  │
│ │        └─ Composite written to DB (ISSUE!)                      │  │
│ │                                                                   │  │
│ │  6. Return decision (boolean)                                    │  │
│ │                                                                   │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│ └─ RECURSION CONTINUES UNTIL ALL NODES EVALUATED                   │
│    (Depth-first from root to all leaves)                           │
│                                                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. State Update & Database Write Flow (onStateUpdate Callback)

```
updateState(nodeId, { status: 'completed', result: {...} })
         │
         └─ evaluationStates.set(nodeId, {...})
         │
         └─ onStateUpdate(Array.from(evaluationStates.values()))
                    │
                    ▼
         ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
         │  ASYNC CALLBACK (route.ts:58-96)
         └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
                    │
                    ▼
    Filter states: only completed with result
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    [P1: comp] [P2: comp] [C1: comp]
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
For each state:  Check writtenNodes.has(nodeId)?
    │
    ├─ NO (not written yet)
    │  │
    │  ├─ supabase.from('evaluation_results').insert({
    │  │    evaluation_id: evaluationId,
    │  │    node_id: state.nodeId,
    │  │    decision: state.result.decision,
    │  │    confidence: state.result.confidence,
    │  │    reasoning: state.result.reasoning,
    │  │    citations: state.result.citations
    │  │  })
    │  │
    │  └─ Response?
    │     ├─ Success → writtenNodes.add(nodeId)
    │     │            Log "💾 [DB] Wrote result..."
    │     │
    │     ├─ Error 23505 (UNIQUE violation)
    │     │  → writtenNodes.add(nodeId)
    │     │  → Log "⚠️ [DB] Skipped duplicate..."
    │     │
    │     └─ Other error
    │        → Log error
    │
    ├─ YES (already written)
    │  └─ Skip
    │
    └─ Stream SSE event
       └─ writer.write(`data: ${JSON.stringify({
            type: 'progress',
            states: [...]
          })}\n\n`)
```

---

## 3. State Lifecycle Diagram

```
                ┌─────────────────────────────────────────────┐
                │ ALL NODES INITIALIZE WITH STATUS: 'pending' │
                └─────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌──────────────────────┐        ┌──────────────────────┐
        │ PRIMITIVE NODES      │        │ COMPOSITE NODES      │
        └──────────────────────┘        └──────────────────────┘
                    │                               │
                    ▼                               ▼
        updateState(nodeId,            updateState(nodeId,
          evaluating)                    evaluating)
                    │                               │
                    ▼                               ▼
        Call evaluateFn (GPT-5)        For each child:
                    │                   evaluateNode(child)
                    │                               │
                    ▼                               ▼
        Receive result from LLM      Combine results with
                    │                  operator logic
                    │                               │
                    ├─ Success                      │
                    │  └─ updateState(nodeId,       │
                    │      completed,               │
                    │      result)                  │
                    │             updateState(nodeId,
                    │      Error   completed,
                    │  ├─ Catch exception         result)
                    │  └─ updateState(nodeId,       │
                    │      error,                   │
                    │      message)                 │
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        onStateUpdate fires:            onStateUpdate fires:
        - Node has result               - Node has result
        - Filtered for DB write         - Filtered by kind
        - writtenNodes check            - Only primitives written
        - INSERT attempted              - Composites skipped
```

---

## 4. Database Write Decision Tree

```
                    ┌─ State received in onStateUpdate
                    │
                    ├─ Is status === 'completed'?
                    │  ├─ NO → Skip
                    │  └─ YES → Continue
                    │
                    ├─ Does state have result?
                    │  ├─ NO → Skip
                    │  └─ YES → Continue
                    │
                    ├─ writtenNodes.has(nodeId)?
                    │  ├─ YES → Already written, skip
                    │  └─ NO → Continue
                    │
                    ├─ [MISSING CHECK] node.kind === 'primitive'?
                    │  (This SHOULD be here but isn't!)
                    │  ├─ NO → Should skip composites
                    │  └─ YES → Continue
                    │
                    ▼
         ┌────────────────────────────┐
         │ INSERT to evaluation_results│
         └────────────────────────────┘
                    │
                    ├─ Response: Success
                    │  └─ writtenNodes.add(nodeId)
                    │     Log: "💾 Wrote result..."
                    │
                    ├─ Response: Error 23505
                    │  └─ writtenNodes.add(nodeId)
                    │     Log: "⚠️ Skipped duplicate..."
                    │
                    └─ Response: Other Error
                       Log: "❌ Error writing..."
```

---

## 5. Callback Invocation Sequence

```
Evaluation of 3 primitives (P1, P2, P3) under allOf composite (C1):

Timeline:

T1: P1 starts evaluating
    └─ updateState(P1, evaluating) → onStateUpdate
    States array: [P1:eval, P2:pend, P3:pend, C1:pend]
    DB: No writes (status != completed)
    SSE: progress event

T2: P1 completes
    └─ updateState(P1, completed, result) → onStateUpdate
    States: [P1:comp, P2:pend, P3:pend, C1:pend]
    DB: INSERT P1 → writtenNodes.add(P1)
    SSE: progress event

T3: P2 starts
    └─ updateState(P2, evaluating) → onStateUpdate
    States: [P1:comp, P2:eval, P3:pend, C1:pend]
    DB: Check P1 (already in writtenNodes, skip)
    SSE: progress event

T4: P2 completes
    └─ updateState(P2, completed, result) → onStateUpdate
    States: [P1:comp, P2:comp, P3:pend, C1:pend]
    DB: INSERT P1 (skip), INSERT P2 → writtenNodes.add(P2)
    SSE: progress event

T5: P3 starts
    └─ updateState(P3, evaluating) → onStateUpdate
    States: [P1:comp, P2:comp, P3:eval, C1:pend]
    DB: Check P1, P2 (already in writtenNodes, skip)
    SSE: progress event

T6: P3 completes
    └─ updateState(P3, completed, result) → onStateUpdate
    States: [P1:comp, P2:comp, P3:comp, C1:pend]
    DB: INSERT P1, P2 (skip), INSERT P3 → writtenNodes.add(P3)
    SSE: progress event

T7: C1 starts evaluating children
    └─ updateState(C1, evaluating) → onStateUpdate
    States: [P1:comp, P2:comp, P3:comp, C1:eval]
    DB: Check P1, P2, P3 (skip)
    SSE: progress event

T8: C1 receives all child results, combines them
    └─ updateState(C1, completed, result) → onStateUpdate
    States: [P1:comp, P2:comp, P3:comp, C1:comp]
    DB: Check P1, P2, P3 (skip), INSERT C1 (ISSUE!)
    SSE: progress event

T9: Engine.evaluate() returns
    └─ Server: Update evaluations table
    └─ Server: Send 'complete' event
    └─ Client: Receives 'complete', saves results again (redundant!)

Result:
- Total onStateUpdate calls: 8
- Total DB inserts attempted: P1, P2, P3, C1 (4 rows, but C1 shouldn't be there)
- Total writtenNodes: {P1, P2, P3, C1}
- Actual primitives: 3
```

---

## 6. Database Schema Relationship

```
┌─────────────────────────┐
│     use_cases table     │
├─────────────────────────┤
│ id (UUID, PK)           │
│ title                   │
│ description             │
│ tags[]                  │
│ created_at              │
│ updated_at              │
└──────────┬──────────────┘
           │ FK
           │ use_case_id
           │
    ┌──────▼──────────────────────┐
    │   evaluations table         │
    ├─────────────────────────────┤
    │ id (UUID, PK)               │
    │ use_case_id (UUID, FK)      │
    │ pn_ids (UUID[])             │
    │ triggered_at (TIMESTAMP)    │
    │ completed_at (TIMESTAMP)    │
    │ status (enum)               │
    │ progress_current (INTEGER)  │
    │ progress_total (INTEGER)    │
    │ error_message (TEXT)        │
    │ triggered_in_session_id (UUID) │
    └──────┬──────────────────────┘
           │ FK
           │ evaluation_id
           │
    ┌──────▼────────────────────────────┐
    │  evaluation_results table         │
    ├────────────────────────────────────┤
    │ id (UUID, PK)                      │
    │ evaluation_id (UUID, FK) NOT NULL  │
    │ node_id (VARCHAR) NOT NULL         │
    │ decision (BOOLEAN)                 │
    │ confidence (NUMERIC 0-1)           │
    │ reasoning (TEXT)                   │
    │ citations (JSONB array)            │
    │ created_at (TIMESTAMP)             │
    │                                    │
    │ UNIQUE (evaluation_id, node_id)    │
    └────────────────────────────────────┘
```

---

## 7. Data Transformation Pipeline

```
┌──────────────────────────────────┐
│ HTTP POST Request                │
│ { prescriptiveNorm, ...}         │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ Parse to TypeScript Types        │
│ PrescriptiveNorm                 │
│ SharedPrimitive[]                │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ expandSharedRequirements()               │
│ - Replace primitive refs                 │
│ - Inject shared primitive trees         │
│ - Generate unique expanded IDs          │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ buildNodeMap()                           │
│ - Map<nodeId, RequirementNode>          │
│ - evaluationStates Map initialization    │
│ - All status: 'pending'                 │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Tree Traversal (evaluateNode recursion)  │
│ - Primitives: Call GPT-5-mini           │
│ - Composites: Combine children          │
│ - updateState() after each              │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ onStateUpdate Callback                   │
│ - Filter completed states                │
│ - writtenNodes deduplication             │
│ - Supabase INSERT                        │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ evaluation_results table                 │
│ - node_id, decision, confidence          │
│ - reasoning, citations                   │
│ - (includes composites - ISSUE!)         │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ SSE Stream to Client                     │
│ - 'progress' events                      │
│ - 'complete' event                       │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Client-Side Processing                   │
│ - Parse SSE events                       │
│ - Update UI with states                  │
│ - INSERT results again (REDUNDANT!)      │
└──────────────────────────────────────────┘
```

---

## 8. writtenNodes Set Lifecycle

```
Request starts
     │
     ▼
writtenNodes = new Set<string>()
     │
     ├─ [Empty]
     │
     ├─ onStateUpdate: P1 completes
     │  └─ writtenNodes.has('P1')?
     │     ├─ false: INSERT
     │     └─ writtenNodes.add('P1') → {'P1'}
     │
     ├─ onStateUpdate: P2 completes
     │  └─ writtenNodes.has('P2')?
     │     ├─ false: INSERT
     │     └─ writtenNodes.add('P2') → {'P1', 'P2'}
     │
     ├─ onStateUpdate: P3 completes
     │  └─ writtenNodes.has('P3')?
     │     ├─ false: INSERT
     │     └─ writtenNodes.add('P3') → {'P1', 'P2', 'P3'}
     │
     ├─ onStateUpdate: C1 completes
     │  └─ writtenNodes.has('C1')?
     │     ├─ false: INSERT (composites shouldn't be written!)
     │     └─ writtenNodes.add('C1') → {'P1', 'P2', 'P3', 'C1'}
     │
     ├─ onStateUpdate: P1 completes AGAIN (if callback re-fires)
     │  └─ writtenNodes.has('P1')?
     │     ├─ true: SKIP (prevents duplicate)
     │     └─ No change
     │
     ▼
Request completes
     └─ writtenNodes garbage collected
        (process-scoped, not persisted)
```

---

## 9. Error Handling Flow

```
                    onStateUpdate callback
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    For each state...  supabase.insert()...  Stream SSE
            │               │
            │       ┌───────┴────────┐
            │       │                │
            │       ▼                ▼
            │   Success          Error
            │       │                │
            │   writtenNodes.     error.code?
            │   add(nodeId)           │
            │       │        ┌────────┼────────┐
            │       │        │        │        │
            │       │        ▼        ▼        ▼
            │       │      23505    Other    Timeout
            │       │    (Duplicate) Error   (Retry)
            │       │        │        │        │
            │       │        │   Log   │    Skip
            │       │        │  Error  │
            │       │    writtenNodes. │
            │       │    add(nodeId)   │
            │       │        │         │
            │       └────────┴────┬────┘
            │                    │
            └──────────┬─────────┘
                       │
                       ▼
                Stream SSE event
                (success or failure)
```

---

## 10. writtenNodes vs Database Constraints

```
Layer 1: writtenNodes Set (In-Memory)
┌───────────────────────────────────────┐
│ Fast O(1) lookup                      │
│ Prevents: Repeated DB queries         │
│ Scope: Single evaluation              │
│ Handles: Callback multiple invocations│
│ Not stored: Process-scoped only       │
└───────────────────────────────────────┘
                    │
                    ▼
Layer 2: Database UNIQUE Constraint
┌───────────────────────────────────────┐
│ UNIQUE (evaluation_id, node_id)       │
│ Prevents: Actual duplicate rows       │
│ Scope: All evaluations                │
│ Handles: Client errors + bugs         │
│ Stored: Permanent schema constraint   │
│ Error: 23505 on violation             │
└───────────────────────────────────────┘

Dual Protection Strategy:
- writtenNodes prevents unnecessary DB calls
- Database constraint catches bugs
- Both needed for reliability
```

---

## 11. Key Issue: Composite Nodes in Database

```
Current Behavior:
┌──────────────────────────────────────────┐
│ Engine generates results for ALL nodes   │
│ - P1: result (decision, confidence)     │
│ - P2: result (decision, confidence)     │
│ - C1: result (calculated from children) │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Callback processes ALL completed states │
│ - No node.kind filter                   │
│ - writtenNodes only tracks duplicates   │
│ - Both primitives AND composites sent   │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│ Database receives:                      │
│ - P1 result (correct)                  │
│ - P2 result (correct)                  │
│ - C1 result (WRONG - shouldn't exist)   │
│                                          │
│ UNIQUE (eval_id, node_id) prevents:     │
│ - Duplicate P1, P2, C1 in same eval    │
│ - But allows composite storage          │
│                                          │
│ Data Bloat:                              │
│ - Should have 2 rows                    │
│ - Actually have 3 rows                  │
│ - With large PNs: 3x+ storage waste    │
└──────────────────────────────────────────┘

What Should Happen:
┌──────────────────────────────────────────┐
│ Filter BEFORE DB insert:                │
│ if (node?.kind === 'primitive') {        │
│   INSERT                                │
│ }                                        │
│                                          │
│ Result:                                  │
│ - Only primitives in evaluation_results │
│ - Composites calculated from children   │
│ - Cleaner schema design                │
│ - Better query performance              │
└──────────────────────────────────────────┘
```

---

## 12. Redundant Client-Side Save

```
Evaluation Flow:

T1: Server callback → INSERT P1, P2, P3, C1
    └─ evaluation_results: 4 rows

T2: Server → Send 'complete' event

T3: Client receives → onStateUpdate → INSERT P1, P2, P3, C1 again!
    └─ DB rejects with 23505 (UNIQUE constraint)
    └─ Client catches error (may not even notice)

T4: Results:
    ├─ Same 4 rows in evaluation_results
    ├─ But 8 INSERT queries executed
    ├─ 4 succeeded, 4 failed
    └─ Wasted network + compute

Solution:
- Remove client save (page.tsx lines 405-430)
- Trust server callback
- Save only once
```

