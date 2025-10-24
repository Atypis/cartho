# EU AI Act Evaluator - Comprehensive Codebase Exploration

**Status:** Complete Architecture & Component Understanding  
**Date:** October 24, 2025  
**Scope:** Full-stack Next.js application with Supabase backend

---

## Table of Contents

1. [Overall Architecture](#overall-architecture)
2. [Frontend Framework & Structure](#frontend-framework--structure)
3. [Backend/API Structure](#backendapi-structure)
4. [Database Schema & Data Models](#database-schema--data-models)
5. [Assessment System](#assessment-system)
6. [Current UI/UX Components](#current-uiux-components)
7. [Prescriptive Norms (PNs) Implementation](#prescriptive-norms-pns-implementation)
8. [State Management](#state-management)
9. [Key Dependencies](#key-dependencies)
10. [Data Flow Patterns](#data-flow-patterns)
11. [Current Capabilities & Limitations](#current-capabilities--limitations)

---

## Overall Architecture

### High-Level Stack

```
┌─────────────────────────────────────────────┐
│        Frontend (React 19 + Next.js 15)     │
│  - Client components with hooks & state    │
│  - Server-side rendered pages               │
│  - Real-time Supabase subscriptions         │
└──────────────┬──────────────────────────────┘
               │ 
               ▼
┌─────────────────────────────────────────────┐
│    Backend APIs (Next.js API Routes)        │
│  - /api/evaluate (SSE streaming)            │
│  - /api/catalog (PN catalog)                │
│  - /api/obligations/* (obligation mgmt)     │
│  - /api/prescriptive/* (PN bundle)          │
│  - /api/usecase/* (use case analysis)       │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│   Database (Supabase PostgreSQL)            │
│  - Tables: evaluations, evaluation_results  │
│  - Tables: use_cases, obligation_instances  │
│  - Tables: shared_requirement_assessments   │
│  - Real-time subscriptions via Postgres     │
└─────────────────────────────────────────────┘

External Services:
  - OpenAI API (GPT-5-mini for evaluation)
  - Cartography Framework (PN definitions)
```

### Project Structure

```
eu-ai-act-evaluator/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main dashboard (850 lines)
│   ├── globals.css             # Tailwind styles
│   ├── api/
│   │   ├── evaluate/route.ts   # Evaluation engine entry point
│   │   ├── catalog/route.ts    # PN catalog endpoint
│   │   ├── prescriptive/
│   │   │   └── bundle/route.ts # Load PN + shared primitives
│   │   ├── obligations/
│   │   │   ├── route.ts        # Fetch obligations
│   │   │   ├── stats/route.ts  # Compliance stats
│   │   │   ├── by-use-case/    # Filter by use case
│   │   │   └── [id]/route.ts   # Individual obligation
│   │   ├── usecase/
│   │   │   └── analyze/route.ts# Analyze use case completeness
│   │   └── chat/route.ts       # Chat interface
│   ├── compliance-center/      # Executive dashboard
│   │   ├── page.tsx
│   │   └── obligations/
│   ├── dashboard/
│   │   └── page.tsx
│   └── evaluation-standalone/
│       └── page.tsx
│
├── components/
│   ├── evaluation/             # Display & interaction
│   │   ├── RequirementsGrid.tsx       # Main tree display (850+ lines)
│   │   ├── RequirementBlock.tsx       # Individual requirement card
│   │   ├── RequirementTree.tsx
│   │   ├── DetailPanel.tsx
│   │   └── EvaluationProgress.tsx
│   │
│   ├── usecase/                # Use case management
│   │   ├── UseCaseCockpit.tsx         # PN-centric dashboard (1300+ lines)
│   │   ├── UseCaseCreator.tsx
│   │   ├── UseCaseGallery.tsx
│   │   ├── ResultsCard.tsx            # Results summary
│   │   ├── TaskRow.tsx                # Individual task display
│   │   └── GroupCard.tsx
│   │
│   ├── compliance/             # Compliance management
│   ├── sidebar/                # Navigation
│   ├── chat/                   # Chat interface
│   ├── ai-elements/            # AI-powered components
│   └── ui/                     # Shadcn components
│
├── lib/
│   ├── evaluation/             # Core evaluation logic
│   │   ├── types.ts            # Type definitions
│   │   ├── engine.ts           # EvaluationEngine class
│   │   ├── expand-shared.ts    # Shared requirement expansion
│   │   ├── shared-cache.ts     # Caching mechanisms
│   │   ├── skip-logic.ts       # Short-circuit logic
│   │   ├── reconstruct.ts      # Evaluation reconstruction
│   │   └── layout-utils.ts
│   │
│   ├── supabase/               # Database client
│   │   ├── client.ts           # Supabase instance
│   │   └── types.ts            # Database types
│   │
│   ├── usecase/
│   │   └── types.ts            # Use case types
│   │
│   └── utils.ts
│
├── hooks/
│   └── evaluation/             # React hooks
│
├── stores/
│   └── useThemeStore.ts        # Zustand store
│
└── supabase/
    └── migrations/             # DB migrations
```

---

## Frontend Framework & Structure

### Technology Stack

- **Framework:** Next.js 15 with App Router
- **React Version:** 19.1.0
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI primitives + shadcn components
- **State Management:** Zustand (minimal) + React local state
- **Real-time:** Supabase Realtime subscriptions
- **Animations:** Motion.js

### Page Architecture

#### Main Page (`/app/page.tsx`)
- **Primary Entry Point:** Shows Welcome → Use Cases → Evaluations flow
- **State Management:** Map-based tracking for concurrent evaluations
  - `evaluationStatesMap`: Maps evaluation ID → states[]
  - `totalNodesMap`: Maps evaluation ID → total nodes
  - `runningEvaluations`: Set of active evaluation IDs

**Key States:**
```typescript
const [canvasView, setCanvasView] = useState<'welcome' | 'evaluation' | 'usecase-cockpit' | 'creator'>('welcome');
const [evaluationData, setEvaluationData] = useState<EvaluationResult | null>(null);
const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
const [runningEvaluations, setRunningEvaluations] = useState<Set<string>>(new Set());
```

**View Modes:**
- **Welcome:** Use case gallery + creation entry point
- **Creator:** New use case form
- **Usecase-Cockpit:** PN-centric evaluation dashboard
- **Evaluation:** Results & requirements tree display

#### Use Case Cockpit (`/components/usecase/UseCaseCockpit.tsx`)
- **Purpose:** Manage evaluations for a single use case
- **Size:** 1,300+ lines (largest component)
- **Features:**
  - Tab system for multiple open PNs
  - Batch evaluation with focus mode
  - Live progress tracking (SSE)
  - Obligation status management
  - Evaluation history

**Key State Structures:**
```typescript
interface PNStatus {
  pnId: string;
  article: string;
  title: string;
  status: 'applies' | 'not-applicable' | 'pending' | 'evaluating';
  evaluationId?: string;
  evaluatedAt?: string;
  rootDecision?: boolean;
  progressCurrent?: number;
  progressTotal?: number;
}

interface Group {
  id: string;
  title: string;
  article: string;
  description: string;
  shared_gates: string[];
  members: string[];  // PN IDs
}
```

#### Compliance Center (`/app/compliance-center/page.tsx`)
- **Purpose:** Executive dashboard for compliance posture
- **Metrics:** Applicability status, implementation status, risk distribution
- **Features:** KPI cards, progress bars, obligation listing

#### Requirements Grid (`/components/evaluation/RequirementsGrid.tsx`)
- **Purpose:** Display and interact with requirement tree
- **Size:** 850+ lines
- **Layout:** Horizontal root-level cards with vertical expansion
- **Features:**
  - Live progress tracking
  - Inline result display
  - Applicability status derivation
  - Auto-scroll to summary on completion
  - Summary card with applicability determination

### Component Hierarchy

```
Home (page.tsx)
├── AppSidebar
│   ├── NavMain
│   ├── NavProjects
│   └── NavUser
│
├── SidebarInset
│   ├── Breadcrumb (when not welcome)
│   │
│   └── [Current View]
│       ├── UseCaseGallery (welcome)
│       ├── UseCaseCreator (creator)
│       │
│       ├── UseCaseCockpit (usecase-cockpit)
│       │   ├── ResultsCard (applies/not-applicable sections)
│       │   │   └── TaskRow[] (groups & individual PNs)
│       │   ├── RequirementsGrid (inline when PN expanded)
│       │   │   └── RequirementBlock[] (tree nodes)
│       │   │
│       │   └── Tab System
│       │       └── TabData (cached PN bundles)
│       │
│       └── RequirementsGrid (evaluation view)
│           ├── Progress Bar
│           ├── Summary Card
│           └── RequirementBlock[] (tree)
│               ├── Question (for primitives)
│               ├── Context (definitions, guidance)
│               └── Result (decision, confidence, reasoning)
```

---

## Backend/API Structure

### API Routes

#### 1. **POST /api/evaluate** (Core Evaluation Engine)

**Purpose:** Run AI-powered evaluation on a use case against prescriptive norms

**Request Body:**
```typescript
{
  evaluationId: string;
  prescriptiveNorm: PrescriptiveNorm;
  sharedPrimitives: SharedPrimitive[];
  caseInput: string;  // Use case description
}
```

**Response Type:** Server-Sent Events (SSE)

**Flow:**
1. Initialize `EvaluationEngine` with PN and shared primitives
2. Expand shared requirements (e.g., `qp:is_provider`)
3. Start tree traversal from root
4. For each primitive node:
   - Call OpenAI GPT-5-mini with question + context
   - Receive decision (boolean), confidence, reasoning
   - Write to `evaluation_results` table
   - Emit progress SSE event
5. For composite nodes:
   - Aggregate child results using operator (allOf/anyOf/not/xor)
   - Short-circuit when possible
   - Mark skipped nodes
6. Emit completion event

**SSE Events:**
```typescript
// Progress
{ type: 'progress', states: EvaluationState[] }

// Completion
{ type: 'complete', result: { states, compliant } }

// Error
{ type: 'error', error: string }
```

#### 2. **GET /api/catalog**

**Purpose:** Fetch the catalog of all prescriptive norms grouped by category

**Response:**
```typescript
{
  groups: Group[];
  all_pns: PrescriptiveNorm[];
  grouped_pns: string[];  // PN IDs in groups
  ungrouped_pns: PrescriptiveNorm[];
  shared_primitives: SharedPrimitive[];
}
```

**Source:** Loaded from `../eu-ai-act-cartography/prescriptive-norms/`

#### 3. **GET /api/prescriptive/bundle**

**Purpose:** Load specific PN(s) with their shared primitives

**Query Params:**
```
?pnIds=PN-04,PN-05E
```

**Response:**
```typescript
{
  pns: PrescriptiveNorm[];
  sharedPrimitives: SharedPrimitive[];
}
```

#### 4. **GET /api/obligations**

**Purpose:** Query obligation instances with filtering

**Query Params:**
- `use_case_id`: Filter by use case
- `pn_id`: Filter by PN
- `applicability_state`: pending|evaluating|applies|not_applicable
- `implementation_state`: not_started|in_progress|compliant|partial|non_compliant|waived
- `risk_level`: low|medium|high|critical
- `limit`, `offset`: Pagination

**Response:**
```typescript
{
  obligations: ObligationInstance[];
  total: number;
  limit: number;
  offset: number;
}
```

#### 5. **GET /api/obligations/stats**

**Purpose:** Calculate compliance statistics

**Response:**
```typescript
{
  total: number;
  applicability: { pending, evaluating, applies, not_applicable };
  compliance: { not_started, in_progress, compliant, partial, non_compliant, waived };
  risk: { low, medium, high, critical, unassigned };
  deadlines: { upcoming, overdue };
  needsAttention: { highRiskNonCompliant, overdue, total };
}
```

#### 6. **POST /api/usecase/analyze**

**Purpose:** AI analysis of use case completeness

**Request:**
```typescript
{
  useCaseDescription: string;
}
```

**Response:**
```typescript
{
  completeness: number;  // 0-100
  extractedInfo: {
    systemPurpose?: string;
    technicalDetails?: string;
    useContext?: string;
    userRole?: string;
    geographicScope?: string;
  };
  coverageAreas: CoverageArea[];
  clarificationQuestions: ClarificationQuestion[];
  isComplete: boolean;
  structuredSummary?: StructuredSection[];
}
```

---

## Database Schema & Data Models

### Key Tables

#### 1. **use_cases**
```sql
CREATE TABLE use_cases (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_in_session_id UUID REFERENCES chat_sessions(id),
  tags TEXT[] DEFAULT '{}'
);
```

**Purpose:** Store AI system descriptions for evaluation

#### 2. **evaluations**
```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY,
  use_case_id UUID REFERENCES use_cases(id),
  pn_ids TEXT[] NOT NULL,  -- Array of PN IDs
  triggered_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  status 'pending' | 'running' | 'completed' | 'failed',
  error_message TEXT,
  triggered_in_session_id UUID REFERENCES chat_sessions(id)
);
```

**Purpose:** Track evaluation runs

**Status Lifecycle:** pending → running → completed/failed

#### 3. **evaluation_results**
```sql
CREATE TABLE evaluation_results (
  id UUID PRIMARY KEY,
  evaluation_id UUID REFERENCES evaluations(id),
  node_id TEXT NOT NULL,  -- Requirement node ID
  decision BOOLEAN NOT NULL,  -- Question answer
  confidence FLOAT NOT NULL,  -- 0-1
  reasoning TEXT NOT NULL,
  citations JSONB,
  created_at TIMESTAMP DEFAULT now()
  
  UNIQUE(evaluation_id, node_id)  -- One result per node per eval
);
```

**Purpose:** Store AI evaluation results

**Important:** Only primitive nodes are stored (composite nodes are computed from children)

#### 4. **obligation_instances**
```sql
CREATE TABLE obligation_instances (
  id UUID PRIMARY KEY,
  use_case_id UUID REFERENCES use_cases(id),
  pn_id TEXT NOT NULL,
  pn_title TEXT,
  pn_article TEXT,
  
  -- Applicability (from evaluation root decision)
  applicability_state 'pending' | 'evaluating' | 'applies' | 'not_applicable',
  latest_evaluation_id UUID REFERENCES evaluations(id),
  root_decision BOOLEAN,
  evaluated_at TIMESTAMP,
  
  -- Implementation (manual tracking)
  implementation_state 'not_started' | 'in_progress' | 'compliant' | 'partial' | 'non_compliant' | 'waived',
  owner_id TEXT,
  due_date DATE,
  risk_level 'low' | 'medium' | 'high' | 'critical',
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Purpose:** Track obligations for each use case

**Dual State Tracking:**
- **Applicability:** Whether the PN applies (computed from evaluation)
- **Implementation:** Compliance status (manual tracking for actions)

#### 5. **shared_requirement_assessments**
```sql
CREATE TABLE shared_requirement_assessments (
  id UUID PRIMARY KEY,
  use_case_id UUID REFERENCES use_cases(id),
  shared_key TEXT NOT NULL,  -- "primitiveId::nodeId"
  decision BOOLEAN,
  confidence FLOAT,
  reasoning TEXT,
  citations JSONB,
  source_evaluation_id UUID REFERENCES evaluations(id),
  pn_id TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(use_case_id, shared_key)  -- Cache per use case
);
```

**Purpose:** Cache shared requirement evaluations to reuse across PNs

#### 6. **obligation_status_history**
```sql
CREATE TABLE obligation_status_history (
  id UUID PRIMARY KEY,
  obligation_instance_id UUID REFERENCES obligation_instances(id),
  changed_by TEXT,
  from_state TEXT,
  to_state TEXT,
  kind 'applicability' | 'implementation',
  reason TEXT,
  changed_at TIMESTAMP DEFAULT now()
);
```

**Purpose:** Audit trail for obligation state changes

### Supporting Tables

- **chat_sessions:** Track AI chat conversations
- **chat_messages:** Store conversation history

---

## Assessment System

### Assessment Flow

```
User Creates Use Case
    ↓
[AI Analysis - optional clarification]
    ↓
User Selects PNs to Evaluate
    ↓
Trigger Evaluation (creates Evaluation record)
    ↓
[/api/evaluate starts]
    ↓
EvaluationEngine.evaluate()
    └─→ Tree Traversal
        └─→ For each Primitive:
            ├─→ Build Prompt (question + context + case facts)
            ├─→ Call GPT-5-mini
            ├─→ Parse Result
            ├─→ Write to evaluation_results
            ├─→ Emit SSE progress
            └─→ Update UI in real-time
    └─→ For each Composite:
        ├─→ Aggregate child results
        ├─→ Apply operator logic (allOf/anyOf/not/xor)
        ├─→ Handle short-circuit optimization
        └─→ Mark skipped nodes
    └─→ Calculate root decision (PN applicability)
    └─→ Emit completion event
    ↓
Create/Update obligation_instance
    ├─→ Set applicability_state based on root decision
    ├─→ Set root_decision
    ├─→ Create obligation_status_history record
    └─→ Set implementation_state = 'not_started' (if applies)
    ↓
Display Results in RequirementsGrid
    └─→ Show:
        ├─→ Progress (during evaluation)
        ├─→ Tree with results
        ├─→ Summary card with applicability status
        └─→ Obligation instance in UseCaseCockpit
```

### Prescriptive Norm Structure

**PrescriptiveNorm** represents a legal obligation from EU AI Act

```typescript
interface PrescriptiveNorm {
  id: string;                    // "PN-04", "PN-05E"
  title: string;                 // "AI Literacy"
  type: string;                  // "prohibition", "requirement"
  
  // Legal references
  article_refs: Array<{
    article: number;
    paragraph?: number;
    point?: string;
    quote?: string;
  }>;
  
  // Legal consequence
  legal_consequence: {
    verbatim: string;
    notes?: string;
    context?: Context;
  };
  
  // Evaluation tree
  requirements: {
    root: string;               // Root node ID (e.g., "R-1")
    nodes: RequirementNode[];
  };
  
  // Shared requirements referenced
  shared_refs?: string[];       // e.g., ["qp:is_provider", "qp:is_ai_system"]
  
  metadata: {
    version: string;
    status: string;
    extraction_date: string;
  };
}
```

### Requirement Node Types

```typescript
type NodeKind = 'composite' | 'primitive';
type Operator = 'allOf' | 'anyOf' | 'not' | 'xor';

interface RequirementNode {
  id: string;                    // "R-1", "R-1.1", "R-1.1.a"
  label: string;                 // "All provider elements hold"
  kind: 'composite' | 'primitive';
  
  // For composite nodes
  operator?: Operator;           // How to combine children
  children?: string[];           // Child node IDs
  
  // For primitive nodes (evaluated by LLM)
  question?: {
    prompt: string;              // The actual question
    answer_type: 'boolean';
    help?: string;               // Guidance for LLM
  };
  ref?: string;                  // Reference to shared primitive
  
  // Context
  context?: {
    items: Array<{
      label: string;
      kind: 'definition' | 'guidance' | 'exception' | 'note';
      text: string;
      sources?: SourceRef[];
    }>;
  };
  
  // Legal references
  sources?: SourceRef[];
  
  // Metadata for shared primitives
  sharedRequirement?: {
    primitiveId: string;
    nodeId: string;
  };
}
```

### Shared Primitives (QPs)

Reusable logical subtrees used across multiple PNs

```typescript
interface SharedPrimitive {
  id: string;                    // "qp:is_provider"
  title: string;                 // "Provider (Art. 3(2))"
  namespace: string;             // "qp"
  
  article_refs: Array<{
    article: number;
    paragraph?: number;
  }>;
  
  logic: {
    root: string;
    nodes: RequirementNode[];
  };
  
  metadata: {
    version: string;
    status: string;
    extraction_date: string;
  };
}
```

**Examples:**
- `qp:is_provider` - Determines if entity is an AI provider
- `qp:is_deployer` - Determines if entity is an AI deployer
- `qp:is_ai_system` - Determines if system is AI under Art. 3
- `qp:in_scope_art2` - Determines if in Article 2 scope

### Evaluation State Tracking

```typescript
type NodeStatus = 'pending' | 'evaluating' | 'completed' | 'error' | 'skipped';

interface EvaluationState {
  nodeId: string;
  status: NodeStatus;
  result?: {
    decision: boolean;
    confidence: number;           // 0-1
    reasoning: string;
    citations?: unknown;
  };
  error?: string;
}
```

### Key Concepts

#### 1. **Applicability vs. Compliance**
- **Applicability:** Does this PN apply to the use case? (computed from evaluation)
- **Implementation:** Is the organization compliant with the PN? (manual tracking)

#### 2. **Short-Circuit Optimization**
- In `allOf`: If any child fails, skip remaining children
- In `anyOf`: If any child succeeds, skip remaining children
- Marked as `status: 'skipped'`

#### 3. **Shared Requirement Expansion**
- When a node references a shared primitive (e.g., `ref: "qp:is_provider"`):
  - The primitive's full logic tree is expanded inline
  - Nodes are given prefixed IDs (e.g., `R-1.1-expanded.R-1.1.1`)
  - Reused in other PNs with same evaluation results
  - Cached in `shared_requirement_assessments`

---

## Current UI/UX Components

### 1. Welcome Screen (`UseCaseGallery`)
- Display existing use cases
- Create new use case button
- Quick access to previous evaluations

### 2. Use Case Creator (`UseCaseCreator`)
- Title and description form
- AI-powered completeness analysis
- Clarification questions
- Summary generation

### 3. Use Case Cockpit (`UseCaseCockpit`)
- **Main Section:**
  - Description with edit capability
  - Result cards (Applies / Not Applicable / Pending)
  
- **Each Result Card:**
  - Expandable/collapsible
  - Lists PNs or groups
  - Shows status badges
  - Progress indicators (for running evals)
  - Action buttons (Evaluate, View Details)

- **Tab System (for opened PNs):**
  - IDE-style tabs for multiple open evaluations
  - Switch between tabs to view inline RequirementsGrid
  - Cache bundle data to avoid re-fetching

- **Evaluation History:**
  - Toggle to show all past evaluations
  - Replay evaluation results

### 4. Requirements Grid (`RequirementsGrid`)
- **Header:**
  - Progress bar (during evaluation)
  - Completion status
  - Stats pills (passed/failed/skipped counts)

- **Summary Card:**
  - Applicability status determination
  - Legal consequence display
  - Decision logic explanation

- **Tree Display:**
  - Horizontal root-level cards
  - Vertical expansion for children
  - Number prefixes for navigation
  - Color-coded status indicators

### 5. Requirement Block (`RequirementBlock`)
- **Collapsed State:**
  - Label
  - Operator badge (if composite)
  - Status icon
  - Expand arrow

- **Expanded State:**
  - Full question (for primitive)
  - Context items with sources
  - Result card (decision, confidence, reasoning)
  - Children (nested RequirementBlock)

### 6. Compliance Center
- **KPI Cards:**
  - Total obligations
  - Compliance rate
  - High-risk issues
  - Upcoming deadlines

- **Breakdown Charts:**
  - Applicability status distribution
  - Implementation status breakdown
  - Risk distribution
  - Attention-needed items

### 7. Obligation Management
- List view with filtering
- Status change tracking
- Risk level assignment
- Owner assignment
- Due date management

---

## Prescriptive Norms (PNs) Implementation

### File Structure

```
../eu-ai-act-cartography/
├── prescriptive-norms/
│   ├── examples/
│   │   ├── PN-04.json          # AI Literacy
│   │   ├── PN-05E.json         # Facial recognition scraping ban
│   │   └── [other PNs]
│   │
│   └── shared-primitives/
│       ├── registry.json        # Index of all shared prims
│       ├── qp-is_provider.json
│       ├── qp-is_deployer.json
│       ├── qp-is_ai_system.json
│       ├── qp-in_scope_art2.json
│       └── [others]
```

### Example: PN-05E (Facial Recognition Scraping Ban)

```json
{
  "id": "PN-05E",
  "title": "Ban on untargeted scraping to build facial recognition databases",
  "type": "prohibition",
  "article_refs": [
    {
      "article": 5,
      "paragraph": 1,
      "point": "(e)",
      "quote": "the placing on the market..."
    }
  ],
  "requirements": {
    "root": "R-1",
    "nodes": [
      {
        "id": "R-1",
        "label": "All gates must hold",
        "kind": "composite",
        "operator": "allOf",
        "children": ["R-1.1", "R-1.2", "R-1.3"]
      },
      {
        "id": "R-1.1",
        "label": "Global scope gate (Art. 2)",
        "kind": "primitive",
        "ref": "qp:in_scope_art2",
        "question": {
          "prompt": "Does Art. 2 scope apply and no exclusion?"
        }
      },
      {
        "id": "R-1.2",
        "label": "System is AI",
        "kind": "primitive",
        "ref": "qp:is_ai_system",
        "question": {
          "prompt": "Is the system an AI system under Art. 3?"
        }
      },
      {
        "id": "R-1.3",
        "label": "Practice = untargeted scraping...",
        "kind": "composite",
        "operator": "allOf",
        "children": ["R-1.3.1", "R-1.3.2"]
      },
      {
        "id": "R-1.3.1",
        "label": "Untargeted scraping from internet or CCTV",
        "kind": "primitive",
        "question": {
          "prompt": "Does the system scrape facial images..."
        }
      },
      {
        "id": "R-1.3.2",
        "label": "Creates or expands a facial recognition database",
        "kind": "primitive",
        "question": {
          "prompt": "Does the system create or expand a facial recognition database?"
        }
      }
    ]
  }
}
```

### Example: Shared Primitive (qp:is_provider)

```json
{
  "id": "qp:is_provider",
  "title": "Provider (Art. 3(2)) — Role Gate",
  "namespace": "qp",
  "article_refs": [{ "article": 3, "paragraph": 2 }],
  "logic": {
    "root": "R-1",
    "nodes": [
      {
        "id": "R-1",
        "label": "All provider elements hold",
        "kind": "composite",
        "operator": "allOf",
        "children": ["R-1.1", "R-1.2", "R-1.3"]
      },
      {
        "id": "R-1.1",
        "label": "Entity type",
        "kind": "primitive",
        "question": {
          "prompt": "Is the entity a natural or legal person, public authority..."
        }
      },
      {
        "id": "R-1.2",
        "label": "Activity — develops OR has developed",
        "kind": "composite",
        "operator": "anyOf",
        "children": ["R-1.2.1", "R-1.2.2"]
      },
      {
        "id": "R-1.2.1",
        "label": "Develops an AI system or GPAI model",
        "kind": "primitive",
        "question": {
          "prompt": "Does the entity develop an AI system or a GPAI model?"
        }
      },
      {
        "id": "R-1.2.2",
        "label": "Has an AI system or GPAI model developed",
        "kind": "primitive",
        "question": {
          "prompt": "Has the entity commissioned an AI system... to be developed?"
        }
      },
      {
        "id": "R-1.3",
        "label": "Placement — places on market OR puts into service",
        "kind": "composite",
        "operator": "anyOf",
        "children": ["R-1.3.1", "R-1.3.2"]
      },
      {
        "id": "R-1.3.1",
        "label": "Places on the market under own name/trademark",
        "kind": "primitive",
        "question": {
          "prompt": "Does the entity place the AI system/model on the market..."
        }
      },
      {
        "id": "R-1.3.2",
        "label": "Puts into service under own name/trademark",
        "kind": "primitive",
        "question": {
          "prompt": "Does the entity put the AI system/model into service..."
        }
      }
    ]
  }
}
```

### Loading & Expansion Flow

1. **User Selects PN to Evaluate**
2. **Frontend fetches bundle:**
   ```typescript
   const res = await fetch(`/api/prescriptive/bundle?pnIds=PN-04,PN-05E`);
   const bundle = await res.json();
   const pns = bundle.pns;
   const sharedPrimitives = bundle.sharedPrimitives;
   ```

3. **Backend `/api/prescriptive/bundle`:**
   - Load PN files from cartography framework
   - Load referenced shared primitives
   - Return together

4. **Frontend expands shared requirements:**
   ```typescript
   for (const pn of pns) {
     const expandedNodes = expandSharedRequirements(
       pn.requirements.nodes,
       sharedPrimitives
     );
   }
   ```

5. **Expansion replaces references with full trees:**
   - Node with `ref: "qp:is_provider"` becomes a composite
   - Children are the full `qp:is_provider` logic
   - Nodes get prefixed IDs for uniqueness
   - Marked with `sharedRequirement` metadata

6. **Engine evaluates expanded tree**

### Caching Strategy

**Two-level Cache:**

1. **Per-Request In-Memory Cache** (`InMemorySharedEvaluationCache`)
   - Prevents duplicate LLM calls during single evaluation
   - Scope: Single `/api/evaluate` request

2. **Persistent Per-Use-Case Cache** (`PerUseCasePersistentSharedCache`)
   - Reuses evaluations across different PNs
   - Persists in `shared_requirement_assessments` table
   - Scope: All evaluations for a use case
   - Key: `{sharedPrimitiveId}::{nodeId}`

**Cache Entry Structure:**
```sql
{
  use_case_id: "use-case-xyz",
  shared_key: "qp:is_provider::R-1.2.1",
  decision: true,
  confidence: 0.95,
  reasoning: "...",
  citations: [...],
  source_evaluation_id: "eval-abc"
}
```

---

## State Management

### React Local State (No Global State Manager for Evaluation)

**Page Level** (`app/page.tsx`):
```typescript
// View management
const [canvasView, setCanvasView] = useState<'welcome' | 'evaluation' | 'usecase-cockpit' | 'creator'>('welcome');

// Selection
const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

// Concurrent evaluations (Map-based)
const [runningEvaluations, setRunningEvaluations] = useState<Set<string>>(new Set());
const [evaluationStatesMap, setEvaluationStatesMap] = useState<Map<string, EvaluationState[]>>(new Map());
const [totalNodesMap, setTotalNodesMap] = useState<Map<string, number>>(new Map());
```

**Cockpit Level** (`UseCaseCockpit.tsx`):
```typescript
// PN-centric state
const [pnStatuses, setPNStatuses] = useState<PNStatus[]>([]);
const [selectedPNs, setSelectedPNs] = useState<string[]>([]);

// Tab system
const [openTabs, setOpenTabs] = useState<string[]>([]);
const [activeTab, setActiveTab] = useState<string | null>(null);
const [tabData, setTabData] = useState<Map<string, any>>(new Map());

// Inline evaluation tracking
const [runningEvaluations, setRunningEvaluations] = useState<Set<string>>(new Set());
const [evaluationStatesMap, setEvaluationStatesMap] = useState<Map<string, EvaluationState[]>>(new Map());
```

### Real-Time Updates (Supabase Subscriptions)

**Example:** UseCaseCockpit subscribes to evaluation changes:
```typescript
const subscription = supabase
  .channel(`usecase_cockpit_${useCaseId}`)
  .on(
    'postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'evaluations', 
      filter: `use_case_id=eq.${useCaseId}` 
    },
    () => {
      scheduleReload('realtime-evaluations-change', 120);
    }
  )
  .subscribe();
```

### Data Persistence

**localStorage:**
- `selectedEvaluationId`: Persist which eval is being viewed
- Purpose: Resume on page refresh

**Session-Based:**
- Client-side maps hold intermediate state during evaluation
- Lost on page refresh (re-fetched from DB)

### State Flow During Evaluation

```
User Clicks "Evaluate"
  ↓
setRunningEvaluations(prev => new Set(prev).add(evaluationId))
setEvaluationStatesMap(prev => new Map(prev).set(evaluationId, []))
  ↓
POST /api/evaluate (SSE stream opens)
  ↓
Evaluation Engine Starts:
  for each primitive:
    emit { type: 'progress', states: [...] }
      ↓
    client receives:
      setEvaluationStatesMap(prev => 
        new Map(prev).set(evaluationId, states)
      )
      ↓
      RequirementsGrid re-renders with live results
  ↓
Root evaluation completes:
  emit { type: 'complete', ... }
    ↓
  setRunningEvaluations(prev => { 
    prev.delete(evaluationId); 
    return prev; 
  })
    ↓
  loadEvaluationResults(evaluationId) [fetch DB]
  
Create/Update obligation_instance
  (happens server-side via /api/evaluate callback)
    ↓
  Supabase subscription triggers
    ↓
  UseCaseCockpit reloads
    ↓
  ResultsCard updates (applies/not-applicable section)
```

---

## Key Dependencies

### Core Framework
```json
{
  "next": "15.5.4",
  "react": "19.1.0",
  "react-dom": "19.1.0"
}
```

### Database & Real-time
```json
{
  "@supabase/supabase-js": "^2.75.0"
}
```

### LLM Integration
```json
{
  "ai": "^5.0.72",
  "@ai-sdk/anthropic": "^2.0.31",
  "@ai-sdk/openai": "^2.0.52",
  "openai": "^6.3.0"
}
```

### UI Components
```json
{
  "@radix-ui/react-*": "^1.1.x",
  "class-variance-authority": "^0.7.1",
  "lucide-react": "^0.546.0",
  "clsx": "^2.1.1",
  "tailwindcss": "^4"
}
```

### State Management
```json
{
  "zustand": "^5.0.8"
}
```

### Utilities
```json
{
  "date-fns": "^4.1.0",
  "nanoid": "^5.1.6",
  "zod": "^4.1.12",
  "react-syntax-highlighter": "^15.6.6"
}
```

---

## Data Flow Patterns

### Pattern 1: Evaluation Trigger to Results Display

```
UseCaseCockpit.handleTriggerEvaluation()
  │
  ├─→ Create evaluation record
  │   {
  │     use_case_id,
  │     pn_ids: [PN-04],
  │     status: 'pending'
  │   }
  │
  └─→ onTriggerEvaluation(evaluationId, useCaseId, pnIds)
      │
      ├─→ Load use case from DB
      ├─→ Fetch PN bundle (with shared primitives)
      ├─→ setRunningEvaluations.add(evaluationId)
      ├─→ setCanvasView('evaluation')
      │
      └─→ POST /api/evaluate
          {
            evaluationId,
            prescriptiveNorm,
            sharedPrimitives,
            caseInput
          }
          │
          ├─→ EvaluationEngine.evaluate()
          │   │
          │   ├─→ TreeTraversal (depth-first)
          │   │   └─→ For each primitive:
          │   │       ├─→ Build prompt
          │   │       ├─→ Call LLM
          │   │       ├─→ Parse result
          │   │       ├─→ INSERT into evaluation_results
          │   │       └─→ emit SSE progress
          │   │
          │   └─→ Return root decision
          │
          ├─→ SSE { type: 'progress', states }
          │   └─→ setEvaluationStatesMap()
          │       └─→ RequirementsGrid re-renders
          │
          ├─→ SSE { type: 'complete' }
          │   └─→ Create/Update obligation_instance
          │       └─→ Supabase subscription triggers
          │           └─→ UseCaseCockpit reloads
          │               └─→ ResultsCard shows "Applies"
          │
          └─→ SSE stream closes
              └─→ setRunningEvaluations.delete()
```

### Pattern 2: Obligation Derivation

```
EvaluationEngine evaluation root completes
  │
  └─→ rootDecision = true/false
      │
      ├─→ decision === true
      │   └─→ applicability_state = 'applies'
      │       └─→ implementation_state = 'not_started'
      │
      └─→ decision === false
          └─→ applicability_state = 'not_applicable'
              └─→ implementation_state = null
```

### Pattern 3: Shared Requirement Caching

```
PN-04 Evaluation:
  Q1: "Is entity a provider?" (shared: qp:is_provider::R-1.1)
    ├─→ Check persistent cache
    │   (use_case_id, shared_key)
    │   │
    │   └─→ Not found
    │
    ├─→ Call LLM → Decision: true, Confidence: 0.95
    │
    ├─→ Save to shared_requirement_assessments
    │
    └─→ Return result
    
PN-05A Evaluation (same use case):
  Q1: "Is entity a provider?" (same question, same cache key)
    ├─→ Check persistent cache
    │   (use_case_id, shared_key)
    │   │
    │   └─→ Found! {decision: true, confidence: 0.95}
    │
    └─→ Return cached result (no LLM call)
```

### Pattern 4: Inline Expansion of Shared Primitives

```
PN-05E tree has node:
  {
    id: "R-1.1",
    ref: "qp:in_scope_art2"  // References a shared primitive
  }

After expandSharedRequirements():
  "R-1.1" becomes composite node:
  {
    id: "R-1.1",
    kind: "composite",
    operator: "allOf",
    children: ["R-1.1-expanded.R-1", ...]  // Full qp:in_scope_art2 tree
  }

During evaluation:
  evaluateComposite("R-1.1")
    ├─→ for each child:
    │   └─→ evaluateNode(child)
    │       └─→ qp:in_scope_art2 questions answered
    │
    └─→ All children = true? → R-1.1 = true
```

---

## Current Capabilities & Limitations

### Current Capabilities

#### ✅ Core Evaluation
- Full tree-based requirement evaluation
- Multiple PNs in single evaluation
- Shared requirement expansion and caching
- Short-circuit optimization (allOf/anyOf)
- Real-time progress streaming (SSE)
- Concurrent evaluation support

#### ✅ Use Case Management
- Create and store use cases
- AI-powered completeness analysis
- Use case description editing
- Multiple evaluations per use case
- Evaluation history tracking

#### ✅ Obligation Tracking
- Automatic obligation instance creation
- Dual state tracking (applicability + implementation)
- Status history auditing
- Risk level and owner assignment
- Compliance center dashboarding
- Statistics and KPIs

#### ✅ UI/UX
- Tree view with collapsible nodes
- Live progress during evaluation
- Inline evaluation within cockpit
- Tab system for multiple PNs
- Results summary with applicability determination
- Mobile-responsive design

#### ✅ Caching & Performance
- Per-use-case shared requirement caching
- In-memory deduplication during request
- Persistent cache in database
- Reduced LLM calls for repeated assessments

### Limitations & Gaps

#### ❌ Review & Modification
- **No evaluation review mechanism:** Cannot challenge or override AI decisions
- **No result modification:** Can't edit AI reasoning or confidence
- **No appeal process:** No way to request re-evaluation with different facts
- **No manual assertion:** Can't manually provide answers to questions
- **No comment/annotation:** Can't add notes about why a decision was questioned

#### ❌ Collaborative Features
- No multi-user support
- No role-based access control
- No approval workflows
- No change tracking for manual updates
- No user attribution for modifications

#### ❌ Advanced Workflows
- No conditional branching based on use case type
- No custom question sets
- No domain-specific specialization
- No version control for PNs
- No ability to create custom requirements

#### ❌ Explanation & Transparency
- Limited reasoning depth from LLM
- No full prompt logging
- No citation tracking beyond AI output
- No source document references
- No confidence interval justification

#### ❌ Data Export & Reporting
- No PDF export of evaluations
- No structured data export (JSON/CSV)
- No audit report generation
- No trend analysis over time
- No comparison between evaluations

#### ❌ Error Handling & Recovery
- Minimal error recovery in evaluation flow
- No partial result replay
- No retry logic with circuit breaker
- No graceful degradation
- Limited validation of use case facts

#### ❌ Integration
- No webhook callbacks
- No third-party API integrations
- No SSO/auth system (open access)
- No audit log API

---

## Key File Locations (Quick Reference)

| Component | File Path |
|-----------|-----------|
| Main page | `/app/page.tsx` (850 lines) |
| Use case cockpit | `/components/usecase/UseCaseCockpit.tsx` (1300+ lines) |
| Requirements grid | `/components/evaluation/RequirementsGrid.tsx` (850+ lines) |
| Evaluation engine | `/lib/evaluation/engine.ts` (340 lines) |
| Shared expansion | `/lib/evaluation/expand-shared.ts` (185 lines) |
| Shared caching | `/lib/evaluation/shared-cache.ts` (136 lines) |
| Evaluate API | `/app/api/evaluate/route.ts` (400+ lines) |
| Compliance center | `/app/compliance-center/page.tsx` (430 lines) |
| Database types | `/lib/supabase/types.ts` (285 lines) |
| Type definitions | `/lib/evaluation/types.ts` (118 lines) |
| Obligation status | `/components/usecase/TaskRow.tsx` (280+ lines) |
| Results summary | `/components/usecase/ResultsCard.tsx` (135 lines) |

---

## Architecture Notes for Review Functionality

### Integration Points for Review System

1. **Evaluation Results Table**
   - Add `reviewed_at`, `reviewed_by`, `review_notes` columns
   - Add `was_challenged`, `challenge_reason` flags
   - Or create separate `evaluation_reviews` table

2. **Obligation Instance**
   - Link review state to implementation_state
   - Track override history separately

3. **UI Integration Points**
   - Add "Review" button in RequirementBlock
   - Add review panel overlay or modal
   - Add reviewer role/permission check in appbar

4. **API Endpoints**
   - POST `/api/evaluations/{id}/reviews` - Submit review
   - GET `/api/evaluations/{id}/reviews` - Fetch reviews
   - PUT `/api/evaluations/{id}/reviews/{reviewId}` - Update review

5. **State Management**
   - Add review mode toggle in RequirementsGrid props
   - Track selected node for review in page state

---

End of Exploration Document
