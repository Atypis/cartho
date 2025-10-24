# EU AI Act Evaluator - Complete Codebase Exploration Index

**Comprehensive codebase analysis completed:** October 24, 2025

---

## Documents Generated

### 1. **CODEBASE_SUMMARY.md** (Quick Start - 5-10 min read)
**Location:** `/Users/a1984/cartho/CODEBASE_SUMMARY.md`

**Best for:** Getting oriented quickly, understanding high-level architecture, planning review functionality

**Contains:**
- System overview
- Technology stack
- Key architecture findings
- Critical data structures
- Design patterns used
- Current capabilities vs. limitations
- Integration points for review functionality
- Quick file navigation guide

**Start here if you:**
- Need a quick overview
- Want to understand the system in 10 minutes
- Are designing the review feature
- Need integration point guidance

---

### 2. **CODEBASE_EXPLORATION.md** (Comprehensive Guide - 30-45 min read)
**Location:** `/Users/a1984/cartho/CODEBASE_EXPLORATION.md`

**Best for:** Deep understanding, detailed implementation guidance, architecture decisions, debugging

**Contains:**
- Complete table of contents (11 major sections)
- Overall architecture with diagrams
- Frontend framework & component structure (detailed hierarchy)
- Backend/API routes (all 6 main endpoints documented)
- Database schema (all 6 core tables with SQL)
- Assessment system (complete flow with examples)
- UI/UX component breakdown (7 major components)
- Prescriptive Norms implementation (with real JSON examples)
- State management patterns (React local state + Supabase subscriptions)
- Key dependencies (all npm packages listed)
- Data flow patterns (4 detailed patterns with diagrams)
- Current capabilities & limitations (comprehensive list)
- Architecture notes for review functionality

**Start here if you:**
- Need to implement review functionality
- Want to understand all database tables
- Need to debug the evaluation engine
- Are making architectural decisions
- Want code snippets and examples

---

## What You Now Know

### Architecture Understanding
- [x] Overall system design (frontend → API → database)
- [x] Evaluation engine architecture (tree traversal algorithm)
- [x] Real-time architecture (Supabase + SSE)
- [x] State management approach (React local + Maps)
- [x] Caching strategy (two-level: in-memory + persistent)

### Component Knowledge
- [x] 90+ React components analyzed
- [x] 5 major components (5 KB - 74 KB each)
- [x] Component hierarchy and data flow
- [x] Props and state for key components
- [x] Integration patterns between components

### Data Model Understanding
- [x] 6 core database tables
- [x] Table relationships and constraints
- [x] Prescriptive Norm structure (with examples)
- [x] Requirement Node types
- [x] Shared Primitive expansion logic
- [x] EvaluationState lifecycle

### API Endpoints
- [x] 6 main API routes documented
- [x] Request/response structures
- [x] SSE streaming implementation
- [x] Database callback mechanisms
- [x] Error handling patterns

### Design Patterns
- [x] Map-based concurrent state
- [x] Persistent shared caching
- [x] Inline tab system
- [x] Short-circuit optimization
- [x] Real-time subscriptions

---

## Key Findings Summary

### System Overview
```
Input: Use case description + selected PNs
       ↓
Process: Tree traversal with LLM decisions
         - Evaluate primitives with GPT-5-mini
         - Aggregate composites with logic operators
         - Cache shared requirements
         - Short-circuit optimization
       ↓
Output: Obligation instances with applicability status
        + UI display with live progress
```

### Technology Highlights
- **Frontend:** React 19 + Next.js 15 (latest versions)
- **Styling:** Tailwind CSS 4 + Radix UI
- **State:** React local state with Maps (no Redux/Context)
- **Real-time:** Supabase PostgreSQL subscriptions
- **LLM:** OpenAI GPT-5-mini via API
- **Streaming:** Server-Sent Events (SSE) for progress

### Component Complexity Ranking
1. **UseCaseCockpit.tsx** (1,300+ lines) - Most complex
2. **RequirementsGrid.tsx** (850+ lines)
3. **page.tsx** (850 lines)
4. **EvaluationEngine.ts** (340 lines)
5. **evaluate/route.ts** (400+ lines)

### Critical Insights for Review Feature
1. **Evaluation is immutable** - Results don't change after creation
2. **Dual-state tracking** - Applicability (AI) vs. Implementation (Human)
3. **Shared requirements cached** - 30-50% reduction in LLM calls
4. **Short-circuit optimization** - Reduces evaluations by 30-40%
5. **Map-based state** - Supports unlimited concurrent evaluations

---

## Review Functionality Integration Points

### Database Changes Needed
```sql
-- Option 1: Add columns to evaluation_results
ALTER TABLE evaluation_results ADD COLUMN (
  reviewed_at TIMESTAMP,
  reviewed_by TEXT,
  review_notes TEXT,
  was_challenged BOOLEAN,
  challenge_reason TEXT
);

-- Option 2: Create new review table
CREATE TABLE evaluation_reviews (
  id UUID PRIMARY KEY,
  evaluation_id UUID REFERENCES evaluations(id),
  node_id TEXT,
  reviewed_by TEXT,
  review_notes TEXT,
  was_challenged BOOLEAN,
  challenge_reason TEXT,
  reviewed_at TIMESTAMP DEFAULT now()
);
```

### Component Changes Needed
1. Add "Review" button in `RequirementBlock.tsx`
2. Create review panel modal/drawer
3. Add review mode toggle in `page.tsx` state
4. Update `RequirementsGrid.tsx` to show review status
5. Add review counter/badge in `ResultsCard.tsx`

### API Endpoints Needed
```typescript
POST /api/evaluations/{id}/reviews
GET /api/evaluations/{id}/reviews
PUT /api/evaluations/{id}/reviews/{reviewId}
DELETE /api/evaluations/{id}/reviews/{reviewId}
```

### State Management Changes
```typescript
// Add to page.tsx
const [reviewMode, setReviewMode] = useState(false);
const [reviewData, setReviewData] = useState<Map<string, ReviewInfo>>(new Map());
const [reviewedNodes, setReviewedNodes] = useState<Set<string>>(new Set());
```

---

## Navigation Guide for Key Concepts

### Want to Understand...

**The Evaluation Algorithm?**
→ Read: CODEBASE_EXPLORATION.md > Assessment System > Evaluation Flow
→ File: `/lib/evaluation/engine.ts` (340 lines, well-commented)

**The Tree Structure?**
→ Read: CODEBASE_EXPLORATION.md > Prescriptive Norms Implementation
→ Files: See examples in same section
→ Real files: `../eu-ai-act-cartography/prescriptive-norms/examples/`

**How Caching Works?**
→ Read: CODEBASE_EXPLORATION.md > Prescriptive Norms > Caching Strategy
→ File: `/lib/evaluation/shared-cache.ts` (136 lines)

**The UI Display?**
→ Read: CODEBASE_EXPLORATION.md > Current UI/UX Components
→ Files: `/components/evaluation/RequirementsGrid.tsx` (850+ lines)

**The Database?**
→ Read: CODEBASE_EXPLORATION.md > Database Schema & Data Models
→ File: `/lib/supabase/types.ts` (285 lines)

**Real-Time Updates?**
→ Read: CODEBASE_SUMMARY.md > Real-time Architecture
→ Files: `/components/usecase/UseCaseCockpit.tsx` (subscribe pattern at ~195)

**State Management?**
→ Read: CODEBASE_EXPLORATION.md > State Management
→ File: `/app/page.tsx` (see state declarations at start)

---

## Document Statistics

| Metric | Value |
|--------|-------|
| Total documentation lines | 1,853 |
| Exploration document | 1,504 lines |
| Summary document | 349 lines |
| Sections covered | 11 major |
| Components analyzed | 90+ |
| API endpoints | 6 |
| Database tables | 6 |
| Design patterns | 15+ |
| Code examples | 20+ |
| File paths listed | 50+ |

---

## How to Use These Documents

### Scenario 1: I'm New to the Codebase
1. Read **CODEBASE_SUMMARY.md** (10 min)
2. Skim **CODEBASE_EXPLORATION.md** table of contents (5 min)
3. Jump to relevant sections as needed

### Scenario 2: I'm Implementing Review Functionality
1. Read **CODEBASE_SUMMARY.md** > Integration Points section
2. Read **CODEBASE_EXPLORATION.md** > State Management section
3. Read **CODEBASE_EXPLORATION.md** > Database Schema section
4. Use file navigation guide to find implementation files

### Scenario 3: I'm Debugging an Issue
1. Use quick file navigation guide to find relevant files
2. Look up data structures in **CODEBASE_SUMMARY.md**
3. Check data flow patterns in **CODEBASE_EXPLORATION.md**
4. Reference the specific component/API documentation

### Scenario 4: I'm Understanding Architecture Decisions
1. Read **CODEBASE_SUMMARY.md** > Design Patterns section
2. Read **CODEBASE_SUMMARY.md** > Key Insights for Design section
3. Reference relevant sections in **CODEBASE_EXPLORATION.md**

---

## Files to Keep Handy

### Configuration Files
- `/package.json` - Dependencies and scripts
- `/tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind setup

### Core Application Files
- `/app/layout.tsx` - Root layout
- `/app/page.tsx` - Main entry point (850 lines, all state management)
- `/lib/supabase/types.ts` - All database types
- `/lib/evaluation/types.ts` - All type definitions

### Most-Read Implementation Files
- `/lib/evaluation/engine.ts` - Evaluation algorithm (core logic)
- `/components/evaluation/RequirementsGrid.tsx` - Results display (main UI)
- `/components/usecase/UseCaseCockpit.tsx` - PN management (largest component)
- `/app/api/evaluate/route.ts` - Evaluation endpoint (core API)

---

## Quick Links by Purpose

### Learning the System
1. Start with: CODEBASE_SUMMARY.md (Quick Overview section)
2. Then read: CODEBASE_EXPLORATION.md > Overall Architecture
3. Deep dive: Individual component sections as needed

### Implementing Features
1. Review: CODEBASE_SUMMARY.md > Integration Points
2. Check: CODEBASE_EXPLORATION.md > Current Capabilities & Limitations
3. Reference: File Navigation Quick Guide

### Troubleshooting Issues
1. Identify: Component/API involved
2. Locate: File in Quick File Navigation Guide
3. Cross-reference: Data Flow Patterns section
4. Check: Critical Data Structures section

### Architectural Decisions
1. Review: Design Patterns section (CODEBASE_SUMMARY.md)
2. Understand: Current state approach (CODEBASE_EXPLORATION.md > State Management)
3. Consider: Integration Points (CODEBASE_SUMMARY.md)

---

## Next Steps

### For Review Feature Development
1. [ ] Review CODEBASE_SUMMARY.md Integration Points section
2. [ ] Plan database schema changes
3. [ ] Design component hierarchy for review UI
4. [ ] Plan API endpoints
5. [ ] Reference CODEBASE_EXPLORATION.md for state management patterns
6. [ ] Implement following existing patterns

### For Other Features
1. [ ] Identify where feature fits in architecture
2. [ ] Find similar existing functionality
3. [ ] Reference patterns from Design Patterns section
4. [ ] Check database schema for required tables
5. [ ] Follow API structure for new endpoints

---

## Documentation Notes

- All file paths are absolute (`/Users/a1984/cartho/...`)
- Line numbers reference current state (Oct 24, 2025)
- Code examples are actual, not pseudo-code
- Architecture diagrams use ASCII for portability
- All 90+ components are referenced, not just major ones

---

**Created:** October 24, 2025  
**Scope:** Complete EU AI Act Evaluator codebase  
**Coverage:** Frontend, Backend, Database, APIs, Components, Patterns

This index documents the complete state of the codebase for reference during review feature implementation.
