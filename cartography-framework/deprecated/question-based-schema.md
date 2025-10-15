# [DEPRECATED] Question-Based Legal Cartography Schema
Moved to cartography-framework/deprecated on 2025-10-10 for archival.

## Overview

This schema transforms legal requirements into an actionable Prüfungsschema where every node represents a yes/no question leading to concrete consequences.

## Node Types

### 1. Question Node (Sequential)
Represents a single yes/no question in the evaluation flow.

```json
{
  "type": "QUESTION",
  "code": "6.1.A",
  "question": "Is the AI system intended as a safety component OR is it a product covered by Annex I?",
  "legal_provision": "Article 6(1)(a)",
  "confidence": "HIGH",
  "definition": "A safety component is... OR a product covered by Annex I means...",
  "note": "Optional explanatory note",
  "operator": "OR",
  "sub_questions": [
    {
      "code": "6.1.A.1",
      "question": "Is it intended as a safety component?",
      "type": "LEAF",
      "llm_needed": false
    },
    {
      "code": "6.1.A.2",
      "question": "Is it a product covered by Annex I?",
      "type": "REFERENCE",
      "reference": "Annex I"
    }
  ],
  "consequences": {
    "yes": {
      "action": "CONTINUE",
      "next": "6.1.B",
      "message": "Proceed to check third-party assessment requirement"
    },
    "no": {
      "action": "TRY_ALTERNATIVE",
      "next": "6.2.A",
      "message": "Product safety pathway not satisfied. Try Annex III pathway."
    }
  },
  "answer": null,
  "reasoning": null
}
```

### 2. Branch Point (OR Fork)
Represents a point where multiple alternative pathways exist.

```json
{
  "type": "BRANCH",
  "code": "6",
  "question": "Is the AI system high-risk under Article 6?",
  "legal_provision": "Article 6",
  "operator": "OR",
  "branches": [
    {
      "code": "6.1",
      "label": "Pathway 1: Product Safety",
      "first_question": "6.1.A",
      "description": "AI system ties to existing product safety regimes"
    },
    {
      "code": "6.2",
      "label": "Pathway 2: Annex III Use Cases",
      "first_question": "6.2.A",
      "description": "AI system falls within Annex III high-risk use cases"
    }
  ],
  "consequences": {
    "any_yes": {
      "action": "CONCLUDE",
      "result": "HIGH_RISK",
      "message": "System is classified as high-risk"
    },
    "all_no": {
      "action": "CONCLUDE",
      "result": "NOT_HIGH_RISK",
      "message": "System is not classified as high-risk"
    }
  }
}
```

### 3. Conclusion Node
Represents a final conclusion/result.

```json
{
  "type": "CONCLUSION",
  "code": "RESULT_HR",
  "result": "HIGH_RISK",
  "message": "The AI system is classified as high-risk under Article 6 of the EU AI Act",
  "legal_basis": ["Article 6(1)", "Article 6(2)"]
}
```

## Consequence Actions

- **CONTINUE**: Proceed to next question in sequence
- **TRY_ALTERNATIVE**: Current path failed, try alternative branch
- **CONCLUDE**: Reached final conclusion
- **LOOP_BACK**: Return to earlier question (rare, for exceptions)

## Operator Semantics in Questions

### AND Sequence
Questions linked sequentially - all must be "yes" to proceed.

```
Q1: Condition A?
  Yes → Q2
  No → FAIL

Q2: Condition B?
  Yes → Q3
  No → FAIL

Q3: Condition C?
  Yes → SUCCESS
  No → FAIL
```

### OR Alternatives
Single question with multiple sub-questions - any "yes" satisfies.

```
Q: Does A OR B OR C apply?
  Sub-questions:
    - A?
    - B?
    - C?
  If any yes → SUCCESS
  If all no → FAIL
```

### AND_NOT (Exception)
Inverted logic - "yes" means failure.

```
Q: Exception applies?
  Yes → FAIL (exception blocks success)
  No → SUCCESS
```

## Example: High-Risk Classification Flow

```json
{
  "schema_id": "high-risk-classification",
  "root_question": "ROOT",
  "questions": {
    "ROOT": {
      "type": "BRANCH",
      "code": "6",
      "question": "Is the AI system high-risk under Article 6?",
      "operator": "OR",
      "branches": [...]
    },
    "6.1.A": {
      "type": "QUESTION",
      "code": "6.1.A",
      "question": "Is the system a safety component OR a product covered by Annex I?",
      "operator": "OR",
      "sub_questions": [...],
      "consequences": {
        "yes": {"action": "CONTINUE", "next": "6.1.B"},
        "no": {"action": "TRY_ALTERNATIVE", "next": "6.2.A"}
      }
    },
    "6.1.B": {
      "type": "QUESTION",
      "code": "6.1.B",
      "question": "Is third-party conformity assessment required?",
      "consequences": {
        "yes": {"action": "CONCLUDE", "result": "HIGH_RISK"},
        "no": {"action": "TRY_ALTERNATIVE", "next": "6.2.A"}
      }
    },
    "6.2.A": {
      "type": "QUESTION",
      "code": "6.2.A",
      "question": "Does the system fall within Annex III use cases?",
      "operator": "OR",
      "sub_questions": [...],
      "consequences": {
        "yes": {"action": "CONTINUE", "next": "6.2.B"},
        "no": {"action": "CONCLUDE", "result": "NOT_HIGH_RISK"}
      }
    },
    "6.2.B": {
      "type": "QUESTION",
      "code": "6.2.B",
      "question": "Can the system opt-out under Article 6(3)?",
      "operator": "AND",
      "sub_questions": [...],
      "consequences": {
        "yes": {"action": "CONCLUDE", "result": "NOT_HIGH_RISK"},
        "no": {"action": "CONCLUDE", "result": "HIGH_RISK"}
      }
    }
  }
}
```

## Sequential Coding System

- **Level 1 (Pathways)**: 6.1, 6.2
- **Level 2 (Main questions)**: 6.1.A, 6.1.B, 6.2.A
- **Level 3 (Sub-questions)**: 6.1.A.1, 6.1.A.2
- **Level 4 (Nested)**: 6.1.A.2.a, 6.1.A.2.b

## Visualization Implications

Each question becomes a **card** in the flow:
- Shows question prominently
- Shows sub-questions if OR group
- Shows yes/no/evaluate buttons
- Shows consequence arrows
- Highlights active path
- Tracks completion status
