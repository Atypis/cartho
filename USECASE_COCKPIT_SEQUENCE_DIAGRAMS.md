# UseCaseCockpit Sequence Diagrams

## Diagram 1: Complete Evaluation Flow (User Perspective)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Cockpit as UseCaseCockpit
    participant DB as Supabase DB
    participant API as /api/evaluate
    participant Engine as EvaluationEngine
    participant GPT5 as GPT-5 API

    User->>Browser: Click "Evaluate PN-04"
    Browser->>Cockpit: runInlineEvaluation(['PN-04'])
    
    Cockpit->>DB: INSERT evaluations {status:'pending'}
    DB-->>Cockpit: id='eval-123'
    
    Cockpit->>DB: UPDATE status='running'
    
    Cockpit->>Cockpit: setRunningEvaluations({'eval-123'})
    Cockpit->>Cockpit: startPollingEvaluation('eval-123')
    
    Cockpit->>API: GET /api/prescriptive/bundle?pnIds=PN-04
    API-->>Cockpit: {pns, sharedPrimitives}
    
    Cockpit->>API: POST /api/evaluate {evaluationId, prescriptiveNorm, ...}
    
    Note over Cockpit: Function returns here<br/>(async processing)
    
    Note over API: Background processing starts
    API->>Engine: new EvaluationEngine(pn, shared)
    Engine->>Engine: expandSharedRequirements()
    
    loop For each primitive node
        API->>GPT5: POST chat/completions
        GPT5-->>API: {decision, confidence, reasoning}
        API->>DB: INSERT evaluation_results
    end
    
    API->>DB: UPDATE evaluations {status:'completed'}
    
    Note over Cockpit: Polling detects completion
    Cockpit->>DB: SELECT evaluations WHERE id='eval-123'
    DB-->>Cockpit: status='completed'
    
    Cockpit->>Cockpit: clearInterval(pollInterval)
    Cockpit->>Cockpit: loadUseCaseAndEvaluations()
    
    Cockpit->>DB: SELECT evaluations, SELECT evaluation_results
    DB-->>Cockpit: {evaluations, results}
    
    Cockpit->>Cockpit: buildPNStatusMapOptimized()
    Cockpit->>Cockpit: setPNStatuses([{PN-04, status:'applies'}])
    
    Cockpit-->>Browser: UI Updated
    Browser->>User: PN-04 now in "APPLIES" section (green)
```

---

## Diagram 2: Polling Loop Detail

```mermaid
sequenceDiagram
    participant Cockpit
    participant DB as Supabase
    participant Cache as Memory

    Note over Cockpit: startPollingEvaluation() called
    Cockpit->>Cache: bundleCache = null
    
    loop Every 1000ms
        Cockpit->>DB: SELECT * FROM evaluations WHERE id
        DB-->>Cockpit: {status:'running', ...}
        
        Cockpit->>DB: SELECT node_id FROM evaluation_results
        DB-->>Cockpit: [node1, node2, ...]
        
        alt If bundleCache is empty
            Cockpit->>Cockpit: Fetch /api/prescriptive/bundle
            Cockpit->>Cache: Store in bundleCache
        end
        
        Cockpit->>Cache: Get bundleCache
        Cache-->>Cockpit: bundle
        
        Cockpit->>Cockpit: expandSharedRequirements()
        Cockpit->>Cockpit: Count primitives = 12
        
        Cockpit->>Cockpit: Update evaluationProgress
        Cockpit->>Cockpit: setPNStatuses + triggerRender
        
        alt Status === 'completed'
            Cockpit->>Cockpit: clearInterval()
            Cockpit->>Cockpit: loadUseCaseAndEvaluations()
            break Exit loop
        end
    end
```

---

## Diagram 3: Live Expansion & Tree Update

```mermaid
sequenceDiagram
    actor User
    participant Cockpit
    participant Tree as RequirementsGrid
    participant DB
    participant DOM

    User->>Cockpit: Click expand arrow for PN-04
    Cockpit->>Cockpit: handleExpandPN('PN-04')
    Cockpit->>Cockpit: loadExpandedPNData('PN-04', 'eval-123')
    
    Cockpit->>DB: SELECT evaluation_results WHERE evaluation_id='eval-123'
    DB-->>Cockpit: [result1, result2, ...]
    
    Cockpit->>Cockpit: Load PN bundle
    Cockpit->>Cockpit: Expand shared requirements
    
    Cockpit->>Cockpit: Build evaluationStates
    Note over Cockpit: For each result: {status:'completed'}<br/>For missing: {status:'pending'}
    
    Cockpit->>Cockpit: setExpandedPNData({nodes, evaluationStates})
    Cockpit->>Tree: Render <RequirementsGrid/>
    
    Tree->>Tree: Render tree nodes
    alt During evaluation
        Tree->>Tree: startLiveUpdates('PN-04', 'eval-123')
        
        loop Every 1000ms
            Tree->>Cockpit: loadExpandedPNData()
            Cockpit->>DB: SELECT evaluation_results
            Cockpit-->>Tree: Updated evaluationStates
            Tree->>Tree: Re-render with new states
            Tree->>DOM: Update node colors + progress
        end
    end
    
    Tree-->>DOM: Render final tree
    User->>User: Sees results in tree
```

---

## Diagram 4: Result State Transitions

```mermaid
stateDiagram-v2
    [*] --> Pending: PN loaded
    
    Pending --> Evaluating: User clicks "Evaluate"
    
    Evaluating --> Evaluating: Poll detects results
    note right of Evaluating
        • evaluationProgress updates
        • Progress bar animates
        • Some nodes show results
    end
    
    Evaluating --> Completed: All results written
    note right of Completed
        • evaluationStates has all nodes
        • Tree renders with checkmarks/X
        • Auto-scroll to summary
    end
    
    Pending --> Unevaluated: No evaluation triggered
    
    Evaluating --> Failed: GPT-5 error
    Failed --> Pending: Retry
    
    Completed --> Pending: User clicks "Re-evaluate"
    
    Completed --> [*]: User navigates away
```

---

## Diagram 5: Data Flow Architecture

```mermaid
graph TB
    subgraph UI["User Interface"]
        CP["UseCaseCockpit<br/>Component"]
        RG["RequirementsGrid<br/>Component"]
        TN["TreeNode<br/>Component"]
    end
    
    subgraph Client["Client State"]
        PS["pnStatuses:<br/>PNStatus[]"]
        EP["evaluationProgress:<br/>Map"]
        RS["runningEvaluations:<br/>Set"]
        EPD["expandedPNData:<br/>Tree + States"]
    end
    
    subgraph Backend["Backend Services"]
        DB[(["Supabase DB<br/>(evaluations,<br/>evaluation_results)"])]
        API["API Routes<br/>evaluate<br/>bundle<br/>catalog"]
        ENG["EvaluationEngine"]
        LLM["GPT-5 API"]
    end
    
    subgraph Cache["Local Cache"]
        BC["Bundle<br/>Cache"]
    end
    
    CP -->|loadUseCaseAndEvaluations| DB
    CP -->|runInlineEvaluation| DB
    CP -->|startPollingEvaluation| DB
    CP -->|loadExpandedPNData| DB
    
    DB -->|State| PS
    PS -->|Render| CP
    
    CP -->|POST| API
    API -->|EvaluationEngine| ENG
    ENG -->|Call| LLM
    LLM -->|Result| ENG
    ENG -->|INSERT| DB
    
    CP -->|GET bundle| API
    API -->|Cache| BC
    BC -->|Reuse| CP
    
    CP -->|Polling| EP
    EP -->|Render| CP
    
    CP -->|Expand tree| RG
    RG -->|Render nodes| TN
    TN -->|Show| EPD
    
    DB -->|Real-time| CP
    
    style DB fill:#4a5f7f
    style LLM fill:#f0a000
    style ENG fill:#0f7f3f
    style BC fill:#7f5f00
```

---

## Diagram 6: State Machine - Evaluation Lifecycle

```mermaid
graph LR
    A["1. Create Evaluation<br/>{status: pending}"] 
    B["2. Start Polling<br/>bundleCache = null"]
    C["3. Trigger API<br/>(fire & forget)"]
    D["4. Poll #1<br/>results: 0/12"]
    E["5. API Processing<br/>(GPT-5 calls)"]
    F["6. DB Writes<br/>INSERT results"]
    G["7. Poll #N<br/>results: 5/12"]
    H["8. Final Poll<br/>status: completed"]
    I["9. Stop Polling<br/>Reload UI"]
    J["10. PN Status:<br/>applies/not-applicable"]
    K["11. Display Result<br/>Tree with checksmarks"]
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --|Loop 1s| G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L["END"]
    
    style E fill:#f0a000
    style F fill:#4a5f7f
    style G fill:#7f7f00
    style J fill:#0f7f3f
    style K fill:#7f0f7f
```

---

## Diagram 7: Bundle Caching Strategy

```mermaid
sequenceDiagram
    participant CockpitA as Evaluation<br/>Instance A
    participant Memory as Process Memory
    participant Disk as /api/bundle
    participant CockpitB as Evaluation<br/>Instance B

    rect rgb(200, 150, 255)
    Note over CockpitA: Evaluation A starts
    CockpitA->>Memory: bundleCache = null
    
    CockpitA->>Memory: if (!bundleCache)
    Memory-->>CockpitA: undefined
    
    CockpitA->>Disk: GET /api/prescriptive/bundle
    Disk-->>CockpitA: {pns, sharedPrimitives}
    CockpitA->>Memory: bundleCache = bundle
    end
    
    rect rgb(255, 200, 200)
    Note over CockpitB: Evaluation B (different ID, same PN)
    CockpitB->>Memory: bundleCache = null
    CockpitB->>Memory: if (!bundleCache)
    Memory-->>CockpitB: undefined
    CockpitB->>Disk: GET /api/prescriptive/bundle
    Disk-->>CockpitB: {pns, sharedPrimitives}
    CockpitB->>Memory: bundleCache = bundle
    end
    
    Note over CockpitA,CockpitB: Note: Each evaluation has ITS OWN<br/>bundleCache (local to function)<br/>NOT shared between instances
```

---

## Diagram 8: Node Status Flow (Single Primitive)

```mermaid
stateDiagram-v2
    [*] --> Pending: Initial state
    
    Pending --> Evaluating: API starts evaluating
    note right of Evaluating
        status: 'evaluating'
        UI shows spinner
        Node highlighted blue
    end
    
    Evaluating --> Completed: GPT-5 returns result
    note right of Completed
        status: 'completed'
        result: {decision, confidence, reasoning}
        DB row inserted
    end
    
    Completed --> Completed: Polling updates state
    note right of Completed
        No change if already completed
        UI shows checkmark/X
    end
    
    Completed --> [*]: Evaluation done
    
    Evaluating --> Error: GPT-5 fails
    Error --> Pending: Retry available
    
    Note: ISSUE: In tree view,<br/>nodes jump from 'pending' to 'completed'<br/>Never show 'evaluating' in loadExpandedPNData()
```

---

## Diagram 9: Multi-Source Truth Resolution

```mermaid
graph TB
    subgraph Sources["Data Sources"]
        S1["Source 1:<br/>evaluations.status<br/>(DB)"]
        S2["Source 2:<br/>evaluation_results<br/>(DB)"]
        S3["Source 3:<br/>pnStatuses<br/>(Client)"]
        S4["Source 4:<br/>Real-time sub<br/>(Supabase)"]
    end
    
    subgraph Readers["Who Reads What"]
        R1["startPollingEvaluation:<br/>reads S1"]
        R2["loadExpandedPNData:<br/>reads S2"]
        R3["UI rendering:<br/>reads S3"]
        R4["Real-time triggers:<br/>listens S4"]
    end
    
    subgraph Writers["Who Writes What"]
        W1["API: writes S1,S2"]
        W2["Cockpit: writes S1"]
        W3["buildPNStatusMapOptimized:<br/>reads S1+S2, writes S3"]
    end
    
    S1 --> R1
    S1 --> R4
    S2 --> R2
    S2 --> R4
    S3 --> R3
    S4 --> R4
    
    W1 --> S1
    W1 --> S2
    W2 --> S1
    W3 --> S1
    W3 --> S2
    W3 --> S3
    
    R4 -.->|triggers| W3
    R1 -.->|detects completion| W3
    
    style S1 fill:#4a5f7f
    style S2 fill:#4a5f7f
    style S3 fill:#7f5f00
    style S4 fill:#0f7f3f
    style W1 fill:#f0a000
    style W3 fill:#7f0f7f
```

---

## Diagram 10: Error Scenarios

```mermaid
graph TD
    A["Evaluation Started"] 
    
    A --> B{"API calls<br/>GPT-5"}
    
    B -->|Success| C["Result written to DB"]
    C --> D["Poll detects result"]
    D --> E["UI updates"]
    
    B -->|Timeout| F["Error caught in engine"]
    F --> G["Mark node as 'error'"]
    G --> H["Continue with next node"]
    H --> I["Some nodes complete,<br/>some error"]
    
    B -->|Network error| J["POST /api/evaluate fails"]
    J --> K["Evaluation marked 'failed'"]
    K --> L["Poll detects 'failed'"]
    L --> M["Stop polling"]
    M --> N["UI shows error"]
    N --> O["User can retry"]
    
    A --> P{"Polling timeout<br/>> 30s no results"}
    P -->|Yes| Q["Assume API hung"]
    Q --> R["User manually aborts"]
    R --> S["Clear runningEvaluations"]
    S --> N
    
    style C fill:#0f7f3f
    style G fill:#f0a000
    style K fill:#7f0000
    style N fill:#7f0000
    style O fill:#0f7f3f
```

END OF SEQUENCE DIAGRAMS
