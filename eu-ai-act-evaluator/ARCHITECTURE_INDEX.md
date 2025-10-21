# EU AI Act Evaluator - Complete Architecture Documentation Index

## Overview

This directory contains comprehensive documentation of the evaluation API flow architecture, including complete request-to-database tracing, state management, database schema, and identified issues.

**Total Documentation:** 2,342 lines across 3 files

---

## Quick Start

1. **New to the codebase?** Start with `FINDINGS_SUMMARY.md` (15 min read)
2. **Need visual diagrams?** See `ARCHITECTURE_DIAGRAMS.md` (visual reference)
3. **Deep dive required?** Read `EVALUATION_FLOW_ARCHITECTURE.md` (comprehensive)

---

## Documentation Files

### 1. FINDINGS_SUMMARY.md (409 lines, 9.5 KB)
**Quick reference guide covering all key concepts**

Contents:
- Quick architecture overview
- Request flow
- State lifecycle
- Callback mechanism
- Database schema
- WrittenNodes Set explanation
- Critical issues (3 main issues identified)
- Race condition analysis
- LLM integration
- SSE streaming
- Key metrics
- Data transformations
- Recommendations

**Best for:** Executive summary, issue understanding, quick lookup

---

### 2. EVALUATION_FLOW_ARCHITECTURE.md (1,269 lines, 55 KB)
**Comprehensive architectural documentation**

Contents:
- Executive summary
- Complete API route structure
- Evaluation engine initialization
- State management & callback mechanism
- Tree traversal algorithm
- LLM integration (GPT-5-mini)
- Database writes callback
- Complete request→database flow
- State emission patterns
- Critical findings (why duplicates occurred)
- Composite nodes analysis
- Race condition analysis
- SSE streaming details
- Column reference
- Summary table
- Key metrics
- Architectural concerns
- Complete ASCII diagrams
- Data flow analysis

**Best for:** Complete understanding, debugging, architecture decisions

---

### 3. ARCHITECTURE_DIAGRAMS.md (664 lines, 34 KB)
**Visual ASCII diagrams and flowcharts**

Contents:
- Complete request-to-database flow diagram
- State update & database write flow
- State lifecycle diagram
- Database write decision tree
- Callback invocation sequence
- Database schema relationships
- Data transformation pipeline
- WrittenNodes Set lifecycle
- Error handling flow
- WrittenNodes vs database constraints
- Composite nodes issue visualization
- Redundant client-side save visualization

**Best for:** Visual learners, presentations, understanding flow relationships

---

## Key Concepts

### API Route: /api/evaluate

**Files:**
- Implementation: `/app/api/evaluate/route.ts`
- Documentation: See EVALUATION_FLOW_ARCHITECTURE.md sections 1-2

**Key Points:**
- Accepts POST with: prescriptiveNorm, sharedPrimitives, caseInput, evaluationId
- Returns Server-Sent Events (SSE) stream
- Creates writtenNodes Set for deduplication
- Fires async evaluation in background

### Evaluation Engine

**Files:**
- Implementation: `/lib/evaluation/engine.ts`
- Documentation: See EVALUATION_FLOW_ARCHITECTURE.md sections 2-4

**Key Points:**
- Recursive tree traversal
- Two node types: primitive (LLM evaluated) and composite (calculated)
- updateState() callback fires on every state change
- Depth-first evaluation with short-circuit optimization

### Database Schema

**Files:**
- Types: `/lib/supabase/types.ts`
- Documentation: See EVALUATION_FLOW_ARCHITECTURE.md section 6.2-6.3

**Key Points:**
- evaluations table: Metadata + status
- evaluation_results table: Results per node (should be primitives only)
- UNIQUE (evaluation_id, node_id) constraint
- Error code 23505 = unique constraint violation

### WrittenNodes Set

**Files:**
- Implementation: `/app/api/evaluate/route.ts` line 49
- Documentation: See FINDINGS_SUMMARY.md section 7

**Key Points:**
- In-memory Set tracking nodeIds written to database
- Prevents duplicate inserts via O(1) lookup
- Process-scoped (not persisted)
- Works with database UNIQUE constraint as backup

---

## Critical Issues Found

### Issue 1: Composite Nodes Written to Database (HIGH PRIORITY)

**Location:** route.ts callback (lines 58-96) + engine.ts (lines 218-226)

**Problem:**
- Engine creates results for ALL nodes (primitives + composites)
- Callback doesn't filter by node.kind
- Composites written to evaluation_results table
- Should only have primitive results in DB

**Impact:** Database bloat (e.g., 134 rows instead of 19 primitives)

**Solution:**
```typescript
const node = nodeMap.get(state.nodeId);
if (node?.kind === 'primitive' && !writtenNodes.has(state.nodeId)) {
  // Insert to DB
}
```

### Issue 2: Client Saves Results Again (MEDIUM PRIORITY)

**Location:** page.tsx lines 405-430

**Problem:**
- Server callback writes results during evaluation
- Client writes same results again after receiving 'complete' event
- Database rejects duplicates (23505 error)
- Redundant queries

**Solution:** Remove client-side save, trust server callback

### Issue 3: WrittenNodes Doesn't Filter Composites (MEDIUM PRIORITY)

**Location:** route.ts lines 58-96

**Problem:**
- writtenNodes.has() only checks if already written
- Doesn't check node.kind === 'primitive'
- Composite nodes written once, then skipped
- No defense-in-depth filtering

**Solution:** Add node.kind check before DB write

---

## Data Flow Summary

```
HTTP POST Request
    ↓
Parse & create writtenNodes Set
    ↓
Initialize EvaluationEngine + expand shared requirements
    ↓
Tree traversal (recursive evaluateNode)
    ├─ Primitive: Call GPT-5-mini → updateState
    └─ Composite: Combine children → updateState
    ↓
onStateUpdate callback fires
    ├─ Filter: Only completed states with results
    ├─ Deduplicate: Check writtenNodes.has(nodeId)
    ├─ Write: INSERT to evaluation_results
    ├─ Track: writtenNodes.add(nodeId)
    └─ Stream: SSE progress event
    ↓
Update evaluations table status
    ↓
Send SSE 'complete' event
    ↓
Client receives → inserts again (redundant!)
    ↓
Final: Evaluation_results has N rows (or N+M if composites included)
```

---

## Database Write Timeline

For 3 primitives (P1, P2, P3) under allOf composite (C1):

| Time | Event | onStateUpdate Calls | DB Writes |
|------|-------|-------------------|-----------|
| T1 | P1: evaluating | 1 (no write) | - |
| T2 | P1: completed | 1 (write P1) | INSERT P1 |
| T3 | P2: evaluating | 1 (no write) | - |
| T4 | P2: completed | 1 (write P2) | INSERT P2 |
| T5 | P3: evaluating | 1 (no write) | - |
| T6 | P3: completed | 1 (write P3) | INSERT P3 |
| T7 | C1: evaluating | 1 (no write) | - |
| T8 | C1: completed | 1 (write C1?) | INSERT C1 (BUG!) |
| T9 | Complete | SSE event | - |
| T10 | Client receive | - | INSERT P1,P2,P3,C1 (redundant!) |

**Result:** 8 rows written (should be 3 primitives only)

---

## State Lifecycle

All nodes start as 'pending':

**Primitive nodes:**
```
pending → evaluating (before LLM call)
        → completed (after LLM returns)
        → OR error (if LLM fails)
```

**Composite nodes:**
```
pending → evaluating (before evaluating children)
        → completed (after children combined)
        → OR error (if child evaluation fails)
```

Each transition calls onStateUpdate with ALL current states.

---

## Performance Characteristics

**Example PN with 6 primitives, 4 composites (10 total nodes):**

- LLM calls: 6 (one per primitive)
- Callback invocations: ~20 (2 per node typically)
- State updates: ~20+ (each transition is an update)
- DB write attempts: 6+ (primitives, maybe composites)
- Time per LLM call: 2-10 seconds (gpt-5-mini, high reasoning)
- Total time: 15-70 seconds
- SSE events: 30+ progress + 1 complete

**Scaling:**
- Large PN with 1000 primitives: ~1000 DB writes (or more with composites)
- No visible batching/chunking in current code
- Each write is individual async operation

---

## Race Condition Risk Assessment

**Risk Level: LOW** (but mitigated)

**Why LOW:**
1. JavaScript single-threaded event loop
2. writtenNodes.add() is synchronous
3. updateState() is synchronous
4. Callbacks fire serially (not truly parallel)

**Potential Scenario:**
- Two callbacks reach `writtenNodes.has(nodeId)` before first adds to Set
- Both attempt INSERT
- Database UNIQUE constraint catches second
- Second gets error 23505, adds to writtenNodes anyway

**Mitigation:**
- writtenNodes Set prevents unnecessary DB queries
- Database UNIQUE constraint catches actual duplicates
- Error 23505 handled gracefully (logged, retry prevented)

---

## File Structure Reference

```
/app/api/evaluate/route.ts
├─ POST handler (line 25)
├─ writtenNodes Set creation (line 49)
├─ EvaluationEngine initialization (line 55)
└─ onStateUpdate callback (lines 58-96)

/lib/evaluation/engine.ts
├─ Constructor (line 23)
├─ buildNodeMap() (line 41)
├─ updateState() (line 56)
├─ evaluatePrimitive() (line 71)
├─ evaluateComposite() (line 145)
├─ evaluateNode() (line 234)
└─ evaluate() (line 252)

/lib/supabase/types.ts
├─ evaluations table type (line 89)
└─ evaluation_results table type (line 121)

/app/page.tsx
├─ runEvaluation() (line 250)
├─ SSE listener (line 337)
└─ Client-side save (line 405) [REDUNDANT]
```

---

## How to Use This Documentation

### For Understanding Architecture
1. Read FINDINGS_SUMMARY.md sections 1-5
2. View ARCHITECTURE_DIAGRAMS.md section 1-3
3. Read EVALUATION_FLOW_ARCHITECTURE.md sections 1-7

### For Debugging Issues
1. Check which issue relates to your problem
2. Look up in FINDINGS_SUMMARY.md section 8
3. Read detailed analysis in EVALUATION_FLOW_ARCHITECTURE.md sections 8-10
4. View relevant diagram in ARCHITECTURE_DIAGRAMS.md

### For Making Code Changes
1. Understand current flow (FINDINGS_SUMMARY.md)
2. Review affected sections (EVALUATION_FLOW_ARCHITECTURE.md)
3. Check data flow (ARCHITECTURE_DIAGRAMS.md section 7)
4. Consider impact on writtenNodes, callbacks, DB writes

### For Onboarding New Developers
1. Start with FINDINGS_SUMMARY.md (quick overview)
2. Show ARCHITECTURE_DIAGRAMS.md visual flow
3. Walk through EVALUATION_FLOW_ARCHITECTURE.md for deep dive
4. Point to specific code sections as needed

---

## Key Statistics

- **Total Lines of Code Documented:** 2,342
- **Files Analyzed:** 5 major files
- **Database Tables:** 2 (evaluations, evaluation_results)
- **Node Types:** 2 (primitive, composite)
- **State States:** 4 (pending, evaluating, completed, error)
- **Critical Issues Found:** 3
- **Callback Invocations per Evaluation:** 20-40+
- **SSE Events per Evaluation:** 30+
- **Maximum Depth Supported:** Unlimited (recursive)

---

## Recommendations for Improvement

1. **Add node.kind filter** before database writes (HIGH PRIORITY)
   - Prevent composite nodes in evaluation_results
   - See FINDINGS_SUMMARY.md section 8

2. **Remove client-side save** (MEDIUM PRIORITY)
   - Eliminate redundant queries
   - Trust server callback
   - See FINDINGS_SUMMARY.md section 8

3. **Improve progress tracking** (MEDIUM PRIORITY)
   - Update progress_current dynamically
   - Don't wait until completion
   - Match UI's primitive-only counting

4. **Consider batching for large PNs** (LOW PRIORITY)
   - Batch inserts if 1000+ primitives
   - May improve database write performance

5. **Document primitive vs composite semantics** (LOW PRIORITY)
   - Currently ambiguous
   - Add JSDoc comments
   - Clarify expectations

---

## Related Files in Codebase

- `/lib/evaluation/expand-shared.ts` - Shared requirement expansion
- `/lib/evaluation/types.ts` - Type definitions
- `/components/evaluation/RequirementsGrid.tsx` - UI filtering (line 84-89)
- `/components/usecase/UseCaseCockpit.tsx` - UI state management
- `/lib/supabase/client.ts` - Database client

---

## Document Metadata

- **Created:** 2025-10-21
- **Total Lines:** 2,342
- **Sections:** 18
- **Diagrams:** 12
- **Code Examples:** 50+
- **Issues Documented:** 3
- **Recommendations:** 5

---

## Navigation

- FINDINGS_SUMMARY.md → Start here for quick overview
- ARCHITECTURE_DIAGRAMS.md → Visual reference
- EVALUATION_FLOW_ARCHITECTURE.md → Complete deep dive
- ARCHITECTURE_INDEX.md → This file (overview)

---

**Last Updated:** 2025-10-21
**Status:** Complete - Ready for review and implementation
