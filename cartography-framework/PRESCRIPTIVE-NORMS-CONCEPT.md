# Prescriptive Norms Concept: Outward-Facing Obligations and Filtering Criteria

Document Type: Conceptual Framework
Version: 1.0
Date: 2025-10-10
Author: EU AI Act Legal Cartography Project
Status: Foundational (supersedes Wirknormen concept for outward-facing obligations)

---

## Executive Summary

This document defines “Prescriptive Norms” (PN) as the primary, outward-facing unit for operational compliance under the EU AI Act. A Prescriptive Norm is an actionable conduct directive (duty, prohibition, or permission/rights) addressed to a determinate actor, with explicit conditions for applicability, effective dates, and penalty consequences. Classifications such as “is high-risk” are modeled separately as Qualification Predicates (QP) that switch Prescriptive Norms on or off but are not obligations themselves. This pivot ensures our cartography answers the practitioner’s core question: “What do I have to do?”

Core shift: From structure- or classification-centric mapping to obligation-centric (prescriptive) mapping, while retaining formal logic for applicability.

---

## 1. Terminology and Scope

### 1.1 Prescriptive Norm (PN)
Definition: A discrete, enforceable conduct directive addressed to an actor, specifying a required or forbidden action (or a granted right/permission), with a decidable condition predicate, effective window, and penalty tier.

Key properties:
- Actor-facing: addresses a specific role (e.g., provider, deployer, importer, distributor, GPAI provider).
- Conduct-specific: requires doing or refraining from doing something; or grants a right/permission.
- Decidable applicability: based on a Boolean condition over Qualification Predicates and Exceptions.
- Temporalized: includes effective_from/until to reflect phased applicability.
- Traceable: anchored to article/paragraph/point references and short source quotes.
- Measurable penalty: includes penalty tier per AI Act (e.g., €35M/7% for prohibitions; €15M/3% for requirements).

Types of PN:
- Duty: “must/shall” perform X.
- Prohibition: “must not/shall not” perform Y.
- Permission/Right: “may” perform Z (optional to include by default in outward obligation views; see 3.4).

### 1.2 Qualification Predicate (QP)
Definition: A decidable predicate representing status/classification/role or situational conditions that gate PNs. QPs never themselves impose conduct.

Examples: “Is AI system”; “Is provider”; “Is high‑risk” (Annex III pathway and product safety pathway); “Is systemic‑risk GPAI model”; “Placed on market or put into service”.

### 1.3 Exceptions / Carve‑Outs (EX)
Definition: Defeaters that negate or narrow a PN when their conditions hold (e.g., law enforcement carve‑outs, special sectoral exemptions, Article 6(3) opt‑out when valid).

### 1.4 Definitional Rules (DR)
Definition: Definitions and scoping rules referenced by QP/PN (e.g., “reasonably foreseeable misuse”, “appropriate level of accuracy”). DRs are not conduct by themselves.

### 1.5 Aggregators (AG)
Definition: Composite nodes that group several PNs for navigation/UX (e.g., “Provider Core Obligations”). AGs are not standalone obligations and have no independent penalty.

---

## 2. Filtering Policy: What We Include and Exclude

### 2.1 Inclusion (PN)
We include as Prescriptive Norms any outward-facing directive that:
- Requires or forbids conduct by an actor (duty or prohibition), or
- Grants a right/permission relevant to compliance planning (optional default visibility), and
- Has traceable legal anchors (article/paragraph/point) and a decidable applicability condition over QPs/EX, and
- Has an effective date window and a penalty regime (where applicable).

Representative PN categories under the AI Act:
- Technical requirements for high‑risk systems (e.g., risk management, data governance, logging, transparency).
- Registration and notification duties.
- Provider, deployer, importer, distributor obligations.
- GPAI provider obligations; systemic‑risk GPAI additional obligations.
- Prohibitions in Article 5.
- Transparency duties for specific use cases (e.g., emotion recognition disclosures, deepfakes).

### 2.2 Exclusion (not PN)
We exclude from PN (but retain as QP/DR/EX):
- Pure classifications/status determinations (e.g., “is high‑risk”, “is systemic‑risk model”, “is provider”).
- Definitional content and annex detail that describe documentation format or assessment procedure without imposing conduct by themselves.
- Umbrella/summary statements that merely collect obligations without imposing an independent directive.

### 2.3 Edge Handling: Permissions/Rights
Permissions/rights (“may”) are modeled as PN of type=permission when they materially affect compliance posture (e.g., right to perform real‑world testing under conditions). Default outward “obligation” views may hide permissions unless toggled.

---

## 3. Identification Criteria and Tests

Each PN must satisfy:
- Conduct test: It tells an actor to do or not do something, or confers a right that alters permissible conduct.
- Decidability test: Applicability is determinable via QP/EX Boolean logic given a complete fact pattern.
- Traceability test: Source is anchored to article/paragraph/point plus minimal quote for context.
- Temporal test: Effective window is encoded; not surfaced before the effective date.
- Penalty test: Penalty tier captured or explicitly marked “none/NA”.

Non‑PN (QP/DR/EX/AG) must satisfy their respective roles and never appear in outward obligation lists.

---

## 4. Data Model (Sketch)

### 4.1 Prescriptive Norm (PN)
```json
{
  "id": "PN-011",
  "type": "duty",  
  "actor": "provider",
  "title": "Design system with transparency",
  "consequence": {
    "action": "design",
    "object": "AI system",
    "spec": "ensure deployers can interpret outputs and understand functioning"
  },
  "conditions": {
    "allOf": ["QP-002:is_provider", "QP-004:is_high_risk"],
    "noneOf": ["EX-050:law_enforcement_carveout_if_applicable"]
  },
  "effective": {"from": "2026-08-02"},
  "penalty": {"tier": "€15M or 3%"},
  "sources": [
    {"article": 13, "paragraph": 1, "quote": "…shall be designed and developed…"}
  ],
  "interpretation_flags": ["open_textured:appropriate_level_of_transparency"],
  "notes": ""
}
```

### 4.2 Qualification Predicate (QP)
```json
{
  "id": "QP-004",
  "name": "is_high_risk",
  "logic": {
    "anyOf": [
      {"ref": "QP-004a:product_safety_pathway"},
      {
        "allOf": [
          {"ref": "QP-001:is_ai_system"},
          {"ref": "QP-003:annex_iii_area_match"},
          {"not": {"ref": "EX-006:article_6_3_opt_out_valid"}}
        ]
      }
    ]
  },
  "sources": [{"article": 6, "paragraph": 2}],
  "notes": "Classification only; not an obligation."
}
```

### 4.3 Exceptions (EX)
```json
{
  "id": "EX-006",
  "name": "article_6_3_opt_out_valid",
  "logic": {"allOf": ["QP-003:annex_iii_area_match", "condition:non_profiling_use", "condition:documentation_submitted"]},
  "sources": [{"article": 6, "paragraph": 3}]
}
```

### 4.4 Aggregator (AG)
```json
{
  "id": "AG-014",
  "name": "provider_core_obligations",
  "children": ["PN-007", "PN-008", "PN-009", "PN-010", "PN-011", "PN-012", "PN-013"],
  "note": "Navigation only; not an obligation; no penalty."
}
```

---

## 5. Migration from “Wirknormen” to Prescriptive Norms

### 5.1 Renaming and Reclassification
- W‑002a–h (prohibitions) → PN‑002a–h (type=prohibition).
- W‑007–013 (technical requirements) → PN‑007–013 (type=duty).
- W‑014 (provider core obligations) → AG‑014 (aggregator). No standalone PN.
- W‑024 (deployer core obligations) → AG‑024 (aggregator).
- W‑031a–e (registration regimes) → PN‑031a–e (type=duty).
- W‑036–040 (GPAI) → PN‑036–040 (type=duty), with QP‑010 “systemic‑risk model” as a gate.
- W‑041–045 (real‑world testing) → PN (mix of duties/permissions) plus EX for safeguards.
- W‑003a–c (high‑risk classification) → QP‑003a–c (classification; not PN).

### 5.2 ID Strategy
- PN‑NNN for prescriptive norms (outward obligations/rights).
- QP‑NNN for qualification predicates (classifications/roles/situational status).
- EX‑NNN for exceptions/caveats.
- AG‑NNN for aggregators.
- DR‑NNN for definitional rules (optional to enumerate where helpful).

### 5.3 Backwards Compatibility
- Maintain a mapping table from legacy W‑ids to PN/QP/AG/EX for traceability.
- The selector UI defaults to PN; QP evaluation occurs under the hood.

---

## 6. Evaluation Model

Applicable PN at date T for actor/system S are those where:
- All referenced QP evaluate true on S.
- No referenced EX evaluates true on S.
- T lies within PN.effective window.

Output for each PN includes: actor, action, object, source anchors, penalty, and interpretation flags.

Minimal questioning: leverage the QP DAG to compute the smallest set of questions whose answers decide the truth of all QPs referenced by candidate PNs.

---

## 7. Quality Assurance and Validation

- Satisfiability: PN conditions must be satisfiable (no contradictory gates).
- Non‑redundancy: No duplicate PN with identical actor+action+conditions.
- Coverage: Report of normative statements discovered vs. mapped PN, with known intentional exclusions (QP/DR/AG).
- Traceability: Every PN/QP/EX includes article/paragraph/point and minimal quotes.
- Temporal correctness: Surfacing respects effective dates.
- Interpretation flags: Open‑textured terms are flagged with references for reviewer attention.

---

## 8. Examples

1) PN‑009: Technical Documentation Duty
- Actor: Provider
- Action: Draw up and keep technical documentation per Annex IV
- Conditions: QP‑002:is_provider AND QP‑004:is_high_risk
- Effective: 2026‑08‑02
- Sources: Art. 11; Annex IV
- Penalty: €15M or 3%

2) PN‑002c: Prohibition – Biometric Categorisation
- Actor: Any operator
- Action: Must not deploy biometric categorisation based on sensitive attributes (subject to exceptions)
- Conditions: QP‑001:is_ai_system
- Exceptions: EX‑050:law_enforcement_specific_carveout (where applicable)
- Effective: 2025‑02‑02
- Sources: Art. 5
- Penalty: €35M or 7%

3) PN‑036: GPAI Provider: Model Card/Documentation
- Actor: GPAI Provider
- Action: Provide technical documentation and model information to downstream deployers and AI Office
- Conditions: QP‑006:is_gpai_provider
- Effective: 2025‑08‑02
- Sources: GPAI chapter (Articles 53+)
- Penalty: €15M or 3%

---

## 9. Roadmap

- Phase 1: Introduce PN/QP/EX/AG schema and migrate 10 representative items (prohibitions, core technical requirements, GPAI duties, registration duties).
- Phase 2: Complete PN coverage; produce mapping table W‑ids → PN/QP/EX/AG.
- Phase 3: Add validator (lint, coverage, satisfiability) and golden test vectors.
- Phase 4: Update selector to show PN by default with PN/QP explanations on demand.

---

## 10. Status

This document supersedes the “Wirknormen Concept” for the purpose of outward‑facing compliance. The Wirknorm construct remains useful as a general logical framing, but “Prescriptive Norm” is the unit we surface to users when answering “What do I have to do?”

