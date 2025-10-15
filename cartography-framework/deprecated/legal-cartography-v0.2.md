# [DEPRECATED] Legal Cartography v0.2
Moved to cartography-framework/deprecated on 2025-10-10 for archival.

## Core Concept

Legal cartography is a methodology for mapping legislation by combining deterministic legal logic with probabilistic interpretation through large language models (LLMs). The approach creates a traceable, verifiable system for arriving at legal conclusions.

**v0.2 Update**: Introduces the **Unified Tree Architecture** with explicit grouping nodes for unambiguous logical structure representation.

---

## Two-Component Architecture

### 1. Deterministic Core Set (Rechtskernsatz)

The deterministic component maps the logical structure of legal provisions using a unified tree of requirements.

#### Core Principle: Explicit Grouping

**Every node has one purpose**: either it represents a single requirement, or it combines other requirements logically.

**The Rule**: An operator node's operator applies to ALL its children, with no exceptions or implicit rules.

---

## The Unified Node Model

Following Savigny's principle of systematic clarity and Larenz's *Methodenlehre*, we define three node types:

### Node Type 1: **Leaf Requirement**
A single, atomic legal requirement that cannot be decomposed further.

```javascript
{
  "description": "AI system is intended as safety component",
  "operator": null,
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
- No operator (it's atomic)
- No children (it's a leaf)
- Has metadata (article reference, confidence level, etc.)

---

### Node Type 2: **Operator Node**
Combines child requirements using boolean logic.

```javascript
{
  "description": "Safety component or product pathway [grouping]",
  "operator": "OR",
  "children": [
    {/* child 1 */},
    {/* child 2 */}
  ],
  "metadata": {
    "article": "Article 6(1)(a)",
    "confidence": "HIGH",
    "note": "Two alternative pathways"
  }
}
```

**Characteristics:**
- Has operator: `"AND"`, `"OR"`, or `"AND_NOT"`
- Has children (2 or more)
- Description is optional (may be just a structural label)
- Operator applies to ALL children equally

**Operator Semantics:**
- **AND**: All children must be satisfied (cumulative requirements)
- **OR**: At least one child must be satisfied (alternative pathways)
- **AND_NOT**: The child must NOT be satisfied (negation/exception)

---

### Node Type 3: **Reference Node**
Points to an external requirement defined elsewhere.

```javascript
{
  "description": "Product covered by Union harmonisation legislation in Annex I",
  "operator": null,
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
- No operator, no children (like a leaf)
- Metadata includes `reference` field
- Represents boundary to external legal document

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

We introduce an intermediate **operator node** purely for logical grouping:

```javascript
{
  "description": "Article 6(1)(a) - Safety component or product conditions",
  "operator": "OR",
  "children": [
    {
      "description": "AI system intended as safety component of product",
      "operator": null,
      "children": [],
      "metadata": {"confidence": "HIGH"}
    },
    {
      "description": "Product pathway [grouping]",
      "operator": "AND",
      "children": [
        {
          "description": "AI system is itself a product",
          "operator": null,
          "children": [],
          "metadata": {"confidence": "HIGH"}
        },
        {
          "description": "Product covered by Annex I",
          "operator": null,
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

**Key Insight**: The intermediate node "Product pathway [grouping]" doesn't quote the law directly—it exists purely for **logical structure**. This is acceptable because:
1. It's clearly labeled `[grouping]`
2. It makes the logic self-evident (*selbstverständlich*)
3. Savigny himself used such systematic divisions in legal treatises

---

## Representing Complex Logic

### Negations (AND_NOT)

Article 6(3) states systems are high-risk UNLESS opt-out conditions are met.

Logical structure: `Annex III AND NOT(opt-out conditions)`

```javascript
{
  "description": "High-risk via Annex III pathway",
  "operator": "AND",
  "children": [
    {
      "description": "System falls within Annex III use cases",
      "operator": "OR",
      "children": [/* 25 use cases */]
    },
    {
      "description": "Opt-out conditions NOT satisfied",
      "operator": "AND_NOT",
      "children": [
        {
          "description": "Opt-out conditions met",
          "operator": "OR",
          "children": [
            {description: "Narrow procedural task"},
            {description: "Improves completed activity"},
            {description: "Detects patterns"},
            {description: "Preparatory task"}
          ]
        }
      ]
    }
  ]
}
```

**Semantics**: The `AND_NOT` node means "parent is true IF this child is FALSE"

---

### Nested Exceptions (Double Negation)

Article 6(3) has a carve-out: "Profiling systems ALWAYS high-risk" (even if opt-out would apply).

Logical structure: `Annex III AND NOT(opt-out AND NOT(profiling))`

```javascript
{
  "description": "Opt-out conditions met [grouping]",
  "operator": "AND",
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
      "operator": "AND_NOT",
      "children": [
        {
          "description": "System performs profiling of natural persons",
          "operator": null,
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

---

## Visual Representation

When rendered, each node type has a distinct icon:

- **∧** = AND node (all children required)
- **∨** = OR node (any child sufficient)
- **¬** = AND_NOT node (child must be false)
- **•** = Leaf requirement
- **→** = Reference to external document
- **?** = Requires LLM interpretation

### Example Tree Visualization:

```
∨ High-Risk Classification (Article 6)
├─ ∧ Pathway 1: Product Safety (Article 6(1))
│  ├─ ∨ Safety component or product [grouping]
│  │  ├─ • Safety component of product
│  │  └─ ∧ Product pathway [grouping]
│  │     ├─ • AI system is itself a product
│  │     └─ → Product covered by Annex I
│  └─ • Requires third-party conformity assessment
└─ ∧ Pathway 2: Annex III Use Cases (Article 6(2))
   ├─ ∨ System in Annex III
   │  ├─ ∨ Area 1: Biometrics
   │  │  ├─ ¬ Remote biometric identification
   │  │  │  └─ • Verification only (excluded)
   │  │  ├─ • Biometric categorization
   │  │  └─ • Emotion recognition
   │  └─ ∨ Area 2-8: [...]
   └─ ¬ Opt-out conditions NOT satisfied
      └─ ∧ Opt-out conditions met [grouping]
         ├─ ? Threshold test (no significant risk)
         ├─ ∨ Alternative conditions
         │  ├─ ? Narrow procedural task
         │  ├─ ? Improves completed activity
         │  ├─ ? Detects patterns
         │  └─ ? Preparatory task
         └─ ¬ System does NOT perform profiling
            └─ • System performs profiling
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

## Key Principles (Updated)

1. **Begriffliche Klarheit (Conceptual Clarity)**: Every node has a single, well-defined purpose
2. **Systematische Geschlossenheit (Systematic Completeness)**: Any boolean logic expressible through explicit grouping
3. **Nachvollziehbarkeit (Traceability)**: Tree structure = logical structure, no hidden rules
4. **Anschaulichkeit (Intuitiveness)**: Legal professionals can read and verify the structure
5. **Separation of Concerns**: Deterministic structure separate from probabilistic interpretation

---

## Design Decisions (v0.2)

### Why Explicit Grouping?

**Considered Alternatives:**
1. Operator on parent with all children same relationship → Cannot handle mixed logic
2. Operator on edges between siblings → Requires precedence rules, ambiguous
3. Default AND + explicit OR groups → Asymmetric, implicit assumptions
4. **Explicit grouping nodes** → Chosen for clarity and completeness

**Trade-off**: Creates "synthetic" nodes for logical grouping that don't directly quote legal text.

**Justification**: Following Savigny's *System des heutigen Römischen Rechts*, systematic divisions serve a structural purpose even when not explicitly in the source text. The grouping nodes are clearly labeled and make the logical structure self-evident.

---

## Implementation Guidelines

### 1. Mapping Legislation

**Step 1**: Identify the Wirknorm (legal consequence)

**Step 2**: Extract all requirements from legal text

**Step 3**: Determine logical relationships:
- Are requirements cumulative (all must be met)? → AND
- Are they alternative (any one sufficient)? → OR
- Is one an exception (must NOT be met)? → AND_NOT

**Step 4**: Create explicit grouping nodes for mixed logic

**Step 5**: Annotate with metadata (article, confidence, LLM flags)

**Step 6**: Stop at external document boundaries (mark as reference nodes)

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

---

## Use Cases

- **Legal Validation**: Lawyers verify the logical structure mirrors the law
- **Case Evaluation**: Apply tree to specific facts, with LLM assistance
- **Compliance Planning**: Identify all requirements for a legal consequence
- **Legislative Analysis**: Compare alternative pathways, identify gaps
- **Systematic Jurisprudence**: Build comprehensive legal system maps

---

## Open Questions (v0.2)

- Optimal granularity: When to stop decomposing requirements?
- Versioning: How to track legislative amendments and interpretation evolution?
- Cross-references: How to handle shared nodes across provisions?
- Visualization: Best UI patterns for very deep trees (10+ levels)?
- LLM Integration: Which model(s) and prompting strategies for legal interpretation?

---

## Changelog

**v0.2** (Current)
- Introduced Unified Tree Architecture
- Defined three node types (Leaf, Operator, Reference)
- Formalized explicit grouping principle
- Added detailed examples from Article 6
- Specified metadata schema
- Updated visual representation with logical symbols

**v0.1**
- Initial concept and two-component architecture
- Basic deterministic/probabilistic separation
- Preliminary visualization requirements
