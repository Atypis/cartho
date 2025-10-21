# TREEMAXX Component & Data Flow Diagrams

## 1. Component Hierarchy Tree

```
┌──────────────────────────────────────────────────────────────────────┐
│                        UseCaseCockpit                                │
│  State: evaluationProgress, runningEvaluations, expandedPNData      │
│  Functions: runInlineEvaluation, loadExpandedPNData, startLive...   │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             │ passes: nodes, evaluationStates, 
                             │ rootId, isRunning, totalNodes
                             │
                    ┌────────▼──────────┐
                    │ RequirementsGrid  │
                    │ ┌────────────────┐│
                    │ │ View Mode:     ││
                    │ │ ├─ Grid        ││
                    │ │ └─ Tree        ││
                    │ └────────────────┘│
                    └────────┬──────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
         Grid View                     Tree View (TREEMAXX)
              │                             │
         ┌────▼────┐                   ┌────▼─────────┐
         │Requirement Block    │   │    TreeNode (Recursive)       │
         │ (Horizontal)        │   │    ├─ Derived:                │
         │ ├─ Auto-expand      │   │    │  ├─ state               │
         │ ├─ Status icon      │   │    │  ├─ isEvaluating        │
         │ ├─ Pass/Fail        │   │    │  ├─ isPrimitive         │
         │ └─ Children (nested)│   │    │  └─ isActiveSubsumption │
         └────────────────────┘   │    ├─ useEffects:             │
                                   │    │  ├─ Auto-expand         │
                                   │    │  ├─ Auto-select         │
                                   │    │  ├─ Auto-show-details   │
                                   │    │  └─ Auto-scroll         │
                                   │    └─ Visual:                │
                                   │       ├─ Status icon (spin/✓/✗)
                                   │       ├─ Blue pulse ring      │
                                   │       ├─ Left border color    │
                                   │       ├─ AI thinking message  │
                                   │       └─ Details panel        │
                                   │                               │
                                   │    ┌─────────────────────────┐
                                   └───►│ Children: TreeNode[]    │
                                        │ (Recursive, depth + 1)   │
                                        └─────────────────────────┘
```

---

## 2. Data Flow: From Evaluation to Screen

```
┌────────────────────────────────────────────────────────────────────┐
│                        EVALUATION STARTS                           │
│ User clicks "Evaluate All" → runInlineEvaluation()                │
└────────────────────────────┬─────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    Backend              Frontend Polling    User Expands PN
    ┌──────────────┐     ┌───────────────┐   ┌────────────────┐
    │ Eval Engine  │     │ Every 1000ms: │   │ loadExpanded   │
    │ ├─ Evaluate  │     │ ├─ Query DB   │   │ PNData()       │
    │ │  primitive │     │ │  results    │   │ ├─ Fetch nodes │
    │ ├─ Update    │     │ └─ Set Eval   │   │ ├─ Fetch       │
    │ │  status    │     │   Progress()  │   │ │  results     │
    │ ├─ Call LLM  │     └───────────────┘   │ ├─ Build eval  │
    │ ├─ Callback  │                         │ │  States      │
    │ │  (write DB)│                         │ └─ setExpanded │
    │ └─ Next node │                         │   PNData()     │
    └──────┬───────┘                         └────────┬───────┘
           │                                          │
           ▼                                          ▼
    ┌─────────────────────┐               ┌──────────────────────┐
    │ DB: evaluation_     │               │ React Re-render      │
    │     results         │               │ RequirementsGrid     │
    │ (node_id, decision, │               │ Props changed:       │
    │  confidence,        │               │ ├─ evaluationStates  │
    │  reasoning)         │               │ └─ isRunning         │
    └─────────────────────┘               └──────────┬───────────┘
                                                     │
                                    ┌────────────────▼────────────────┐
                                    │ TreeNode Re-evaluate            │
                                    │ ├─ Find matching state          │
                                    │ │  from evaluationStates[]      │
                                    │ ├─ Derive values:               │
                                    │ │  status='evaluating'          │
                                    │ │  isPrimitive=true             │
                                    │ │  isActiveSubsumption=true     │
                                    │ └─ useEffect dependencies       │
                                    │    change → hooks fire!         │
                                    └────────────┬──────────────────┘
                                                 │
                ┌────────────────────────────────┼────────────────┐
                │                                │                │
                ▼                                ▼                ▼
    Auto-Expand When             Auto-Select              Auto-Scroll
    Completed                     Node                     to View
    ┌────────────────────┐   ┌─────────────────┐   ┌──────────────────┐
    │ if (status ===     │   │ if (isActive    │   │ if (isActive     │
    │   'completed'      │   │   Subsumption)  │   │  Subsumption)    │
    │   && hasChildren)  │   │ onNodeClick()   │   │ nodeRef.current  │
    │ setIsExpanded      │   │ (trigger        │   │ .scrollIntoView()│
    │  (true)            │   │  parent select) │   │ smooth scroll    │
    └────────────────────┘   └─────────────────┘   └──────────────────┘
                │                      │                     │
                ▼                      ▼                     ▼
    Visual: Expand arrow,   Visual: Blue highlight,   Scrolls to center
    show children           left border changes       of viewport


    Auto-Show Details
    ┌─────────────────────────────────────┐
    │ if (isActiveSubsumption              │
    │     && !showDetails)                 │
    │ setShowDetails(true)                 │
    │                                     │
    │ Visual: Details panel expands        │
    │ Shows: Question, Context, "AI is    │
    │ analyzing...", Spinner animation    │
    └─────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────────────────────┐
    │                VISUAL FEEDBACK TO USER                │
    │                                                         │
    │ ├─ Spinning loader icon (blue spinner)               │
    │ ├─ Blue pulsing ring-2 ring-blue-400 ring-inset      │
    │ ├─ Left border: border-l-4 border-l-blue-600         │
    │ ├─ Row background: bg-gradient from-blue-100         │
    │ ├─ Shadow and z-10 for prominence                    │
    │ ├─ Smooth scroll into center of viewport             │
    │ ├─ Details panel: "AI is analyzing..."               │
    │ │  with spinner and pulse animation                  │
    │ ├─ Shows:                                            │
    │ │  • Question being evaluated                        │
    │ │  • Legal context                                   │
    │ │  • Full node reasoning (when complete)             │
    │ └─ Confidence badge (when result ready)              │
    │    • Green 90%+ • Yellow 70-90% • Orange <70%        │
    └─────────────────────────────────────────────────────────┘
             │
             ▼
    (Node finishes, status → 'completed')
             │
    ┌────────▼──────────────┐
    │ Spinner → Checkmark   │
    │ or X Mark             │
    │ ├─ Passed: Green ✓    │
    │ └─ Failed: Red ✗      │
    │ Blue pulse ring fades │
    │ Details stay open     │
    └──────────────────────┘
```

---

## 3. EvaluationState Lifecycle

```
                        ┌─────────────────────┐
                        │   EvaluationState   │
                        │  nodeId: "req-1-a"  │
                        │  status: string     │
                        │  result?: object    │
                        │  error?: string     │
                        └─────────┬───────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌────────────┐ ┌────────────┐ ┌──────────┐
            │  Pending   │ │ Evaluating │ │Completed │
            │ (Initial)  │ │ (Running)  │ │(Got data)│
            ├────────────┤ ├────────────┤ ├──────────┤
            │ status:    │ │ status:    │ │ status:  │
            │'pending'   │ │'evaluating'│ │'completed
            │            │ │            │ │'          │
            │ result:    │ │ result:    │ │ result: {│
            │ undefined  │ │ undefined  │ │  decision
            │            │ │            │ │   : true │
            │ error:     │ │ error:     │ │  confid: │
            │ undefined  │ │ undefined  │ │  0.85    │
            │            │ │            │ │  reason: │
            │            │ │            │ │  "..."   │
            └────────────┘ └────────────┘ └──────────┘
                    │             │             │
                    │ (Backend    │ (LLM       │ (Final
                    │ starts      │  returns)  │  state)
                    │ evaluation) │            │
                    └─────────────┼────────────┘
                                  │
                        ┌─────────▼──────────┐
                        │     Or Error       │
                        ├────────────────────┤
                        │ status: 'error'    │
                        │ result: undefined  │
                        │ error: "Network..." │
                        └────────────────────┘
```

---

## 4. TreeNode Decision Tree: When Visual Updates Trigger

```
TreeNode Re-render
│
├─ Find matching EvaluationState
│  └─ state = evaluationStates.find(s => s.nodeId === node.id)
│
├─ Extract status
│  └─ status = state?.status || 'pending'
│
├─ Is it primitive?
│  ├─ YES:
│  │  ├─ isEvaluating = status === 'evaluating'
│  │  │
│  │  ├─ isActiveSubsumption = true (if evaluating)
│  │  │  │
│  │  │  ├─ AUTO-BEHAVIORS ENABLED ◄──── MAGIC!
│  │  │  │  ├─ useEffect #1: Auto-expand (if completed + hasChildren)
│  │  │  │  ├─ useEffect #2: Auto-show-details (if isActiveSubsumption)
│  │  │  │  ├─ useEffect #3: Auto-select (if isActiveSubsumption)
│  │  │  │  └─ useEffect #4: Auto-scroll (if isActiveSubsumption)
│  │  │  │
│  │  │  ├─ VISUAL STYLING UPDATED
│  │  │  │  ├─ Ring: ring-2 ring-blue-400 ring-inset
│  │  │  │  ├─ Pulse: animate-pulse
│  │  │  │  ├─ Shadow: shadow-lg z-10
│  │  │  │  ├─ Background: bg-blue-50 from-blue-100
│  │  │  │  └─ Border: border-l-blue-600
│  │  │  │
│  │  │  ├─ ICON SHOWS SPINNER
│  │  │  │  ├─ Class: border-blue-600 animate-spin
│  │  │  │  ├─ Inner: border-blue-400 animate-ping
│  │  │  │  └─ Opacity: opacity-25
│  │  │  │
│  │  │  └─ DETAILS PANEL VISIBLE
│  │  │     ├─ Section: "AI is analyzing this requirement..."
│  │  │     ├─ Spinner: animated in description
│  │  │     ├─ Context: bg-blue-50 border-l-blue-500
│  │  │     ├─ Animation: animate-pulse
│  │  │     └─ Italic: "Evaluating compliance based on..."
│  │  │
│  │  ├─ status === 'completed'
│  │  │  │
│  │  │  ├─ ICON SHOWS RESULT
│  │  │  │  ├─ if (result.decision === true):
│  │  │  │  │  └─ Class: bg-gradient from-green-400 to-green-500 ✓
│  │  │  │  │
│  │  │  │  └─ if (result.decision === false):
│  │  │  │     └─ Class: bg-gradient from-red-400 to-red-500 ✗
│  │  │  │
│  │  │  ├─ BACKGROUND TINTED
│  │  │  │  ├─ if passed: bg-green-50/30
│  │  │  │  └─ if failed: bg-red-50/30
│  │  │  │
│  │  │  └─ CONFIDENCE BADGE APPEARS
│  │  │     ├─ if confidence >= 0.9: bg-green-100 text-green-700
│  │  │     ├─ if confidence 0.7-0.9: bg-yellow-100 text-yellow-700
│  │  │     └─ if confidence < 0.7: bg-orange-100 text-orange-700
│  │  │
│  │  └─ status === 'error'
│  │     ├─ ICON: red circle with !
│  │     ├─ Background: red-50
│  │     └─ Display: error message in details
│  │
│  └─ NO (composite):
│     ├─ isActiveSubsumption = false (composites not evaluated)
│     ├─ Shows operator badge: ALL | ANY | XOR
│     └─ Shows child stats: ✓5 ✗2 ⟳1
│
└─ Render recursive children (if expanded)
   └─ TreeNode[] with depth + 1
```

---

## 5. State Update Sequence During Live Evaluation

```
Time:  0ms
       ┌─────────────────────────────────────────────┐
       │ User clicks "Evaluate All" for 1 PN        │
       │ → runInlineEvaluation(["PN-04"])           │
       └─────────────────────────────────────────────┘

Time:  10ms
       ┌─────────────────────────────────────────────┐
       │ Database: Create evaluation record         │
       │ status: "running", pn_ids: ["PN-04"]      │
       │                                             │
       │ Frontend: setRunningEvaluations.add(id)   │
       │ Frontend: startPollingEvaluation()         │
       └─────────────────────────────────────────────┘

Time:  15ms
       ┌─────────────────────────────────────────────┐
       │ API Call /api/evaluate (non-blocking)      │
       │ → Evaluation Engine starts                 │
       │   • Load nodes, expand shared references   │
       │   • Find root requirement node             │
       │   • Begin traversing tree                  │
       └─────────────────────────────────────────────┘

Time:  1000ms (first poll interval)
       ┌─────────────────────────────────────────────┐
       │ Frontend: Poll database                    │
       │ → SELECT COUNT FROM evaluation_results     │
       │ → 0 rows (backend still evaluating)        │
       │ → setEvaluationProgress(0 / 5)             │
       └─────────────────────────────────────────────┘

Time:  2500ms
       ┌─────────────────────────────────────────────┐
       │ Backend: First primitive complete!         │
       │ → Mark status: 'completed'                 │
       │ → INSERT evaluation_results row            │
       │ → Callback fires                           │
       │ → setExpandedPNData (if user expanded)     │
       └─────────────────────────────────────────────┘

Time:  2501ms
       ┌─────────────────────────────────────────────┐
       │ Frontend (if expanded): Re-render!         │
       │ evaluationStates prop changed              │
       │ → New EvaluationState in array             │
       │ → TreeNode finds it via find()             │
       │ → status changes: 'pending' → 'completed'  │
       │ → result field populated                   │
       │ → Component re-renders                     │
       └─────────────────────────────────────────────┘

Time:  2502ms
       ┌─────────────────────────────────────────────┐
       │ TreeNode Visual Update                     │
       │ → Icon: spinner → checkmark ✓              │
       │ → Background: blue → green-50/30           │
       │ → Details: Reasoning now shown             │
       │ → Confidence: 92% green badge              │
       │ → Ring pulse fades (no longer evaluating)  │
       └─────────────────────────────────────────────┘

Time:  3000ms (second poll interval)
       ┌─────────────────────────────────────────────┐
       │ Frontend: Poll database                    │
       │ → SELECT COUNT FROM evaluation_results     │
       │ → 1 row now                                │
       │ → setEvaluationProgress(1 / 5)             │
       │ → Progress bar: 20%                        │
       └─────────────────────────────────────────────┘

Time:  3500ms
       ┌─────────────────────────────────────────────┐
       │ Backend: Second primitive complete!        │
       │ → (repeat steps at 2500ms)                 │
       └─────────────────────────────────────────────┘

...repeat for remaining primitives...

Time:  8000ms
       ┌─────────────────────────────────────────────┐
       │ Backend: All primitives complete           │
       │ → Evaluate root composite node             │
       │ → Root result determined: decision = true  │
       │ → Update evaluation_results for root       │
       │ → Update evaluation.status → "completed"   │
       └─────────────────────────────────────────────┘

Time:  9000ms (polling detects completion)
       ┌─────────────────────────────────────────────┐
       │ Frontend: Poll detects completion          │
       │ → evaluation.status === 'completed'        │
       │ → clearInterval(pollInterval)              │
       │ → setRunningEvaluations.delete(id)         │
       │ → await loadUseCaseAndEvaluations()        │
       │ → UI updates to show final status          │
       │ → Summary card auto-scrolls                │
       │ → "REQUIREMENT APPLIES" badge shown        │
       └─────────────────────────────────────────────┘
```

---

## 6. Skip Logic Visualization

```
Requirement Tree:
┌─ Root: allOf (ALL required) ────────────────────┐
│                                                  │
│  ├─ A: Primitive ──────────────────────────┐   │
│  │   Evaluates → PASS (✓)                 │   │
│  │   status: 'completed', decision: true  │   │
│  │   Visual: Green, ✓ checkmark           │   │
│  └──────────────────────────────────────┐ │   │
│                                         │ │   │
│  ├─ B: Primitive ──────────────────────┘ │   │
│  │   Evaluates → FAIL (✗)                │   │
│  │   status: 'completed', decision: false│   │
│  │   Visual: Red, ✗ X mark              │   │
│  └────────────────────┐                 │   │
│                       │                 │   │
│  ├─ C: Primitive ────┘  ◄──────────────┘   │
│  │   shouldSkipNode() = true                │
│  │   Reason: Parent is allOf, sibling B    │
│  │           failed, C comes after B        │
│  │   Visual: SKIPPED (opacity-60)          │
│  │   Status: 'pending' (not evaluated)     │
│  │   Icon: Circle border (grayed out)      │
│  └──────────────────────────────────────┐  │
│                                         │  │
│  └─ D: Primitive ◄───────────────────────┐ │
│      shouldSkipNode() = true                │
│      Visual: SKIPPED (opacity-60)          │
│      Icon: Circle border (grayed out)      │
└──────────────────────────────────────────┘

Result: A=✓, B=✗, C=SKIP, D=SKIP
Final decision for allOf: FAIL (✗)
Because at least one child (B) failed


────────────────────────────────────────────

Alternative: anyOf (ONE required):
┌─ Root: anyOf (ANY required) ───────────────────┐
│                                                 │
│  ├─ X: Primitive ──────────────────────────┐  │
│  │   Evaluates → PASS (✓)                 │  │
│  │   status: 'completed', decision: true  │  │
│  │   Visual: Green, ✓ checkmark           │  │
│  └──────────────────────────────────────┐ │  │
│                                         │ │  │
│  ├─ Y: Primitive ────────────────────────┘  │
│  │   shouldSkipNode() = true                │
│  │   Reason: Parent is anyOf, sibling X    │
│  │           already passed                │
│  │   Visual: SKIPPED (opacity-60)         │
│  │   Status: 'pending' (not evaluated)    │
│  │   Icon: Circle border (grayed out)     │
│  └──────────────────────────────────────┐  │
│                                         │  │
│  └─ Z: Primitive ◄─────────────────────┘   │
│      shouldSkipNode() = true                │
│      Visual: SKIPPED (opacity-60)          │
│      Icon: Circle border (grayed out)      │
└──────────────────────────────────────────┘

Result: X=✓, Y=SKIP, Z=SKIP
Final decision for anyOf: PASS (✓)
Because at least one child (X) passed
```

---

## 7. CSS Class Application by Status

```
Node Status: 'pending'
┌─────────────────────────────────────────────┐
│ Container:                                  │
│  • opacity-100                              │
│  • bg-white (no color tint)                 │
│  • border border-neutral-200                │
│  • border-l-4 border-l-transparent          │
│  • shadow-none (hover: shadow-md)           │
│                                             │
│ Icon:                                       │
│  • w-3.5 h-3.5                              │
│  • rounded-full                             │
│  • border-2 border-neutral-300              │
│  • bg-white                                 │
│  • No animation                             │
└─────────────────────────────────────────────┘

Node Status: 'evaluating' & isPrimitive
┌─────────────────────────────────────────────┐
│ Container:                                  │
│  • opacity-100                              │
│  • bg-blue-50                               │
│  • ring-2 ring-blue-400 ring-inset          │
│  • animate-pulse                            │
│  • shadow-lg z-10 (elevated)                │
│  • border-l-4 border-l-blue-600             │
│  • bg-gradient-to-r from-blue-100 to-...   │
│  • shadow-md                                │
│                                             │
│ Icon:                                       │
│  • w-4 h-4 border-2 (relative position)    │
│  • Inner: border-blue-600 border-t-...     │
│  • Inner: animate-spin                      │
│  • Outer: border-blue-400 animate-ping      │
│  • opacity-25                               │
│                                             │
│ Details Panel:                              │
│  • bg-blue-50 border-l-4 border-l-blue-500 │
│  • animate-pulse                            │
│  • Text: "AI is analyzing this requirement" │
└─────────────────────────────────────────────┘

Node Status: 'completed' & result.decision = true
┌─────────────────────────────────────────────┐
│ Container:                                  │
│  • opacity-100                              │
│  • bg-green-50/30 (tinted)                  │
│  • border border-green-500                  │
│  • border-l-4 border-l-transparent          │
│  • shadow-none (hover: shadow-md)           │
│                                             │
│ Icon:                                       │
│  • w-5 h-5 rounded-full                     │
│  • bg-gradient-to-br from-green-400         │
│  • to-green-500                             │
│  • text-white                               │
│  • shadow-sm                                │
│  • Contains: ✓ checkmark                    │
│                                             │
│ Confidence Badge:                           │
│  • bg-green-100 text-green-700              │
│  • (or yellow/orange if lower confidence)   │
│  • px-2 py-0.5 rounded text-xs font-...     │
└─────────────────────────────────────────────┘

Node Status: 'completed' & result.decision = false
┌─────────────────────────────────────────────┐
│ Container:                                  │
│  • opacity-100                              │
│  • bg-red-50/30 (tinted)                    │
│  • border border-red-500                    │
│  • border-l-4 border-l-transparent          │
│                                             │
│ Icon:                                       │
│  • w-5 h-5 rounded-full                     │
│  • bg-gradient-to-br from-red-400           │
│  • to-red-500                               │
│  • text-white                               │
│  • shadow-sm                                │
│  • Contains: ✗ X mark                       │
└─────────────────────────────────────────────┘

Node Skipped (shouldSkipNode = true)
┌─────────────────────────────────────────────┐
│ Container:                                  │
│  • opacity-60 (faded appearance)            │
│  • All other classes same as 'pending'      │
│  • No interaction allowed                   │
│  • Grayed out visually                      │
│                                             │
│ Icon:                                       │
│  • w-3.5 h-3.5 rounded-full                 │
│  • border-2 border-neutral-300              │
│  • bg-neutral-100 (more faded)              │
└─────────────────────────────────────────────┘
```

---

## 8. Polling & Update Frequency

```
Browser Timeline During Evaluation:

0ms ├─ User clicks "Evaluate All"
    │
10ms├─ API call sent to /api/evaluate
    │
100ms├─ Backend processes starts
    │
1000ms├─ [POLL #1] Frontend queries DB → 0 results
    │  └─ setEvaluationProgress(0/5)
    │
1500ms├─ Backend: First node completes
    │  └─ INSERT evaluation_results (if user viewing)
    │
2000ms├─ [POLL #2] Frontend queries DB → 1 result
    │  └─ setEvaluationProgress(1/5) = 20%
    │  └─ If expanded, live polling triggers
    │     └─ loadExpandedPNData() → updates states
    │        └─ React re-render → TreeNode visual update
    │           ├─ Icon: spinner → checkmark
    │           ├─ Background: blue → green
    │           └─ Details: shows reasoning
    │
3000ms├─ [POLL #3] Frontend queries DB → 2 results
    │  └─ setEvaluationProgress(2/5) = 40%
    │  └─ (repeat live polling if expanded)
    │
4000ms├─ [POLL #4] Frontend queries DB → 3 results
    │  └─ setEvaluationProgress(3/5) = 60%
    │
5000ms├─ [POLL #5] Frontend queries DB → 4 results
    │  └─ setEvaluationProgress(4/5) = 80%
    │
6000ms├─ [POLL #6] Backend: All primitives complete
    │  │          Evaluates root composite
    │  │
6500ms│  └─ Frontend queries DB → 5 results + root
    │     └─ setEvaluationProgress(5/5) = 100%
    │     └─ Status in DB: 'completed'
    │     └─ clearInterval(polling)
    │     └─ loadUseCaseAndEvaluations()
    │     └─ Summary card auto-scrolls
    │     └─ Shows applicability result
    │
Final: UI shows complete evaluation with all
       nodes displayed (green/red/skipped)
```

---

## 9. Composite Node Status Calculation

```
Composite Node: allOf (ALL children must pass)
├─ Child A: status='completed', decision=true  ✓
├─ Child B: status='completed', decision=true  ✓
├─ Child C: status='completed', decision=false ✗
└─ Composite Decision: false ✗

How it's displayed:
┌────────────────────────────────┐
│ Parent Node (Composite)        │
│ Label: "All requirements met"  │
│ Badge: "ALL required"          │
│ Status: calculated from kids   │
│ Icon: ✗ (red checkmark)        │
│ Child stats: 2✓ 1✗ 0⟳        │
│                                │
│ Background: red-50/30          │
│ Border: red-500                │
└────────────────────────────────┘

Composite Node: anyOf (ONE+ children must pass)
├─ Child X: status='completed', decision=true   ✓
├─ Child Y: status='pending' (skipped)          ⊘
└─ Composite Decision: true ✓

How it's displayed:
┌────────────────────────────────┐
│ Parent Node (Composite)        │
│ Label: "One requirement met"   │
│ Badge: "ANY required"          │
│ Status: calculated from kids   │
│ Icon: ✓ (green checkmark)      │
│ Child stats: 1✓ 0✗ 0⟳        │
│                                │
│ Background: green-50/30        │
│ Border: green-500              │
└────────────────────────────────┘
```

---

## 10. Error Handling & Recovery

```
Evaluation Error Scenario:
┌──────────────────────────────────────────┐
│ Backend encounters error during eval     │
│ e.g., API key expired, network timeout   │
└──────────────┬───────────────────────────┘
               │
        ┌──────▼──────┐
        │ Engine marks│
        │ status:     │
        │ 'error'     │
        └──────┬──────┘
               │
        ┌──────▼──────────────────┐
        │ Callback fires          │
        │ Only successful nodes   │
        │ written to DB           │
        │ Failed node skipped     │
        │ (due to cache check)    │
        └──────┬──────────────────┘
               │
        ┌──────▼──────────────────────────┐
        │ Frontend polling continues      │
        │ Detects partial results        │
        │ Displays what completed        │
        └──────┬───────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
 Success    Error      Pending
 nodes      node       nodes
   ✓          !          ○
 Green      Red-100    Neutral
 bg-50/30   icon       bg-white
            "error:    
            timeout"   

Partial Result Display:
├─ "Requirement A" → ✓ PASS
├─ "Requirement B" → ! ERROR (Network timeout)
│  └─ Details: "Error: Network timeout after 30s"
├─ "Requirement C" → ○ PENDING (never evaluated)
└─ Summary: "Evaluation failed partially.
             2 of 3 requirements evaluated."
```

---

## Summary: Key Takeaways

1. **isActiveSubsumption = evaluating && primitive** ← The magic gate
2. **UseEffects fire on dependency change** ← Auto-behaviors trigger
3. **Polling every 1000ms** ← Balances responsiveness vs load
4. **Database is source of truth** ← Persistent, cross-client
5. **Skip logic prevents unnecessary evaluation** ← Optimization
6. **Visual feedback is immediate** ← User sees progress in real-time
7. **Blue pulsing = "AI thinking"** ← Clear visual metaphor
8. **Green/Red = Pass/Fail** ← Intuitive results
9. **Details auto-expand for evaluating nodes** ← Context awareness
10. **Summary auto-scrolls when complete** ← Directs user attention

