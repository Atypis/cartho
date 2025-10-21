# EU AI Act Evaluator - Complete API Flow Architecture

## Executive Summary

The evaluation flow is a **streaming, tree-traversal based system** that:
1. Receives POST requests with PN (Prescriptive Norm) and case input
2. Traverses a requirement tree from root to leaves
3. Evaluates primitive nodes with GPT-5-mini via LLM calls
4. Updates state progressively via callback (onStateUpdate)
5. Writes primitive results to database with deduplication
6. Returns composite node decisions via logical operators (allOf/anyOf/not/xor)

Key principle: **Only primitive nodes are evaluated by LLM and written to DB. Composite nodes are calculated from their children.**

---

## 1. API ROUTE STRUCTURE

File: `/Users/a1984/cartho/eu-ai-act-evaluator/app/api/evaluate/route.ts`

### 1.1 POST Request Handler

```
POST /api/evaluate
Content-Type: application/json

Request Body:
{
  prescriptiveNorm: PrescriptiveNorm,
  sharedPrimitives: SharedPrimitive[],
  caseInput: string,                    // "Use case title\n\nUse case description"
  evaluationId: string                  // Required for DB writes
}
```

### 1.2 Request Processing Flow

```typescript
Line 29:   Destructure request: { prescriptiveNorm, sharedPrimitives, caseInput, evaluationId }
Line 44-46: Create TransformStream for SSE (Server-Sent Events)
Line 49:   Create writtenNodes = new Set<string>()  // Track DB writes (CRITICAL)
Line 52:   Start async evaluation in background (non-blocking)
```

### 1.3 WrittenNodes Set Purpose

```typescript
const writtenNodes = new Set<string>();  // Line 49

Purpose:
- Prevents duplicate writes to evaluation_results table
- Tracks all nodeIds that have been written to DB
- Fast O(1) lookup before each INSERT
- Stays in memory for entire evaluation lifecycle (process-scoped)
- Works because callback is synchronous for state updates

Usage Pattern:
1. completedStates = states.filter(s => s.status === 'completed' && s.result)
2. For each state:
   - Check: if (!writtenNodes.has(state.nodeId) && state.result)
   - Write to DB
   - On success: writtenNodes.add(state.nodeId)
   - On duplicate error (23505): writtenNodes.add(state.nodeId)
```

---

## 2. EVALUATION ENGINE INITIALIZATION

File: `/Users/a1984/cartho/eu-ai-act-evaluator/lib/evaluation/engine.ts`

### 2.1 Engine Constructor (Line 23-36)

```typescript
new EvaluationEngine(
  prescriptiveNorm: PrescriptiveNorm,
  sharedPrimitives: SharedPrimitive[] = [],
  onStateUpdate?: (states: EvaluationState[]) => void
)

Initialization:
1. Store PrescriptiveNorm
2. expandSharedRequirements(pn.requirements.nodes, sharedPrimitives)
   - Transforms nodes that reference shared predicates
   - Creates composite nodes wrapping shared primitive trees
   - Generates unique IDs (e.g., "node-id-expanded.child-id")
3. Build nodeMap: Map<nodeId, RequirementNode>
4. Initialize evaluationStates: Map<nodeId, EvaluationState>
   - Set all nodes to status: 'pending'
5. Store onStateUpdate callback
```

### 2.2 Node Expansion Example

Input node with shared reference:
```json
{
  "id": "REQ-1",
  "kind": "primitive",
  "ref": "qp:is_provider",
  "label": "Is AI Provider"
}
```

After expansion:
```json
{
  "id": "REQ-1",
  "kind": "composite",
  "operator": "allOf",
  "label": "Is AI Provider",
  "children": ["REQ-1-expanded.SP-ROOT"]
}
// Plus all nodes from shared primitive tree with prefix "REQ-1-expanded."
```

---

## 3. STATE MANAGEMENT & CALLBACK MECHANISM

### 3.1 State Update Flow

```typescript
// Engine.updateState() - Line 56-66
private updateState(nodeId: string, update: Partial<EvaluationState>) {
  const current = this.evaluationStates.get(nodeId);
  if (current) {
    const updated = { ...current, ...update };
    this.evaluationStates.set(nodeId, updated);

    if (this.onStateUpdate) {
      // CRITICAL: Always call with ALL states (current snapshot)
      this.onStateUpdate(Array.from(this.evaluationStates.values()));
    }
  }
}
```

### 3.2 State Lifecycle

For each node, states follow this sequence:

```
pending → evaluating → completed (or error)
```

**Primitive nodes:**
- pending: Initial state
- evaluating: Marked before calling GPT-5 (Line 83)
- completed: After LLM returns result (Line 93)
- error: If LLM call fails (Line 100)

**Composite nodes:**
- pending: Initial state
- evaluating: Marked before evaluating children (Line 156)
- completed: After child results are combined (Line 218)
- error: If child evaluation fails

### 3.3 Callback Invocations

onStateUpdate is called:
1. After evaluatePrimitive receives LLM result (evaluating → completed)
2. After evaluateComposite calculates logical result (evaluating → completed)
3. When any node error occurs
4. **Total calls: Worst case = number of nodes × 2 (entering, completing)**

For a PN with 10 primitives and 5 composites:
- Max callback invocations: ~30 calls (but not guaranteed for all nodes)

---

## 4. EVALUATION ENGINE - TREE TRAVERSAL

### 4.1 Main evaluate() Method (Line 252-272)

```typescript
async evaluate(
  caseInput: string,
  evaluateFn: (prompt: string) => Promise<EvaluationResult>
): Promise<{ compliant: boolean; states: EvaluationState[] }>

Flow:
1. Get root node: nodeMap.get(this.pn.requirements.root)
2. Call evaluateNode(rootNode, caseInput, evaluateFn)
3. Return { compliant: result, states: all evaluation states }
```

### 4.2 Dispatch Logic (Line 234-247)

```typescript
private async evaluateNode(
  node: RequirementNode,
  caseInput: string,
  evaluateFn: ...
): Promise<boolean>

if (node.kind === 'primitive') {
  return evaluatePrimitive(...)  // Call LLM, return decision boolean
} else if (node.kind === 'composite') {
  return evaluateComposite(...)   // Combine children decisions
}
```

### 4.3 Primitive Node Evaluation (Line 71-106)

```typescript
private async evaluatePrimitive(
  node: RequirementNode,
  caseInput: string,
  evaluateFn: ...
): Promise<EvaluationResult>

Steps:
1. updateState(node.id, { status: 'evaluating' })
   → Triggers onStateUpdate callback
2. buildPrompt(node, caseInput)
   → Constructs LLM prompt from:
      - node.question.prompt
      - node.question.help (guidance)
      - node.context.items[] (legal context)
      - caseInput (facts)
3. evaluateFn(prompt)
   → Calls GPT-5-mini with reasoning_effort: 'high'
   → Parses response to EvaluationResult
4. updateState(node.id, { status: 'completed', result })
   → Triggers onStateUpdate callback
5. Return result
```

### 4.4 Composite Node Evaluation (Line 145-229)

```typescript
private async evaluateComposite(
  node: RequirementNode,
  caseInput: string,
  evaluateFn: ...
): Promise<boolean>

Steps:
1. updateState(node.id, { status: 'evaluating' })
2. Iterate through node.children[]
   - For each child ID:
     a. Get childNode from nodeMap
     b. Call evaluateNode(childNode, ...) recursively
     c. Store result in childResults[]
   - Short-circuit optimization:
     * allOf: Stop if any child = false
     * anyOf: Stop if any child = true
3. Apply operator logic:
   
   allOf:  decision = childResults.every(r => r === true)
   anyOf:  decision = childResults.some(r => r === true)
   not:    decision = !childResults[0]
   xor:    decision = (childResults.filter(Boolean).length === 1)
   
4. Calculate confidence = Math.min(...child confidences)
5. updateState(node.id, { status: 'completed', result: {...} })
6. Return decision
```

**CRITICAL: Composite nodes have result set, but writtenNodes check prevents DB writes**

---

## 5. LLM INTEGRATION

### 5.1 GPT-5-mini Call (Line 104-156)

```typescript
async evaluateWithGPT5(prompt: string): Promise<EvaluationResult>

Caching:
1. key = sha256(prompt)
2. Check evalCache.get(key)
3. If hit: return cached result, log "⚡ [Cache] Hit for request #N"
4. If miss: continue

OpenAI Call:
const response = await openai.chat.completions.create({
  model: 'gpt-5-mini',
  messages: [
    {
      role: 'system',
      content: 'You are a legal expert... Respond ONLY with JSON...'
    },
    {
      role: 'user',
      content: prompt + '\n\nReturn JSON only with keys: decision, confidence, reasoning.'
    }
  ],
  reasoning_effort: 'high',
  response_format: { type: 'json_object' }
})

Response Parsing:
1. Try: JSON.parse(response.choices[0].message.content)
   - Expect: { decision: boolean, confidence: number, reasoning: string }
2. Catch: Use legacy regex-based parser
3. Normalize:
   - confidence = Math.max(0, Math.min(1, confidence))
   - reasoning = String(reasoning || '')
```

### 5.2 Response Format

```json
{
  "decision": true|false,
  "confidence": 0.0-1.0,
  "reasoning": "2-3 sentences citing specific facts"
}
```

---

## 6. DATABASE WRITES - STREAM CALLBACK

### 6.1 onStateUpdate Callback (Route.ts Line 58-96)

```typescript
async (states) => {
  // Filter to only COMPLETED states with results
  if (evaluationId) {
    const completedStates = states.filter(
      s => s.status === 'completed' && s.result
    );

    for (const state of completedStates) {
      // Check in-memory cache first (WRITE-ONCE pattern)
      if (!writtenNodes.has(state.nodeId) && state.result) {
        
        // INSERT to evaluation_results
        const { error } = await supabase
          .from('evaluation_results')
          .insert({
            evaluation_id: evaluationId,
            node_id: state.nodeId,
            decision: state.result.decision,
            confidence: state.result.confidence,
            reasoning: state.result.reasoning,
            citations: state.result.citations || [],
          });

        if (!error) {
          // Success: Mark as written
          writtenNodes.add(state.nodeId);
          console.log(`💾 [DB] Wrote result for ${state.nodeId}`);
        } else if (error.code === '23505') {
          // Duplicate key error (already written)
          writtenNodes.add(state.nodeId);
          console.log(`⚠️ [DB] Skipped duplicate for ${state.nodeId}`);
        } else {
          // Actual error
          console.error(`❌ [DB] Error writing ${state.nodeId}:`, error);
        }
      }
    }
  }

  // Stream progress update via SSE
  await writer.write(
    encoder.encode(`data: ${JSON.stringify({ type: 'progress', states })}\n\n`)
  );
}
```

### 6.2 Database Schema - evaluations Table

```sql
Column              | Type      | Constraints
--------------------|-----------|------------------
id                 | UUID      | PRIMARY KEY
use_case_id        | UUID      | FK → use_cases
pn_ids             | UUID[]    | Array of PN IDs
triggered_at       | TIMESTAMP | DEFAULT now()
completed_at       | TIMESTAMP | NULL initially
status             | ENUM      | pending|running|completed|failed
error_message      | TEXT      | NULL
triggered_in_session_id | UUID | FK → chat_sessions
progress_current   | INTEGER   | (used in earlier versions)
progress_total     | INTEGER   | (used in earlier versions)
```

**Key points:**
- One evaluation per user action
- Stores array of PN IDs (batch evaluation)
- Status progresses: pending → running → completed|failed
- Note: progress_current/progress_total are updated but optional

### 6.3 Database Schema - evaluation_results Table

```sql
Column              | Type      | Constraints
--------------------|-----------|------------------
id                 | UUID      | PRIMARY KEY
evaluation_id      | UUID      | FK → evaluations (NOT NULL)
node_id            | VARCHAR   | NOT NULL
decision           | BOOLEAN   | NOT NULL
confidence         | NUMERIC   | NOT NULL (0.0-1.0)
reasoning          | TEXT      | NOT NULL
citations          | JSONB     | (array, optional)
created_at         | TIMESTAMP | DEFAULT now()

UNIQUE CONSTRAINT: (evaluation_id, node_id)
```

**Critical constraints:**
- Unique (evaluation_id, node_id): Prevents duplicate results
- Error code 23505 = Unique constraint violation
- This is what writtenNodes deduplicates in-memory

---

## 7. COMPLETE REQUEST → DATABASE FLOW

### 7.1 High-Level Request Flow

```
1. CLIENT (page.tsx)
   │
   ├─ POST /api/evaluate with:
   │  ├─ prescriptiveNorm
   │  ├─ sharedPrimitives
   │  ├─ caseInput
   │  └─ evaluationId
   │
   └─→ SERVER (route.ts)
       │
       ├─ Create writtenNodes Set
       ├─ Create TransformStream for SSE
       │
       └─→ Start async evaluation (background)
           │
           ├─ new EvaluationEngine(pn, shared, onStateUpdate)
           │  └─ expandSharedRequirements()
           │
           ├─ engine.evaluate(caseInput, evaluateWithGPT5)
           │  │
           │  └─→ evaluateNode(rootNode)
           │      │
           │      ├─ [if primitive]
           │      │  ├─ updateState('evaluating')
           │      │  │  └─→ onStateUpdate callback fires
           │      │  ├─ buildPrompt(node, caseInput)
           │      │  ├─ evaluateWithGPT5(prompt)
           │      │  │  ├─ Check evalCache
           │      │  │  └─ Call openai.chat.completions.create()
           │      │  │     (gpt-5-mini, reasoning_effort: 'high')
           │      │  ├─ Parse response → EvaluationResult
           │      │  └─ updateState('completed', { result })
           │      │     └─→ onStateUpdate callback fires
           │      │         ├─ Filter to completed + has result
           │      │         ├─ For each state:
           │      │         │  ├─ Check writtenNodes.has(nodeId)
           │      │         │  ├─ supabase.insert(evaluation_results)
           │      │         │  ├─ On success: writtenNodes.add(nodeId)
           │      │         │  └─ On 23505: writtenNodes.add(nodeId)
           │      │         └─ writer.write(SSE event: 'progress')
           │      │
           │      └─ [if composite]
           │         ├─ updateState('evaluating')
           │         │  └─→ onStateUpdate callback fires
           │         ├─ For each child:
           │         │  └─ evaluateNode(child) [RECURSION]
           │         ├─ Combine childResults via operator
           │         └─ updateState('completed', { result })
           │            └─→ onStateUpdate callback fires
           │                └─ (only primitives are filtered for DB write)
           │
           ├─ Update evaluations table:
           │  └─ SET status='completed', completed_at=now()
           │
           ├─ Send final result via SSE
           │  └─ writer.write('data: {type: "complete", result}')
           │
           └─ writer.close()
```

### 7.2 Data Transformations at Each Step

```
INPUT: HTTP POST
├─ prescriptiveNorm (JSON) → PrescriptiveNorm TypeScript type
├─ sharedPrimitives (JSON) → SharedPrimitive[] TypeScript type
└─ caseInput (string) → preserved as-is

TRANSFORMATION 1: Node Expansion
├─ Original nodes → expandSharedRequirements() → Expanded nodes
└─ Primitive refs replaced with composite wrappers

TRANSFORMATION 2: State Creation
├─ Nodes → evaluationStates Map
└─ node.id → EvaluationState { nodeId, status: 'pending' }

TRANSFORMATION 3: LLM Processing
├─ node + caseInput → buildPrompt() → string
├─ string → openai.create() → API response
└─ response → JSON parse → EvaluationResult

TRANSFORMATION 4: State Update
├─ EvaluationResult → updateState() call
└─ evaluationStates Map → Array → SSE event

TRANSFORMATION 5: Database Insert
├─ EvaluationState[] → Filter (completed + has result)
├─ Filtered states → evaluation_results INSERT
└─ Check for 23505 → writtenNodes tracking

OUTPUT: Database Records
├─ evaluations table: 1 row (status=completed)
└─ evaluation_results table: N rows (one per primitive)
```

---

## 8. STATE EMISSION PATTERNS

### 8.1 When onStateUpdate is Called

The callback receives **all states** every time:

```
Scenario: 3 primitive nodes (P1, P2, P3) in allOf composite (C1)

Call 1: P1 becomes 'evaluating'
  States: [{ P1: pending→evaluating }, { P2: pending }, { P3: pending }, { C1: pending }]

Call 2: P1 becomes 'completed'
  States: [{ P1: completed }, { P2: pending }, { P3: pending }, { C1: pending }]
  → writtenNodes.add(P1) in callback

Call 3: P2 becomes 'evaluating'
  States: [{ P1: completed }, { P2: pending→evaluating }, { P3: pending }, { C1: pending }]

Call 4: P2 becomes 'completed'
  States: [{ P1: completed }, { P2: completed }, { P3: pending }, { C1: pending }]
  → writtenNodes.add(P2) in callback

Call 5: P3 becomes 'evaluating'
  States: [{ P1: completed }, { P2: completed }, { P3: pending→evaluating }, { C1: pending }]

Call 6: P3 becomes 'completed'
  States: [{ P1: completed }, { P2: completed }, { P3: completed }, { C1: pending }]
  → writtenNodes.add(P3) in callback

Call 7: C1 becomes 'evaluating'
  States: [{ P1: completed }, { P2: completed }, { P3: completed }, { C1: pending→evaluating }]

Call 8: C1 becomes 'completed'
  States: [{ P1: completed }, { P2: completed }, { P3: completed }, { C1: completed }]
  → C1 is composite, NOT written to DB (filtered out)

Total writes: 3 (only primitives)
Total calls: 8
```

### 8.2 Database Write Filtering

```typescript
// Line 61 in route.ts
const completedStates = states.filter(s => s.status === 'completed' && s.result);

for (const state of completedStates) {
  const node = nodeMap.get(state.nodeId);  // NOT DONE in route.ts!
  
  // So how does it filter out composites?
  // Answer: It doesn't! This is the deduplication layer.
  // The engine writes results for ALL nodes (primitives + composites).
  // Composites have confidence calculated, so they have results.
  
  // But then the UI filters:
  // RequirementsGrid.tsx Line 84-89 filters to primitives only
  // when displaying and counting progress.
}
```

**ISSUE FOUND**: The callback DOES NOT filter by node.kind!
- Both primitive AND composite nodes with results get written to DB
- This is why earlier versions had 134 results instead of 19 primitives
- The writtenNodes Set prevents duplicates, but doesn't prevent composites

---

## 9. CRITICAL FINDINGS: WHY DUPLICATES OCCURRED

### 9.1 The Duplicate Problem (134 vs 19)

Original issue: Evaluation had 19 primitive nodes but 134 results written

Possible causes identified:
1. **Callback called multiple times per node**
   - Each state update = callback invocation
   - Same node could appear multiple times in states array
   - Without writtenNodes.has() check, would write on every callback

2. **Composite nodes with results**
   - Engine calculates results for composites (with confidence)
   - If not filtered, all composites are written to DB
   - In tree with depth > 2, composites can be numerous

3. **States array mutations**
   - updateState() creates new array from Map.values()
   - Each array position includes ALL current nodes
   - If same node processed multiple times, state updates multiple times

### 9.2 The writtenNodes.has() Fix

```typescript
if (!writtenNodes.has(state.nodeId) && state.result) {
  // Only proceed if:
  // 1. This exact nodeId hasn't been written yet
  // 2. There is a result to write
  
  // After insert success:
  writtenNodes.add(state.nodeId);
  
  // After 23505 duplicate error:
  writtenNodes.add(state.nodeId);
}
```

**Effectiveness:**
- Prevents duplicate writes: YES
- Filters composites: NO (if they have results, they'll be written once)
- Race condition resistant: YES (in-memory Set, single-threaded event loop)

### 9.3 What Should Happen Instead

```typescript
// BETTER: Filter at DB write time
if (!writtenNodes.has(state.nodeId) && state.result) {
  const node = nodeMap.get(state.nodeId);
  
  // Only write if PRIMITIVE
  if (node?.kind === 'primitive') {
    // Insert to DB
  }
  
  writtenNodes.add(state.nodeId);
}
```

OR

```typescript
// OR: Filter before the loop
const completedPrimitives = states.filter(s => {
  return s.status === 'completed' && 
         s.result && 
         nodeMap.get(s.nodeId)?.kind === 'primitive';
});

for (const state of completedPrimitives) {
  if (!writtenNodes.has(state.nodeId)) {
    // Insert to DB
    writtenNodes.add(state.nodeId);
  }
}
```

---

## 10. COMPOSITE NODES - SHOULD NOT BE WRITTEN

### 10.1 Current State

From engine.ts Line 218-226:

```typescript
this.updateState(node.id, {
  status: 'completed',
  result: {
    nodeId: node.id,
    decision,
    confidence,
    reasoning,
  },
});
```

**Composite nodes ARE given results!**

### 10.2 Why This Is Wrong

1. Composite nodes are NOT evaluated by LLM
2. Their decision is calculated from children
3. Writing them to evaluation_results is redundant
4. Storage waste: 1 composite with N children = N+1 rows (should be N)
5. Query complexity: Must filter to primitives when analyzing

### 10.3 Design Implications

The database should only have:
- evaluation_results: Only primitive node results
- evaluations: Overall metadata

To get composite decisions: Query children, apply operator

Current behavior:
- evaluation_results: Primitive + composite results
- evaluationStates: All node states during evaluation
- Database: Contains redundant info

---

## 11. RACE CONDITION ANALYSIS

### 11.1 Can Race Conditions Occur?

Context:
- evaluateWithGPT5() is async, calls OpenAI
- onStateUpdate callback is async, calls supabase
- Multiple primitives can be evaluating concurrently

```typescript
// Multiple nodes evaluating in parallel
Promise.all([
  evaluateNode(primitive1, ...),  // Calls GPT-5, gets result, calls callback
  evaluateNode(primitive2, ...),  // Calls GPT-5, gets result, calls callback
  evaluateNode(primitive3, ...)   // Calls GPT-5, gets result, calls callback
])
```

Each callback:
1. Reads writtenNodes.has(nodeId)
2. Reads from supabase
3. Writes to supabase
4. Writes writtenNodes.add(nodeId)

### 11.2 Race Condition Scenario

```
Thread 1: P1 completes
├─ updateState(P1, {completed})
├─ onStateUpdate called
├─ writtenNodes.has(P1) → false
├─ supabase.insert(P1)  [PENDING]
└─ [WAITING FOR DB]

Thread 2: P1 completes AGAIN (or same state update fires twice)
├─ updateState(P1, {completed})
├─ onStateUpdate called
├─ writtenNodes.has(P1) → false (Thread 1 hasn't added yet!)
├─ supabase.insert(P1)  [PENDING]
└─ [WAITING FOR DB]

Result: DUPLICATE INSERT ATTEMPT
```

### 11.3 Actual Risk Assessment

**LOW RISK** because:
1. JavaScript is single-threaded (event loop)
2. writtenNodes.add() is synchronous
3. updateState() is synchronous
4. onStateUpdate callback is async, but fires serially

**MEDIUM RISK** if:
1. Multiple evaluateNode() calls update same node
2. State updates reach database before writtenNodes.add() completes
3. Database constraints alone don't catch the race

**MITIGATION:**
- writtenNodes Set in memory (works for single request)
- Database UNIQUE constraint catches duplicates (error 23505)
- writtenNodes.add() even on 23505 error prevents retry

But: If two inserts happen simultaneously:
- Both pass writtenNodes.has() check
- Both reach database
- Database UNIQUE constraint rejects second
- Second update catches 23505, adds to writtenNodes
- No infinite loop, but both queries hit database

---

## 12. SSE STREAMING & CLIENT-SIDE INTEGRATION

### 12.1 Server-Sent Events Format

```
→ Server sends stream of events:

data: {"type":"progress","states":[...]}

data: {"type":"progress","states":[...]}

data: {"type":"complete","result":{"compliant":true,"states":[...]}}

→ Last event closes stream
```

### 12.2 Client-Side Processing (page.tsx)

```typescript
// Line 319-328: Initiate SSE
const response = await fetch('/api/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    evaluationId,
    prescriptiveNorm: pnDataList[0],
    sharedPrimitives,
    caseInput: `${useCase.title}\n\n${useCase.description}`,
  }),
});

// Line 332-335: Get reader
const reader = response.body?.getReader();
const decoder = new TextDecoder();

// Line 337-446: Process events
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));

      if (data.type === 'progress') {
        // Update UI with new states
        setEvaluationStatesMap(prev => 
          new Map(prev).set(evaluationId, data.states)
        );
      } else if (data.type === 'complete') {
        // Save final results to database (redundant!)
        // Both server and client save results
      }
    }
  }
}
```

### 12.3 REDUNDANT DATABASE WRITES

**Issue Found**: Client saves results AGAIN after evaluation completes!

```typescript
// page.tsx Line 405-430: Client saves results
for (const state of data.result.states) {
  if (state.result) {
    const { error: insertError } = await supabase
      .from('evaluation_results')
      .insert({
        evaluation_id: evaluationId,
        node_id: state.nodeId,
        decision: state.result.decision,
        confidence: state.result.confidence,
        reasoning: state.result.reasoning,
        citations: state.result.citations || [],
      });
  }
}
```

**Result:**
- Server writes results during evaluation (via callback)
- Client writes results again after evaluation completes
- Database UNIQUE constraint prevents duplicates (23505)
- Both operations succeed eventually, but redundant

---

## 13. COLUMN REFERENCE: What Gets Written Where

### 13.1 evaluation_results Columns Written

```typescript
const { error } = await supabase
  .from('evaluation_results')
  .insert({
    evaluation_id: evaluationId,     // UUID of parent evaluation
    node_id: state.nodeId,            // String node ID
    decision: state.result.decision,  // Boolean: true/false
    confidence: state.result.confidence, // Number: 0.0-1.0
    reasoning: state.result.reasoning,  // String: 2-3 sentences
    citations: state.result.citations || [], // JSONB array
    // id, created_at auto-generated
  });
```

### 13.2 evaluations Columns Written

**During evaluation creation (route.ts Line 310-316):**
```typescript
// Client creates initial row
const { data } = await supabase
  .from('evaluations')
  .insert({
    use_case_id: useCaseId,
    pn_ids: selectedPNs,
    status: 'pending',
    // triggered_at, id auto-generated
  })
```

**During evaluation (route.ts Line 170-178):**
```typescript
// Server updates after completion
await supabase
  .from('evaluations')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    progress_current: primitiveCount,  // Number of evaluated primitives
    progress_total: primitiveCount,    // Total primitive count
  })
  .eq('id', evaluationId);
```

**Note:** progress_current and progress_total are set to same value on completion

---

## 14. SUMMARY TABLE: Data Flow

| Stage | Input | Processing | Output | Side Effects |
|-------|-------|-----------|--------|--------------|
| 1. Request | HTTP POST body | Parse JSON | PrescriptiveNorm, SharedPrimitive[] | writtenNodes Set created |
| 2. Engine Init | PN + Shared | expandSharedRequirements() | Expanded node tree | evaluationStates Map init |
| 3. Traverse | Root node | evaluateNode() recursion | Boolean decisions | updateState() calls |
| 4. Primitive | Node + caseInput | buildPrompt() + GPT-5-mini | EvaluationResult | onStateUpdate callback |
| 5. Composite | Child results | Apply operator logic | EvaluationResult | onStateUpdate callback |
| 6. DB Write | EvaluationState | Filter completed + result | INSERT evaluation_results | writtenNodes.add() |
| 7. DB Update | Final state | Update evaluation row | SET status=completed | Stream closed |
| 8. Stream | All state updates | Filter to progress events | SSE events | Client receives updates |
| 9. Client Save | Received states | Parse + INSERT | evaluation_results duplicates | writtenNodes not available |

---

## 15. KEY METRICS & STATISTICS

### 15.1 Example Evaluation: Article 4 PN

Scenario: Simple PN with structure:
```
Root (allOf)
├─ Requirement 1 (primitive)
├─ Requirement 2 (allOf)
│  ├─ Sub-req 2a (primitive)
│  └─ Sub-req 2b (primitive)
├─ Requirement 3 (primitive)
└─ Requirement 4 (anyOf)
   ├─ Option A (primitive)
   └─ Option B (primitive)
```

**Counts:**
- Total nodes: 10
- Primitive nodes: 6
- Composite nodes: 4
- Max callback invocations: ~20 (2 per node: entering, completing)
- Expected DB rows written: 6 (if composite filter applied) or 10 (current)
- LLM calls: 6 (one per primitive)

**Timing:**
- Per LLM call: ~2-10 seconds (gpt-5-mini, reasoning_effort: high)
- Total LLM time: 6 × (2-10s) = 12-60 seconds
- Tree traversal overhead: Negligible (<100ms)
- Database writes: ~1 second per write (5-10 total)
- **Total evaluation time: ~15-70 seconds**

---

## 16. ARCHITECTURAL CONCERNS & RECOMMENDATIONS

### 16.1 Issues Identified

1. **Composite nodes written to database**
   - Solution: Filter to node.kind === 'primitive' before DB insert

2. **Client saves results again (redundant)**
   - Solution: Remove client-side save, trust server callback

3. **writtenNodes Set not used for composite filtering**
   - Solution: Use Set + node kind check

4. **Progress tracking unclear**
   - Current: progress_current/progress_total set to same value
   - Should: progress_current = evaluated, progress_total = all
   - Note: UI counts primitives directly from states, not from DB fields

5. **No pagination for large result sets**
   - If PN has 1000+ primitives, all written to DB
   - No chunking or batching visible

---

## 17. ARCHITECTURAL DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CLIENT INITIATION (page.tsx)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User clicks "Evaluate" → onTriggerEvaluation()                            │
│                                                                             │
│  1. Create evaluation row (pending)                                        │
│  2. Load PN bundle + expand shared requirements                            │
│  3. Prepare evaluation data structure                                      │
│  4. POST /api/evaluate with {PN, caseInput, evaluationId}                 │
│  5. Open SSE reader for progress stream                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    API ROUTE INITIALIZATION (route.ts)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Parse request body                                                      │
│  2. Create writtenNodes Set<string>                                        │
│  3. Create TransformStream for SSE                                         │
│  4. Start background async evaluation                                       │
│  5. Return streaming response immediately                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ async (background)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   EVALUATION ENGINE INITIALIZATION (engine.ts)              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. new EvaluationEngine(pn, sharedPrimitives, onStateUpdate)             │
│                                                                             │
│  2. expandSharedRequirements(nodes, sharedPrimitives)                      │
│     - Replaces primitive refs with composite wrappers                      │
│     - Adds shared primitive nodes to tree                                  │
│                                                                             │
│  3. buildNodeMap()                                                         │
│     - Creates Map<nodeId, RequirementNode>                                │
│     - Initializes evaluationStates Map<nodeId, EvaluationState>           │
│     - All states: { status: 'pending' }                                    │
│                                                                             │
│  4. Register onStateUpdate callback                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ engine.evaluate(caseInput, evaluateWithGPT5)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TREE TRAVERSAL RECURSIVE EVALUATION                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  evaluateNode(rootNode, caseInput, evaluateWithGPT5)                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ IF node.kind === 'PRIMITIVE'                                       │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │ 1. updateState(nodeId, { status: 'evaluating' })                 │  │
│  │    └─ onStateUpdate called with all current states                │  │
│  │                                                                     │  │
│  │ 2. buildPrompt(node, caseInput)                                   │  │
│  │    - Assemble: question + guidance + context + facts              │  │
│  │                                                                     │  │
│  │ 3. evaluateWithGPT5(prompt)                                       │  │
│  │    a. Check evalCache.get(sha256(prompt))                        │  │
│  │    b. If miss: call openai.chat.completions.create()            │  │
│  │       - model: 'gpt-5-mini'                                       │  │
│  │       - reasoning_effort: 'high'                                  │  │
│  │       - response_format: JSON                                     │  │
│  │    c. Parse response → { decision, confidence, reasoning }       │  │
│  │    d. Cache result                                                │  │
│  │                                                                     │  │
│  │ 4. updateState(nodeId, { status: 'completed', result: {...} })  │  │
│  │    └─ onStateUpdate called with all current states                │  │
│  │       └─ Database callback fires here!                            │  │
│  │                                                                     │  │
│  │ 5. Return result.decision (boolean)                               │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ IF node.kind === 'COMPOSITE'                                      │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │ 1. updateState(nodeId, { status: 'evaluating' })                 │  │
│  │    └─ onStateUpdate called                                        │  │
│  │                                                                     │  │
│  │ 2. For each childId in node.children:                             │  │
│  │    a. Get childNode from nodeMap                                  │  │
│  │    b. RECURSIVELY call evaluateNode(childNode, ...)             │  │
│  │    c. Collect result in childResults[]                           │  │
│  │    d. Short-circuit if applicable                                │  │
│  │                                                                     │  │
│  │ 3. Apply operator logic:                                          │  │
│  │    - allOf: all children true                                     │  │
│  │    - anyOf: any child true                                        │  │
│  │    - not:   negate first child                                    │  │
│  │    - xor:   exactly one child true                                │  │
│  │                                                                     │  │
│  │ 4. Calculate confidence = Math.min(...child confidences)         │  │
│  │                                                                     │  │
│  │ 5. updateState(nodeId, { status: 'completed', result: {...} })  │  │
│  │    └─ onStateUpdate called with all states                        │  │
│  │       └─ Callback ALSO processes this (but shouldn't save)       │  │
│  │                                                                     │  │
│  │ 6. Return decision (boolean)                                      │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  └─ RECURSION CONTINUES UNTIL ALL NODES EVALUATED                        │
│     (Depth-first traversal from root to all leaves)                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    [Multiple states & callbacks throughout]
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              ON EACH STATE UPDATE (onStateUpdate callback)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Called from: updateState() - AFTER each node status change                │
│  Receives: Array<EvaluationState> - ALL current states                    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ DATABASE WRITE PHASE                                               │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │                                                                      │ │
│  │ 1. Filter: completedStates = states.filter(s =>                   │ │
│  │             s.status === 'completed' && s.result)                 │ │
│  │                                                                      │ │
│  │ 2. For each completedState:                                        │ │
│  │                                                                      │ │
│  │    ┌─────────────────────────────────────────────────────────────┐ │ │
│  │    │ Check: if (!writtenNodes.has(state.nodeId))                 │ │ │
│  │    │                                                              │ │ │
│  │    │ YES → Try INSERT:                                           │ │ │
│  │    │       supabase.from('evaluation_results').insert({          │ │ │
│  │    │         evaluation_id: evaluationId,                        │ │ │
│  │    │         node_id: state.nodeId,                              │ │ │
│  │    │         decision: state.result.decision,                    │ │ │
│  │    │         confidence: state.result.confidence,                │ │ │
│  │    │         reasoning: state.result.reasoning,                  │ │ │
│  │    │         citations: state.result.citations || []             │ │ │
│  │    │       })                                                     │ │ │
│  │    │                                                              │ │ │
│  │    │ Result 1 (Success):                                         │ │ │
│  │    │   writtenNodes.add(state.nodeId)                           │ │ │
│  │    │   Log: "💾 [DB] Wrote result for X"                        │ │ │
│  │    │                                                              │ │ │
│  │    │ Result 2 (Error 23505 - Duplicate):                        │ │ │
│  │    │   writtenNodes.add(state.nodeId)                           │ │ │
│  │    │   Log: "⚠️ [DB] Skipped duplicate for X"                  │ │ │
│  │    │                                                              │ │ │
│  │    │ Result 3 (Other Error):                                    │ │ │
│  │    │   Log error, don't add to writtenNodes                     │ │ │
│  │    │                                                              │ │ │
│  │    │ NO → Already written, skip                                  │ │ │
│  │    └─────────────────────────────────────────────────────────────┘ │ │
│  │                                                                      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ SSE STREAM PHASE                                                   │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │                                                                      │ │
│  │ 1. writer.write(encoder.encode(                                    │ │
│  │      `data: ${JSON.stringify({                                     │ │
│  │        type: 'progress',                                           │ │
│  │        states: [...all current states...]                         │ │
│  │      })}\n\n`                                                      │ │
│  │    ))                                                               │ │
│  │                                                                      │ │
│  │ 2. Client SSE listener receives:                                  │ │
│  │    data: {"type":"progress","states":[...]}                      │ │
│  │                                                                      │ │
│  │ 3. Client updates UI:                                             │ │
│  │    setEvaluationStatesMap(prev =>                                 │ │
│  │      new Map(prev).set(evaluationId, data.states)                 │ │
│  │    )                                                                │ │
│  │                                                                      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                          [Loop repeats for each state update]
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EVALUATION COMPLETION (route.ts)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  After engine.evaluate() returns:                                          │
│                                                                             │
│  1. Get final result: { compliant: boolean, states: [...] }               │
│                                                                             │
│  2. Update evaluations table:                                             │
│     supabase.from('evaluations')                                          │
│       .update({                                                            │
│         status: 'completed',                                              │
│         completed_at: new Date().toISOString(),                          │
│         progress_current: primitiveCount,                                 │
│         progress_total: primitiveCount                                    │
│       })                                                                   │
│       .eq('id', evaluationId)                                             │
│                                                                             │
│  3. Send final SSE event:                                                 │
│     writer.write(encoder.encode(                                          │
│       `data: ${JSON.stringify({                                           │
│         type: 'complete',                                                 │
│         result: {...}                                                     │
│       })}\n\n`                                                            │
│     ))                                                                     │
│                                                                             │
│  4. Close stream:                                                         │
│     writer.close()                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SSE 'complete' event
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│            CLIENT FINAL PROCESSING & REDUNDANT SAVE (page.tsx)             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Receives: data.type === 'complete'                                        │
│                                                                             │
│  1. Already saved by server callback? YES                                  │
│  2. Save again anyway:                                                     │
│     For each state in data.result.states:                                 │
│       supabase.from('evaluation_results').insert({...})                   │
│       (Gets caught by UNIQUE constraint 23505)                            │
│                                                                             │
│  3. Remove from running evaluations:                                       │
│     setRunningEvaluations(prev => {...delete evaluationId...})            │
│                                                                             │
│  4. Call loadEvaluationResults(evaluationId)                              │
│     - Refresh results from database                                       │
│     - Update UI display                                                   │
│                                                                             │
│  5. Show final evaluation view with all primitive results                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 18. FINAL CONCLUSION

The evaluation API flow is a well-structured **streaming evaluation system** with these key characteristics:

**Strengths:**
- Clean separation: Engine logic vs. API layer
- Progressive state updates via callback
- Tree traversal handles arbitrary complexity
- SSE streaming provides real-time UI feedback
- Database unique constraint prevents duplicates

**Areas for Improvement:**
- Composite nodes shouldn't be written to database
- Client-side save is redundant
- No explicit node.kind filter before DB write
- Progress tracking could be more precise

**Data Flow:**
Request → Engine → Tree Traversal → State Callbacks → DB Writes + SSE → Client Display

**Critical Deduplication:**
writtenNodes.has(nodeId) check + DB unique (evaluation_id, node_id) constraint

