# Legal Cartography v0.1

## Core Concept

Legal cartography is a methodology for mapping legislation by combining deterministic legal logic with probabilistic interpretation through large language models (LLMs). The approach creates a traceable, verifiable system for arriving at legal conclusions.

## Two-Component Architecture

### 1. Deterministic Core Set (Rechtskernsatz)

The deterministic component maps the logical structure of legal provisions:

- **Starting Point (Wirknorm)**: A legal consequence of interest (e.g., "obligation to test AI systems under Article 9")
- **Requirements Tree**: The precise logical set of cumulative and/or alternative requirements necessary to determine whether the legal consequence applies
- **Branching Structure**: Further exploration (ausgefächerte) into sub-requirements, exceptions, scope conditions, and ground rules
- **Logical Operators**: Cumulative (AND) and alternative (OR) relationships between requirements

**Example Structure:**
```
Legal Consequence: Obligation to test AI systems (Article 9)
├─ [AND] Requirement 1: EU AI Act is applicable (scope)
├─ [AND] Requirement 2: System is classified as high-risk
│   ├─ [OR] Listed in Annex III
│   ├─ [OR] Safety component under Annex I
│   └─ [AND] Exception does not apply
└─ [AND] Requirement 3: Additional provision X applies
    ├─ Sub-requirement 3.1
    └─ Sub-requirement 3.2
```

### 2. Probabilistic Interpretation Layer (LLM)

LLMs handle fuzzy, interpretative requirements that cannot be determined purely through rule-based logic:

- **Interpretation of Concepts**: Evaluating terms like "unacceptable risk", "reasonable precautions", "significant modification"
- **Context Injection**: Providing specific factual context to ground interpretation
- **Traceability**: Recording reasoning, context, and justification for each interpretation
- **Human Override**: Allowing legal professionals to review and modify LLM conclusions at each node

## Key Principles

1. **Separation of Concerns**: Deterministic legal structure remains separate from probabilistic interpretation
2. **Transparency**: Complete reasoning chain is visible and traceable
3. **Verifiability**: Each interpretative step can be reviewed, challenged, and overridden
4. **Reusability**: Nodes/elements/requirements may be relevant for multiple provisions

## Visualization & Interface

The system should enable:

- Visual mapping of the complete requirement tree
- Inspection of LLM reasoning at each interpretative node
- Manual override of interpretations with justification tracking
- Navigation between related provisions that share common requirements

## Use Cases

- Judges applying legislation to cases
- Lawyers advising clients on compliance
- Public administrators conducting regulatory assessments
- Compliance officers evaluating organizational obligations

## Open Questions (v0.1)

- Data structure: Graph database vs. other approaches?
- Mapping strategy: Start with root consequences or bottom-up from concrete norms?
- Handling of shared nodes across multiple provisions
- Granularity of decomposition - where to stop branching?
- Version control for legal interpretation evolution