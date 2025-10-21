# TREEMAXX Tree View: Rendering & Live Evaluation System

## Overview
TREEMAXX is a sophisticated tree visualization system that renders legal requirement hierarchies and displays live evaluation progress using a sophisticated state management and auto-update mechanism.

**Key Files:**
- `/components/evaluation/RequirementsGrid.tsx` - Main grid/tree container
- `/components/evaluation/RequirementBlock.tsx` - Individual requirement card
- `/lib/evaluation/types.ts` - Type definitions
- `/components/usecase/UseCaseCockpit.tsx` - Parent controller with polling/updates
- `/app/api/evaluate/route.ts` - Backend evaluation engine
- `/lib/evaluation/skip-logic.ts` - Smart evaluation skip logic

---

## 1. EvaluationState Object Shape

### Type Definition
```typescript
export interface EvaluationState {
  nodeId: string;           // Unique node identifier (e.g., "req-1-a-i")
  status: NodeStatus;       // 'pending' | 'evaluating' | 'completed' | 'error'
  result?: EvaluationResult;
  error?: string;
}

export interface EvaluationResult {
  nodeId: string;           // Reference to node being evaluated
  decision: boolean;        // true = passed/applies, false = failed/not-applies
  confidence: number;       // 0.0 - 1.0 confidence score
  reasoning: string;        // AI reasoning/explanation
  citations?: string[];     // Optional legal citations
}

export type NodeStatus = 'pending' | 'evaluating' | 'completed' | 'error';
```

### Lifecycle of States During Live Evaluation
```
Initial State (all nodes):
  status: 'pending'
  result: undefined

When evaluation starts on primitive node:
  status: 'evaluating'
  result: undefined

When LLM returns result:
  status: 'completed'
  result: { decision: true/false, confidence: 0.85, reasoning: "...", ... }

If error occurs:
  status: 'error'
  error: "Error message"
```

---

## 2. Component Hierarchy & Data Flow

```
UseCaseCockpit (Top-level state management)
├── useState: evaluationProgress (Map<evaluationId, { current, total }>)
├── useState: runningEvaluations (Set<evaluationId>)
├── useState: expandedPNData (nodes, evaluationStates, rootId)
│
└─► RequirementsGrid (Receives evaluationStates as prop)
    ├── Props:
    │   ├── nodes: RequirementNode[]
    │   ├── rootId: string
    │   ├── evaluationStates: EvaluationState[]  ◄─── KEY PROP
    │   ├── onNodeClick: (nodeId: string) => void
    │   ├── isRunning: boolean
    │   ├── totalNodes: number
    │   └── evaluationStatus: 'completed' | 'running'
    │
    ├── View Mode Selection
    │   ├── Grid View: RequirementBlock[] (horizontal layout)
    │   └── Tree View: TreeNode[] (vertical tree with recursion) ◄─── TREEMAXX
    │
    └─► TreeNode (Recursive tree component)
        ├── Props: (same as parent, plus depth & numberPrefix)
        ├── useState: isExpanded
        ├── useState: showDetails
        ├── useRef: nodeRef (for auto-scroll)
        │
        ├── Derived State:
        │   ├── state = evaluationStates.find(s => s.nodeId === node.id)
        │   ├── status = state?.status || 'pending'
        │   ├── isEvaluating = status === 'evaluating'
        │   ├── isPrimitive = node.kind === 'primitive'
        │   └── isActiveSubsumption = isEvaluating && isPrimitive ◄─── MAGIC!
        │
        ├── Auto-Behaviors (useEffect hooks)
        │   ├── [1] Auto-expand when completed
        │   ├── [2] Auto-show details for evaluating primitives
        │   ├── [3] Auto-select evaluating node
        │   └── [4] Auto-scroll to evaluating node
        │
        ├── Visual Rendering
        │   ├── Row: Status icon, label, operator badge, confidence
        │   ├── Details Panel: Question, context, reasoning
        │   └── AI Thinking Indicator (ONLY for isActiveSubsumption)
        │
        └─► Children (Recursive)
            └── TreeNode[] (depth + 1)
```

---

## 3. State Flow: How evaluationStates Propagate

### Top Level: UseCaseCockpit
```typescript
// 1. User clicks "Evaluate All"
// 2. Calls runInlineEvaluation(pnIds)

const runInlineEvaluation = async (pnIds: string[]) => {
  // 3. Create evaluation record in database
  const { data: evaluation } = await supabase
    .from('evaluations')
    .insert({ use_case_id, pn_ids: selectedPNs, status: 'pending' })
    .select().single();

  // 4. Add to running evaluations
  setRunningEvaluations(prev => new Set(prev).add(evaluation.id));

  // 5. Start polling for updates
  startPollingEvaluation(evaluation.id);

  // 6. Trigger API evaluation (non-blocking)
  fetch('/api/evaluate', {
    method: 'POST',
    body: JSON.stringify({
      prescriptiveNorm: pnData,
      sharedPrimitives: bundle.sharedPrimitives,
      caseInput: useCase.description,
      evaluationId: evaluation.id,
    }),
  });

  // 7. Reload PN data immediately
  await loadUseCaseAndEvaluations();
};
```

### Middle Level: Polling Loop
```typescript
// This runs every 1000ms while evaluation is running
const startPollingEvaluation = (evaluationId: string) => {
  const pollInterval = setInterval(async () => {
    // 1. Check evaluation status
    const { data: evaluation } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    // 2. Fetch all completed results from DB
    const { data: results } = await supabase
      .from('evaluation_results')
      .select('node_id')
      .eq('evaluation_id', evaluationId);

    // 3. Update local state with progress
    setEvaluationProgress(prev => {
      const newMap = new Map(prev);
      newMap.set(evaluationId, {
        current: results.length,
        total: totalPrimitives
      });
      return newMap;
    });

    // 4. If evaluation completed, reload to update UI
    if (evaluation.status === 'completed' || evaluation.status === 'failed') {
      clearInterval(pollInterval);
      await loadUseCaseAndEvaluations();
    }
  }, 1000); // Poll every 1 second
};
```

### Live Updates: Load Expanded Data
```typescript
// When user expands a PN to see the tree
const loadExpandedPNData = async (pnId: string, evaluationId: string) => {
  // 1. Fetch evaluation results from database
  const { data: results } = await supabase
    .from('evaluation_results')
    .select('*')
    .eq('evaluation_id', evaluationId);

  // 2. Load PN bundle (tree structure + shared primitives)
  const bundleRes = await fetch(`/api/prescriptive/bundle?pnIds=${pnId}`);
  const bundle = await bundleRes.json();
  const expandedNodes = expandSharedRequirements(
    bundle.pns[0].requirements.nodes,
    bundle.sharedPrimitives
  );

  // 3. MAP RESULTS TO EVALUATION STATES ◄─── CRITICAL STEP
  const evaluationStates: EvaluationState[] = (results || []).map((result: any) => ({
    nodeId: result.node_id,
    status: 'completed' as const,
    result: {
      nodeId: result.node_id,
      decision: result.decision,
      confidence: result.confidence || 0,
      reasoning: result.reasoning || '',
      citations: result.citations || [],
    },
  }));

  // 4. Mark nodes without results as pending
  const resultNodeIds = new Set((results || []).map((r: any) => r.node_id));
  for (const node of expandedNodes.filter(n => n.kind === 'primitive')) {
    if (!resultNodeIds.has(node.id)) {
      evaluationStates.push({
        nodeId: node.id,
        status: 'pending' as const,
      });
    }
  }

  // 5. Update state with complete tree data
  setExpandedPNData({
    evaluation,
    nodes: expandedNodes,
    rootId: pnData.requirements.root,
    evaluationStates,  ◄─── PASSED TO RequirementsGrid
  });
};
```

### Live Polling for Running Evaluations
```typescript
// When PN is expanded and evaluation is still running
const startLiveUpdates = (pnId: string, evaluationId: string) => {
  const pollInterval = setInterval(async () => {
    // 1. Check if still expanded and running
    if (expandedPNId !== pnId) {
      clearInterval(pollInterval);
      return;
    }

    const pnStatus = pnStatuses.find(p => p.pnId === pnId);
    if (!pnStatus || pnStatus.status !== 'evaluating') {
      clearInterval(pollInterval);
      return;
    }

    // 2. Reload the expanded data (fetches latest results from DB)
    await loadExpandedPNData(pnId, evaluationId);
    
    // 3. setExpandedPNData() called ──┐
    // 4. React re-renders RequirementsGrid ──┐
    // 5. evaluationStates prop updated ──┐
    // 6. TreeNode components re-evaluate ──┐
  }, 1000); // Poll every 1 second during evaluation
};
```

---

## 4. RequirementsGrid Component: Stats & Progress Calculation

### Props Received
```typescript
interface RequirementsGridProps {
  nodes: RequirementNode[];                    // All nodes in tree
  rootId: string;                              // Root node ID
  evaluationStates: EvaluationState[];          // Live state of each node ◄─── KEY
  onNodeClick: (nodeId: string) => void;
  selectedNodeId?: string | null;
  isRunning?: boolean;                         // Evaluation still running?
  totalNodes?: number;                         // Total PRIMITIVE nodes to evaluate
  evaluationStatus?: string;                   // 'running' | 'completed' | etc
}
```

### Stats Calculation
```typescript
// FILTER ONLY PRIMITIVE NODES (composites are structural, not LLM-evaluated)
const primitiveNodes = nodes.filter(n => n.kind === 'primitive');
const primitiveStates = evaluationStates.filter(s => {
  const node = nodeMap.get(s.nodeId);
  return node?.kind === 'primitive';
});

// COUNT BY STATUS
const completed = primitiveStates.filter(s => s.status === 'completed').length;
const evaluating = primitiveStates.filter(s => s.status === 'evaluating').length;
const pending = primitiveStates.filter(s => s.status === 'pending').length;
const errors = primitiveStates.filter(s => s.status === 'error').length;

// COUNT BY DECISION (only for completed)
const passed = primitiveStates.filter(s => 
  s.status === 'completed' && s.result?.decision
).length;
const failed = primitiveStates.filter(s => 
  s.status === 'completed' && !s.result?.decision
).length;

// PROGRESS PERCENTAGE
const progress = (evaluationStatus === 'completed' && totalNodes > 0) 
  ? 100
  : (totalNodes > 0 ? (completed / totalNodes) * 100 : 0);
```

### Auto-Scroll Logic
```typescript
// Auto-scroll to summary card when evaluation completes
const isEvaluationFinished = allCompleted && !isRunning;

useEffect(() => {
  if (isEvaluationFinished && summaryCardRef.current) {
    console.log('📜 [Auto-scroll] Scrolling to summary card');
    summaryCardRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setSummaryExpanded(true);
  }
}, [isEvaluationFinished]);
```

### Applicability Status Determination
```typescript
const rootState = evaluationStates.find(s => s.nodeId === rootId);
const rootDecision = rootState?.result?.decision;

const applicabilityStatus = 
  !hasResults ? 'pending' :
  (isRunning || !isEvaluationFinished) ? 'evaluating' :
  rootDecision === true ? 'applies' :
  rootDecision === false ? 'does-not-apply' :
  'unknown';
```

---

## 5. TreeNode Component: The TREEMAXX Magic

### Key Derived Values
```typescript
const state = evaluationStates.find(s => s.nodeId === node.id);
const status = state?.status || 'pending';     // pending|evaluating|completed|error
const result = state?.result;
const isPrimitive = node.kind === 'primitive';
const isEvaluating = status === 'evaluating';

// THE SECRET SAUCE: isActiveSubsumption
// ONLY TRUE when a PRIMITIVE node is actively being evaluated by the AI
const isActiveSubsumption = isEvaluating && isPrimitive;
```

### Auto-Behaviors Triggered by isActiveSubsumption

#### [1] Auto-Expand When Completed
```typescript
useEffect(() => {
  if (status === 'completed' && !isExpanded && hasChildren) {
    setIsExpanded(true);  // Automatically expand to show results
  }
}, [status, isExpanded, hasChildren]);
```

#### [2] Auto-Show Details for Evaluating Primitives
```typescript
useEffect(() => {
  if (isActiveSubsumption && !showDetails) {
    setShowDetails(true);  // Show the details panel
  }
}, [isActiveSubsumption, showDetails]);
```

#### [3] Auto-Select Evaluating Node
```typescript
useEffect(() => {
  if (isActiveSubsumption && selectedNodeId !== node.id) {
    onNodeClick(node.id);  // Highlight this node in parent's state
  }
}, [isActiveSubsumption, selectedNodeId, node.id, onNodeClick]);
```

#### [4] Auto-Scroll to Evaluating Node
```typescript
useEffect(() => {
  if (isActiveSubsumption && nodeRef.current) {
    nodeRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });  // Smooth scroll this node into view
  }
}, [isActiveSubsumption]);
```

### Visual Rendering Based on Status

#### Status Icon Rendering
```typescript
{status === 'evaluating' && (
  <div className="relative">
    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <div className="absolute inset-0 w-4 h-4 border-2 border-blue-400 rounded-full animate-ping opacity-25" />
  </div>
)}

{status === 'completed' && result && (
  <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
    result.decision
      ? 'bg-gradient-to-br from-green-400 to-green-500 text-white'
      : 'bg-gradient-to-br from-red-400 to-red-500 text-white'
  }`}>
    {result.decision ? '✓' : '✗'}
  </div>
)}

{status === 'pending' && (
  <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300 bg-white" />
)}

{status === 'error' && (
  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
    <span className="text-xs font-bold text-red-600">!</span>
  </div>
)}
```

#### Row Styling Based on Status
```typescript
<div className={`
  transition-all duration-200
  ${
    isActiveSubsumption
      ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset animate-pulse shadow-lg z-10'
      : isSelected
      ? 'bg-blue-50/50'
      : ''
  }
  ${status === 'completed' && result?.decision ? 'bg-green-50/30' : ''}
  ${status === 'completed' && !result?.decision ? 'bg-red-50/30' : ''}
`}>
  {/* Main row with left border indicator */}
  <div className={`
    flex items-center gap-2 px-3 py-2 border-b border-neutral-100
    ${
      isActiveSubsumption
        ? 'border-l-4 border-l-blue-600 shadow-md bg-gradient-to-r from-blue-100 to-transparent'
        : isSelected
        ? 'border-l-4 border-l-blue-500 shadow-sm'
        : 'border-l-4 border-l-transparent'
    }
  `}>
```

#### AI Thinking Indicator (Only for isActiveSubsumption)
```typescript
{isActiveSubsumption && (
  <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-500 rounded animate-pulse">
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <div className="w-2.5 h-2.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <span className="font-semibold text-blue-900 text-xs">
        AI is analyzing this requirement...
      </span>
    </div>
    <div className="mt-1.5 text-blue-700 italic text-[10px]">
      Evaluating compliance based on legal context and case facts
    </div>
  </div>
)}
```

#### Confidence Badge
```typescript
{status === 'completed' && result && (
  <div className={`px-2 py-0.5 rounded text-xs font-semibold
    ${
      result.confidence >= 0.9 ? 'bg-green-100 text-green-700' :
      result.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-700' :
      'bg-orange-100 text-orange-700'
    }
  `}>
    {(result.confidence * 100).toFixed(0)}%
  </div>
)}
```

#### Child Stats (for composite nodes)
```typescript
const childStats = hasChildren && node.children ? {
  total: node.children.length,
  passed: node.children.filter(id => {
    const childState = evaluationStates.find(s => s.nodeId === id);
    return childState?.status === 'completed' && childState?.result?.decision;
  }).length,
  failed: node.children.filter(id => {
    const childState = evaluationStates.find(s => s.nodeId === id);
    return childState?.status === 'completed' && !childState?.result?.decision;
  }).length,
  evaluating: node.children.filter(id => {
    const childState = evaluationStates.find(s => s.nodeId === id);
    return childState?.status === 'evaluating';
  }).length,
} : null;
```

---

## 6. RequirementBlock Component (Grid View)

### Auto-Expansion Logic
```typescript
useEffect(() => {
  if (status === 'completed' && result && !isExpanded) {
    setIsExpanded(true);  // Auto-expand when result available
  }
}, [status, result]);
```

### Status-Based Styling
```typescript
function getStatusBorderClass(
  status: NodeStatus,
  result?: EvaluationResult,
  isSelected?: boolean
): string {
  const selectedClass = isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : '';

  if (status === 'evaluating') {
    return `border-blue-500 bg-blue-50 ${selectedClass}`;
  }
  if (status === 'completed') {
    return result?.decision
      ? `border-green-500 bg-green-50 ${selectedClass}`
      : `border-red-500 bg-red-50 ${selectedClass}`;
  }
  if (status === 'error') {
    return `border-red-600 bg-red-50 ${selectedClass}`;
  }
  return `border-neutral-200 ${selectedClass}`; // pending
}
```

### Status Icons
```typescript
if (isSkipped) {
  return <div className="w-5 h-5 rounded-full border-2 border-neutral-300 bg-neutral-100" />;
}

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

// ... error and pending cases
```

---

## 7. Skip Logic: Smart Evaluation Optimization

### When Nodes Are Grayed Out
```typescript
export function shouldSkipNode(
  nodeId: string,
  nodes: RequirementNode[],
  evaluationStates: EvaluationState[]
): boolean {
  // Get parent chain
  const parents = getParentChain(nodeId, nodes);

  for (const parentId of parents) {
    const parent = nodeMap.get(parentId);
    if (!parent) continue;

    // If parent is allOf and ANY child failed → skip remaining children
    if (parent.operator === 'allOf') {
      const failedSibling = parent.children?.find(childId => {
        const childState = evaluationStates.find(s => s.nodeId === childId);
        return childState?.status === 'completed' && 
               childState.result?.decision === false;
      });

      if (failedSibling && failedSibling !== nodeId) {
        const failedIndex = parent.children?.indexOf(failedSibling) ?? -1;
        const nodeIndex = parent.children?.indexOf(nodeId) ?? -1;
        if (nodeIndex > failedIndex) {
          return true;  // This node is skipped
        }
      }
    }

    // If parent is anyOf and ONE child passed → skip all other children
    if (parent.operator === 'anyOf') {
      const passedSibling = parent.children?.find(childId => {
        const childState = evaluationStates.find(s => s.nodeId === childId);
        return childState?.status === 'completed' && 
               childState.result?.decision === true;
      });

      if (passedSibling && passedSibling !== nodeId) {
        return true;  // This node is skipped
      }
    }
  }

  return false;
}
```

### Visual Indication of Skipped Nodes
```typescript
const isSkipped = shouldSkipNode(node.id, allNodes, evaluationStates);

<div className={`
  transition-all duration-300
  ${isSkipped ? 'opacity-60' : 'opacity-100'}  // Faded appearance
  ...
`}>
```

---

## 8. Backend: Evaluation Engine & API Route

### How Results Get to Database
```typescript
// In /app/api/evaluate/route.ts
const engine = new EvaluationEngine(
  prescriptiveNorm,
  sharedPrimitives,
  async (states) => {
    // This callback fires every time a node completes evaluation
    if (evaluationId) {
      const completedStates = states.filter(s => 
        s.status === 'completed' && s.result
      );

      for (const state of completedStates) {
        // Check if already written (cache)
        if (!writtenNodes.has(state.nodeId) && state.result) {
          // Write to database
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
            writtenNodes.add(state.nodeId);
            console.log(`💾 [DB] Wrote result for ${state.nodeId}`);
          }
        }
      }
    }

    // Stream progress update
    await writer.write(
      encoder.encode(`data: ${JSON.stringify({ type: 'progress', states })}\n\n`)
    );
  }
);
```

### Primitive Node Evaluation Flow
```typescript
private async evaluatePrimitive(
  node: RequirementNode,
  caseInput: string,
  evaluateFn: (prompt: string) => Promise<EvaluationResult>
): Promise<EvaluationResult> {
  // 1. Mark as evaluating
  this.updateState(node.id, { status: 'evaluating' });

  // 2. Build LLM prompt from node data
  const prompt = this.buildPrompt(node, caseInput);

  try {
    // 3. Call OpenAI API
    const result = await evaluateFn(prompt);

    // 4. Update state to completed
    this.updateState(node.id, {
      status: 'completed',
      result: { ...result, nodeId: node.id },
    });

    return result;
  } catch (error) {
    // 5. On error, mark as error
    this.updateState(node.id, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// updateState calls the onStateUpdate callback
private updateState(nodeId: string, update: Partial<EvaluationState>) {
  const current = this.evaluationStates.get(nodeId);
  if (current) {
    const updated = { ...current, ...update };
    this.evaluationStates.set(nodeId, updated);

    if (this.onStateUpdate) {
      this.onStateUpdate(Array.from(this.evaluationStates.values()));
      // ^^^ This triggers the API callback which writes to DB + streams progress
    }
  }
}
```

---

## 9. CSS Animation Classes Used

### Pulsing / Blinking Effects
- `animate-pulse` - Used for:
  - Active subsumption nodes (entire row)
  - Evaluating status badges
  - AI thinking indicators
  - Progress indicators

### Spinning / Loading
- `animate-spin` - Used for:
  - Status spinners (border rotation)
  - Current node indicator in progress bar
  - Expand/collapse buttons during transitions

### Border & Ring Effects
- `ring-2 ring-blue-400 ring-inset` - Active subsumption highlight
- `ring-offset-2` - Selected nodes
- `border-l-4` - Left border indicators (depth-based color coding)
  - `border-l-blue-600` - Active subsumption
  - `border-l-blue-500` - Selected
  - `border-l-transparent` - Neutral

### Transitions
- `transition-all duration-200` - Smooth state changes
- `transition-all duration-300` - Card expansions
- `transition-transform duration-200` - Icon rotations

### Gradient & Color Classes
- `bg-gradient-to-r from-blue-100 to-transparent` - Active node row
- `bg-gradient-to-br from-green-400 to-green-500` - Pass checkmark
- `bg-gradient-to-br from-red-400 to-red-500` - Fail X mark
- `shadow-lg shadow-md shadow-sm` - Depth indicators

---

## 10. Complete State Update Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│ USER INITIATES EVALUATION                                           │
│ UseCaseCockpit.runInlineEvaluation()                                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │ 1. Create Evaluation Record (DB)    │
         │    status: 'pending'                │
         │    pn_ids: ['PN-04']               │
         └────────────┬────────────────────────┘
                      │
                      ▼
         ┌─────────────────────────────────────┐
         │ 2. Update Local State               │
         │    setRunningEvaluations.add(id)   │
         │    startPollingEvaluation()         │
         └────────────┬────────────────────────┘
                      │
                      ▼
         ┌─────────────────────────────────────┐
         │ 3. Call /api/evaluate               │
         │    (non-blocking, fire & forget)    │
         └────────────┬────────────────────────┘
                      │
         ┌────────────┴─────────────┐
         │                          │
         ▼                          ▼
    BACKEND                    FRONTEND POLLING
    ┌──────────────────┐       ┌───────────────────┐
    │ Evaluation Engine│       │ Poll every 1s:    │
    │ ├─ Expand shared │       │ SELECT results    │
    │ ├─ Evaluate each │       │ FROM evaluation_  │
    │ │  primitive     │       │     results       │
    │ ├─ Mark status   │       │ setEvalProgress() │
    │ │  'evaluating'  │       └───────────────────┘
    │ ├─ Call LLM      │
    │ ├─ Mark status   │
    │ │  'completed'   │
    │ ├─ INSERT result │
    │ │  to DB         │
    │ └─ Callback()    │
    └──────────────────┘
         │
         ▼
    ┌──────────────────────────────────────┐
    │ Callback fires for each complete:    │
    │ INSERT evaluation_result row          │
    │ Stream progress update                │
    └──────────────────────────────────────┘
         │
         └───────────────────────┬───────────────────────┐
                                 │                       │
                                 ▼                       ▼
                            POLLING PICKS UP         USER EXPANDS PN
                            ┌──────────────────┐      ┌────────────────┐
                            │ Results visible  │      │ loadExpandedPN │
                            │ Count increases  │      │    Data()      │
                            │ Progress updates │      └────────┬───────┘
                            └────────────────┬─┘              │
                                             │                ▼
                                             │        ┌─────────────────┐
                                             │        │ Query results   │
                                             │        │ from DB         │
                                             │        └────────┬────────┘
                                             │                 │
                                             │                 ▼
                                             │        ┌─────────────────┐
                                             │        │ BUILD STATES:   │
                                             │        │ Map results to  │
                                             │        │ evaluation      │
                                             │        │ States[]        │
                                             │        └────────┬────────┘
                                             │                 │
                                             │                 ▼
                                             │        ┌─────────────────┐
                                             │        │ setExpanded     │
                                             │        │ PNData({        │
                                             │        │   nodes,        │
                                             │        │   evaluation    │
                                             │        │   States,       │
                                             │        │   ...           │
                                             │        │ })              │
                                             │        └────────┬────────┘
                                             │                 │
                    ┌────────────────────────┴─────────────────┼──────────┐
                    │                                          │          │
                    ▼                                          ▼          ▼
        ┌──────────────────────────────────┐    ┌──────────────────────┐ ▼
        │ REACT RE-RENDER TRIGGER          │    │ LIVE POLLING        │
        │ setEvaluationProgress()           │    │ startLiveUpdates()  │
        │ New Map state                    │    │ Query DB every 1s   │
        │ ──> RequirementsGrid re-renders  │    │ Call loadExpanded   │
        └──────┬───────────────────────────┘    │   PNData() again    │
               │                                │ ──> Re-renders with │
               ▼                                │     fresh states    │
    ┌──────────────────────────────────┐      └──────────────────────┘
    │ TREEMAXX VISUAL UPDATES          │
    │ ├─ evaluationStates prop changed │
    │ ├─ TreeNode finds matching state │
    │ ├─ Derives isActiveSubsumption   │
    │ ├─ useEffect hooks fire:         │
    │ │  ├─ Auto-select                │
    │ │  ├─ Auto-expand                │
    │ │  ├─ Auto-show-details          │
    │ │  └─ Auto-scroll                │
    │ ├─ Status icon updates:          │
    │ │  ├─ Spinning loader → Checkmark│
    │ │  └─ Pulsing outline            │
    │ ├─ Details panel shows:          │
    │ │  ├─ "AI is analyzing..."       │
    │ │  ├─ Question                   │
    │ │  ├─ Context                    │
    │ │  └─ AI reasoning               │
    │ └─ Confidence badge appears      │
    └──────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ WHEN EVALUATION COMPLETES:       │
    │ ├─ All results in DB              │
    │ ├─ Polling detects: status changed│
    │ ├─ Calls loadExpandedPNData()     │
    │ ├─ Re-renders with all states     │
    │ ├─ Summary card auto-scrolls      │
    │ └─ Shows applicability result     │
    └──────────────────────────────────┘
```

---

## 11. Visual State Summary Table

| Status | Icon | Colors | Animations | Behavior |
|--------|------|--------|-----------|----------|
| **pending** | ○ Circle border | `border-neutral-300` `bg-white` | None | Static, faded |
| **evaluating** | ⟳ Spinner | `border-blue-600` | `animate-spin` `animate-pulse` | Glowing, blue highlight, auto-scroll to view |
| **completed (✓)** | ✓ Checkmark | `green-400`-`green-500` gradient | None | Green background, expanded |
| **completed (✗)** | ✗ X mark | `red-400`-`red-500` gradient | None | Red background, expanded |
| **error** | ! Exclamation | `bg-red-100` `text-red-600` | None | Red faded, error message |
| **skipped** | ○ Circle border | `border-neutral-300` `bg-neutral-100` | None | Faded `opacity-60` |

---

## 12. Key Insights & Design Patterns

### Pattern 1: Callback-Based State Updates
The evaluation engine uses callbacks to notify the frontend of state changes, enabling real-time progress tracking without polling the backend.

### Pattern 2: Database as Source of Truth
All results persist to Supabase `evaluation_results` table. Polling fetches from DB to ensure consistency across clients.

### Pattern 3: Smart Composite Rendering
Composite nodes are NOT sent to LLM; they're calculated from their children's results:
- `allOf`: passes if ALL children pass
- `anyOf`: passes if ANY child passes

### Pattern 4: isActiveSubsumption Gate
Only primitive nodes actively being evaluated get the full "AI thinking" visual treatment:
- Blue pulsing outline
- Auto-scroll
- AI thinking message
- Details panel auto-opens

Composite nodes pass through quietly, updating their stats when children complete.

### Pattern 5: Layered Numbering
- Depth 0: `I, II, III` (Roman numerals, blue)
- Depth 1: `A, B, C` (Letters, indigo)
- Depth 2: `1, 2, 3` (Numbers, purple)
- Depth 3+: `a, b, c` (Lowercase)

### Pattern 6: Progress Calculation Precision
Progress = completed / totalNodes (not pending + evaluating), so:
- 0% when no nodes complete
- Jumps to final percentage when all nodes evaluated
- Handles short-circuit skips correctly

### Pattern 7: Real-Time Binding
Frontend polling + database persistence + React re-renders create a seamless live experience:
1. Backend writes result
2. Frontend polls DB every 1s
3. State updates
4. Component re-renders
5. Visual feedback appears

Total latency: ~1 second for visual update to appear in tree.

---

## 13. Debugging & Monitoring

### Console Logs to Watch
```
📊 [Grid Stats] - Overall grid progress
🎯 [Applicability Check] - Root decision tracking
📜 [Auto-scroll] - Summary card scrolling
🌳 [TreeNode] - Individual node status
⟳ [Polling] - Backend polling progress
💾 [DB] - Database write operations
🔄 [Live Updates] - Live polling for running evaluation
📂 [ExpandedData] - Loading expanded PN data
```

### React DevTools Inspection
1. Monitor `evaluationStates` prop on RequirementsGrid
2. Watch `isActiveSubsumption` calculation on TreeNode
3. Check `status` and `result` changes
4. Verify `useEffect` dependencies

---

## 14. Performance Optimizations

1. **In-Memory Cache**: `writtenNodes` Set prevents duplicate DB writes
2. **Bundle Caching**: Load PN structure once, reuse across polling
3. **Lazy Evaluation**: Only primitive nodes evaluated, composites calculated
4. **Smart Skip Logic**: Stop evaluating when result determined (allOf with failure, anyOf with pass)
5. **Polling Interval**: 1 second strikes balance between responsiveness and load

