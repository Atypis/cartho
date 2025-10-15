# 2025-10-10 Prescriptive Norm Modeling Approach (Deep, Reusable, Evaluatable)

This note summarizes the current approach for representing EU AI Act obligations as Prescriptive Norms (PNs) that can be evaluated mechanically while remaining legally faithful and reusable across the catalog.

## Core Principles

- Unit of analysis: Prescriptive Norm (PN) = outward-facing duty, prohibition, or permission addressed to a determinate actor.
- Separation of concerns: split the outward consequence (what) from gating requirements (when it applies).
- Reuse via shared primitives: roles (provider/deployer/etc.), classifications (high-risk/systemic-risk), system types (RBI/emotion recognition/etc.), contexts (publicly accessible space), and exceptions (Art. 6(3) opt-out, LE carve-outs).
- Deterministic evaluation: represent requirements as a boolean decision tree (composites + primitives), independent from interpretive context.

## File Structure (per PN, JSON)

- id, title, type (duty|prohibition|permission)
- article_refs[]: citations with optional short quotes
- legal_consequence
  - verbatim: copy of the operative text
  - notes: optional
  - context (optional)
    - items[]: definition/factor/guidance/note with sources (article/paragraph/point, optional quote)
    - refs[]: pointers to reusable context items (future use)
- requirements
  - root: node id for the entry point
  - nodes[]: requirement nodes (gating logic only)
    - kind: composite | primitive | exception
    - operator (for composite): allOf | anyOf | not | xor
    - children (for composite): node ids
    - ref (for primitive): shared predicate id (e.g., qp:is_provider)
    - question: prompt, answer_type, options/help (for evaluation UX)
    - sources[]: citations for this check (article/paragraph/point, optional quote)
    - context (optional): interpretive items tied to THIS requirement node
      - items[]: definition/factor/guidance/note with sources
      - refs[]: pointers to reusable context items (future use)
  - requirements_context[] (optional): items relevant to the entire requirements tree
- shared_refs[]: list of shared primitive ids referenced
- side_info (optional): effective_from/until, penalty_tier (parked)
- metadata: version, status, extraction_date, authors, reviewers

## Evaluation Semantics (plain language)

- root: start here; this is the top-level sentence whose truth decides if the PN applies.
- composite nodes combine children:
  - allOf = cumulative: all listed requirements must be true
  - anyOf = alternative: at least one must be true
  - not = negation: often used to encode exceptions/defeaters
  - xor = exactly one: rare, but available
- primitive nodes check atomic predicates via shared primitives (e.g., qp:is_provider).
- context items do NOT affect truth; they help interpret the requirement or consequence.

## Cross-Cutting Gates

- Global Scope gate (Art. 2) should be represented as a primitive shared predicate (qp:in_scope_art2) and appear early under the root allOf, unless exceptional.
- High-Risk gate (Art. 6) should be a shared predicate (qp:is_high_risk), composed later from product safety (Art. 6(1)) and Annex III pathway (Art. 6(2)) with the opt-out (Art. 6(3)).
- Exceptions are modeled with not(ex:…), then included under an allOf at the appropriate placement.

## Shared Primitives (namespaces)

- qp: qualification predicates (roles/status): is_provider, is_deployer, is_importer, is_distributor, is_authorised_representative, is_gpai_provider, is_systemic_risk_model, is_high_risk, in_scope_art2
- sys: system types: is_emotion_recognition_system, is_biometric_categorisation_system, is_real_time_rbi, is_post_remote_rbi, is_deepfake_generator
- ctx: contexts: is_publicly_accessible_space, is_workplace, is_education, is_law_enforcement_context, is_public_authority_deployer, annex_iii_area_<n>
- ex: exceptions/defeaters: art6_3_opt_out_valid, le_authorised_rbi_use, art2_2_product_safety_pathway

Each primitive can itself be a logic tree defined once and reused everywhere.

## Modeling Playbook

1) Start from the PN (what): copy the operative text into legal_consequence.verbatim and add consequence_context items if needed.
2) Build the requirements tree (when):
   - R-1: allOf(global scope, actor/classification gates, PN-specific context gates)
   - actor: qp:is_provider / qp:is_deployer / etc.
   - classification: qp:is_high_risk, qp:is_systemic_risk_model
   - context/use: sys:/ctx: as needed
   - exceptions: not(ex:…)
3) Attach per-node context where clarifications matter (definitions/factors/guidance with sources).
4) Add shared_refs for all external primitives referenced.

## Example (Article 4 — AI Literacy)

- legal_consequence.verbatim: operative sentence
- consequence_context: definition of “AI literacy”; factors to consider (knowledge, experience, education, training, context; affected persons)
- requirements.root (allOf): in-scope (Art. 2) AND actor is provider OR deployer
- per-node context: brief definitional notes for provider/deployer (Art. 3)

## Why This Design

- Clean separation of action vs conditions + deterministic evaluation.
- Local interpretive context tied to each requirement, reducing ambiguity across multi-node trees.
- Reuse via shared primitives avoids duplicating definitional logic across dozens of PNs.
- Scales from high-level gates to fully expanded trees without changing shape.

## Next Steps

- Define deep shared primitives for qp:in_scope_art2, qp:is_provider, qp:is_deployer, qp:is_high_risk.
- Encode additional PNs end-to-end (one per category) and validate internal consistency.
- Add a tiny “linter/validator” to check that all nodes referenced exist, operators are sensible, and sources are present where expected.
