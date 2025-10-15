# [DEPRECATED] Legal Cartography v0.3
Moved to cartography-framework/deprecated on 2025-10-10 for archival.

## Core Concept

Legal cartography is a methodology for mapping legislation by combining deterministic legal logic with probabilistic interpretation through large language models (LLMs). The approach creates a traceable, verifiable system for arriving at legal conclusions.

**v0.3 Update**: Redesigned architecture where **operators are properties of child nodes**, not parent nodes. Each requirement declares its own relationship to its parent, eliminating ambiguity.

---

## Two-Component Architecture

### 1. Deterministic Core Set (Rechtskernsatz)

The deterministic component maps the logical structure of legal provisions using a unified tree of requirements.

#### Core Principle: Child-Level Operators

**Every requirement declares its relationship to its parent**: "I am an AND requirement", "I am an OR alternative", or "I am an AND_NOT exception".

**Default assumption**: All requirements are cumulative (AND) unless marked otherwise.

**The Rule**: Sibling nodes share the same operator type. You cannot mix OR requirements with AND requirements at the same level (but you CAN mix AND with AND_NOT, as exceptions naturally combine with requirements).

---

## The Unified Node Model

Following Savigny's principle of systematic clarity and Larenz's *Methodenlehre*, we define three node types:

### Node Type 1: **Leaf Requirement**
A single, atomic legal requirement that cannot be decomposed further.

```javascript
{
  "description": "AI system is intended as safety component",
  "operator": "AND",  // This node is AND-required by parent
  "children": [],
  "metadata": {
    "article": "Article 6(1)(a)",
    "confidence": "HIGH",
    "llm_needed": false
  }
}
```

**Characteristics:**
- Has description (the legal requirement in natural language)
- Has operator (declares relationship to parent: "AND", "OR", or "AND_NOT")
- No children (it's a leaf)
- Has metadata (article reference, confidence level, etc.)

---

### Node Type 2: **Operator Node (Grouping Node)**
Groups child requirements that share the same logical relationship.

```javascript
{
  "description": "Safety component or product pathway",
  "operator": "AND",  // This group itself is AND-required by parent
  "children": [
    {
      "description": "Safety component",
      "operator": "OR",  // Child 1: OR alternative
      "children": [],
      "metadata": {...}
    },
    {
      "description": "Product pathway [grouping]",
      "operator": "OR",  // Child 2: OR alternative
      "children": [
        {
          "description": "AI system is itself a product",
          "operator": "AND",  // Nested: AND requirement
          "children": [],
          "metadata": {...}
        },
        {
          "description": "Product covered by Annex I",
          "operator": "AND",  // Nested: AND requirement
          "children": [],
          "metadata": {...}
        }
      ],
      "metadata": {...}
    }
  ],
  "metadata": {
    "note": "OR group - either alternative satisfies this requirement"
  }
}
```

**Characteristics:**
- Has operator (declares its own relationship to parent)
- Has children (2 or more)
- All children share the same operator type (validation rule)
- Description may be structural label (e.g., "[grouping]")

**Parent Node Operator Types:**
When a node has children, its operator serves dual purpose:
1. Declares the node's relationship to ITS parent
2. Indicates what type of group it forms (validated by checking children's operators match)

---

### Node Type 3: **Reference Node**
Points to an external requirement defined elsewhere.

```javascript
{
  "description": "Product covered by Union harmonisation legislation in Annex I",
  "operator": "AND",  // This reference is AND-required
  "children": [],
  "metadata": {
    "article": "Article 6(1)(a)",
    "confidence": "HIGH",
    "reference": "Annex I",
    "note": "External legislation - boundary of AI Act cartography"
  }
}
```

**Characteristics:**
- Has description
- Has operator (declares relationship to parent)
- No children (like a leaf)
- Metadata includes `reference` field
- Represents boundary to external legal document

---

## Operator Semantics

### **AND** (Cumulative Requirement)
"This requirement must be satisfied for the parent to be satisfied."

**Default assumption**: Every requirement is AND unless marked otherwise.

**Example**: All conditions in Article 6(1) must be met.

---

### **OR** (Alternative Requirement)
"At least one of the OR alternatives must be satisfied for the parent group to be satisfied."

**Usage**: Creates alternative pathways - any one is sufficient.

**Example**: Safety component OR product pathway in Article 6(1)(a).

**Grouping requirement**: All siblings must be OR when using this operator.

---

### **AND_NOT** (Exception/Exclusion)
"This requirement must NOT be satisfied for the parent to be satisfied."

**Usage**: Represents exceptions, exclusions, carve-outs, negations.

**Example**: Biometric verification systems are excluded from high-risk classification.

**Legal semantics**: Matches how lawyers think about *Ausnahmetatbestände* (exception provisions).

**Can combine with AND**: AND_NOT requirements can appear alongside AND requirements (exceptions can exist alongside regular requirements).

---

## Handling Mixed Logic: The Grouping Principle

### Problem Case: Article 6(1)(a)

The legal text states:
> "AI system is intended to be used as safety component of a product **OR** AI system is itself a product, covered by Union harmonisation legislation listed in Annex I"

This is logically: `A OR (B AND C)` where:
- A = Safety component
- B = AI is product itself
- C = Covered by Annex I

### Solution: Explicit Grouping Node

We introduce an intermediate **grouping node** to maintain the rule that siblings share operator types:

```javascript
{
  "description": "Article 6(1)(a) - Safety component or product conditions",
  "operator": "AND",  // This whole condition is AND-required by parent
  "children": [
    {
      "description": "AI system intended as safety component of product",
      "operator": "OR",  // I am an OR alternative
      "children": [],
      "metadata": {"confidence": "HIGH"}
    },
    {
      "description": "Product pathway [grouping]",
      "operator": "OR",  // I am an OR alternative
      "children": [
        {
          "description": "AI system is itself a product",
          "operator": "AND",  // I am AND-required within this group
          "children": [],
          "metadata": {"confidence": "HIGH"}
        },
        {
          "description": "Product covered by Annex I",
          "operator": "AND",  // I am AND-required within this group
          "children": [],
          "metadata": {
            "confidence": "HIGH",
            "reference": "Annex I"
          }
        }
      ],
      "metadata": {
        "note": "Grouping node - combines product-based conditions"
      }
    }
  ]
}
```

**Key Insights**:
1. The root has operator "AND" (required by parent)
2. Its two children both have operator "OR" (they are alternatives)
3. The second child is itself a grouping node containing AND requirements
4. This maintains the rule: siblings always share operator type

---

## Representing Complex Logic

### Negations (AND_NOT)

Article 6(2) states systems are high-risk if listed in Annex III, UNLESS opt-out conditions are met.

Logical structure: `Annex III AND NOT(opt-out conditions)`

```javascript
{
  "description": "High-risk via Annex III pathway",
  "operator": "AND",  // This pathway is AND-required
  "children": [
    {
      "description": "System falls within Annex III use cases",
      "operator": "AND",  // Must be in Annex III
      "children": [
        {
          "description": "1. Biometrics",
          "operator": "OR",  // Any use case qualifies
          "children": [/* biometric use cases */],
          "metadata": {...}
        },
        // ... 7 more areas
      ],
      "metadata": {...}
    },
    {
      "description": "Opt-out conditions NOT satisfied",
      "operator": "AND_NOT",  // This must NOT be true
      "children": [
        {
          "description": "Opt-out conditions met [grouping]",
          "operator": "AND",  // All opt-out conditions required
          "children": [
            {
              "description": "Threshold test satisfied",
              "operator": "AND",
              "children": [/* threshold requirements */]
            },
            {
              "description": "Alternative conditions",
              "operator": "OR",  // Any alternative sufficient
              "children": [/* 4 opt-out conditions */]
            }
          ]
        }
      ]
    }
  ]
}
```

**Semantics**: The parent is satisfied IF the AND_NOT child is FALSE.

---

### Nested Exceptions (Double Negation)

Article 6(3) has a carve-out: "Profiling systems ALWAYS high-risk" (even if opt-out would apply).

Logical structure: `Annex III AND NOT(opt-out AND NOT(profiling))`

```javascript
{
  "description": "Opt-out conditions met [grouping]",
  "operator": "AND",  // These must all be met for opt-out
  "children": [
    {
      "description": "Threshold test satisfied",
      "operator": "AND",
      "children": [/* threshold requirements */]
    },
    {
      "description": "Alternative conditions",
      "operator": "OR",
      "children": [/* 4 opt-out conditions */]
    },
    {
      "description": "System does NOT perform profiling",
      "operator": "AND_NOT",  // Exception to the opt-out
      "children": [
        {
          "description": "System performs profiling of natural persons",
          "operator": "AND",  // If this is true, opt-out fails
          "children": [],
          "metadata": {
            "article": "Article 6(3) second subparagraph",
            "confidence": "HIGH",
            "note": "Profiling carve-out - always high-risk"
          }
        }
      ]
    }
  ]
}
```

**Double negation logic**:
- Opt-out satisfied = Threshold AND Alternatives AND NOT(Profiling)
- If profiling is true, the NOT(Profiling) fails, so opt-out fails
- Therefore system remains high-risk

---

## Visual Representation

When rendered, each node shows its operator as a badge on itself (not on parent):

- **AND** = Default/implicit (can omit badge for cleaner display)
- **OR** = Orange badge "OR"
- **AND_NOT** = Red badge "EXCEPTION" or "EXCLUSION"

Node type icons:
- **∧** = Grouping node with AND children
- **∨** = Grouping node with OR children
- **¬** = Grouping node with AND_NOT children
- **•** = Leaf requirement
- **→** = Reference to external document
- **?** = Requires LLM interpretation

### Example Tree Visualization:

```
• High-Risk Classification (Article 6) [root - no operator]
├─ ∧ Pathway 1: Product Safety (Article 6(1)) [AND]
│  ├─ ∨ Safety component or product [AND - but children are OR]
│  │  ├─ • Safety component of product [OR]
│  │  └─ ∧ Product pathway [grouping] [OR - but children are AND]
│  │     ├─ • AI system is itself a product [AND]
│  │     └─ → Product covered by Annex I [AND]
│  └─ • Requires third-party conformity assessment [AND]
└─ ∧ Pathway 2: Annex III Use Cases (Article 6(2)) [OR]
   ├─ ∨ System in Annex III [AND]
   │  ├─ ∨ Area 1: Biometrics [OR]
   │  │  ├─ ¬ Remote biometric identification [OR]
   │  │  │  └─ • Verification only [AND_NOT - EXCEPTION]
   │  │  ├─ • Biometric categorization [OR]
   │  │  └─ • Emotion recognition [OR]
   │  └─ ∨ Area 2-8: [...] [OR]
   └─ ¬ Opt-out conditions NOT satisfied [AND_NOT - EXCEPTION]
      └─ ∧ Opt-out conditions met [grouping] [AND]
         ├─ ? Threshold test (no significant risk) [AND]
         ├─ ∨ Alternative conditions [AND - but children are OR]
         │  ├─ ? Narrow procedural task [OR]
         │  ├─ ? Improves completed activity [OR]
         │  ├─ ? Detects patterns [OR]
         │  └─ ? Preparatory task [OR]
         └─ ¬ System does NOT perform profiling [AND_NOT - EXCEPTION]
            └─ • System performs profiling [AND]
```

---

## Metadata Schema

Each node carries metadata for traceability and evaluation:

```javascript
{
  "metadata": {
    "article": "Article 6(1)(a)",           // Legal reference
    "confidence": "HIGH|MEDIUM|LOW",         // Confidence in mapping
    "llm_needed": true|false,                // Requires LLM interpretation?
    "reference": "Annex I",                  // External document reference
    "note": "Additional context",            // Explanation/clarification
    "flags": ["interpretative", "ambiguous"] // Special considerations
  }
}
```

---

## Probabilistic Interpretation Layer (LLM)

LLMs evaluate nodes marked with `"llm_needed": true`:

**Low-Confidence Nodes** (interpretative requirements):
- "Significant risk of harm"
- "Materially influencing outcome"
- "Narrow procedural task"
- "Reasonably foreseeable misuse"

**LLM Evaluation Process**:
1. Receives: requirement description, legal context, case facts
2. Evaluates: whether requirement is satisfied
3. Returns: boolean result + confidence score + reasoning
4. Allows: human override with justification

---

## Key Principles (v0.3)

1. **Begriffliche Klarheit (Conceptual Clarity)**: Each node declares its own relationship to parent
2. **Semantische Transparenz (Semantic Transparency)**: Operator appears on the thing it describes
3. **Systematische Geschlossenheit (Systematic Completeness)**: Any boolean logic expressible through grouping
4. **Nachvollziehbarkeit (Traceability)**: Tree structure = logical structure, no hidden rules
5. **Anschaulichkeit (Intuitiveness)**: Legal professionals can read and verify the structure
6. **Separation of Concerns**: Deterministic structure separate from probabilistic interpretation

---

## Design Decisions (v0.3)

### Why Child-Level Operators?

**Problem with Parent-Level Operators (v0.2)**:
- Visual ambiguity: AND_NOT badge on "Remote biometric identification" looks like the node itself is negated, when actually it's describing the children's relationship
- Conceptual mismatch: Operator "belongs" to parent but semantically describes children

**Solution: Operators on Children**:
- Each child declares: "I am an AND requirement" or "I am an exception (AND_NOT)"
- Matches legal reasoning: requirements are AND by default, exceptions are marked
- Visual clarity: Badge appears on the thing being described
- Validation: Parent can check all children share same operator type

**Trade-off**: Redundancy (all siblings show same operator) BUT this serves as visual confirmation and validation.

### Why Allow AND + AND_NOT Mixing?

Legal texts naturally have requirements + exceptions:
- "System must be X AND Y AND Z BUT NOT if condition W"
- Exceptions (AND_NOT) are conceptually paired with requirements (AND)
- This matches *Methodenlehre* distinction between *Tatbestandsmerkmale* (requirements) and *Ausnahmetatbestände* (exceptions)

### Why Forbid AND + OR Mixing?

Mixing AND and OR at same level creates ambiguity:
- Does `A AND B OR C` mean `(A AND B) OR C` or `A AND (B OR C)`?
- Solution: Use explicit grouping nodes to make precedence clear
- All siblings must share operator type (enforced by validation)

---

## Implementation Guidelines

### 1. Mapping Legislation

**Step 1**: Identify the Wirknorm (legal consequence) - this is the root node with no operator

**Step 2**: Extract all requirements from legal text

**Step 3**: For each requirement, determine its relationship to parent:
- Must it be met? → operator: "AND" (default)
- Is it an alternative? → operator: "OR"
- Must it NOT be met? → operator: "AND_NOT" (exception)

**Step 4**: Group requirements that share the same operator type

**Step 5**: For mixed logic (e.g., `A OR (B AND C)`), create grouping nodes

**Step 6**: Validate: all siblings share the same operator type (except AND + AND_NOT allowed)

**Step 7**: Annotate with metadata (article, confidence, LLM flags)

**Step 8**: Stop at external document boundaries (mark as reference nodes)

### 2. Naming Grouping Nodes

Grouping nodes should have descriptive labels:
- ✅ "Product pathway [grouping]"
- ✅ "Opt-out conditions met [grouping]"
- ✅ "Safety component or product [grouping]"
- ❌ "Node 1", "Group A", "Condition set"

### 3. Confidence Levels

- **HIGH**: Rule-based, deterministic (e.g., "Listed in Annex III")
- **MEDIUM**: Some interpretation needed but bounded (e.g., "Safety component")
- **LOW**: Heavily interpretative, requires LLM (e.g., "Significant risk")

### 4. Root Node Special Case

The root node (legal consequence) has no parent, therefore:
- Set `operator: null` OR omit the operator field
- This is the only node without an operator
- Represents the *Wirknorm* being evaluated

---

## Use Cases

- **Legal Validation**: Lawyers verify the logical structure mirrors the law
- **Case Evaluation**: Apply tree to specific facts, with LLM assistance
- **Compliance Planning**: Identify all requirements for a legal consequence
- **Legislative Analysis**: Compare alternative pathways, identify gaps
- **Systematic Jurisprudence**: Build comprehensive legal system maps

---

## Open Questions (v0.3)

- Optimal granularity: When to stop decomposing requirements?
- Versioning: How to track legislative amendments and interpretation evolution?
- Cross-references: How to handle shared nodes across provisions?
- Visualization: Best UI patterns for very deep trees (10+ levels)?
- LLM Integration: Which model(s) and prompting strategies for legal interpretation?
- Validation tooling: Automated checks for operator consistency?

---

## Changelog

**v0.3** (Current)
- **BREAKING CHANGE**: Moved operators from parent to child nodes
- Each node declares its relationship to parent via `operator` field
- Root node has `operator: null` (no parent to relate to)
- Validation rule: siblings must share same operator type (except AND + AND_NOT)
- Updated visual representation: operators shown as badges on nodes themselves
- Semantic clarity: "I am an AND requirement" vs "I am an exception"
- Matches legal reasoning patterns (*Tatbestandsmerkmale* vs *Ausnahmetatbestände*)

**v0.2**
- Introduced Unified Tree Architecture
- Defined three node types (Leaf, Operator, Reference)
- Formalized explicit grouping principle
- Added detailed examples from Article 6
- Specified metadata schema
- Updated visual representation with logical symbols
- **Deprecated**: Parent-level operators created visual ambiguity

**v0.1**
- Initial concept and two-component architecture
- Basic deterministic/probabilistic separation
- Preliminary visualization requirements
