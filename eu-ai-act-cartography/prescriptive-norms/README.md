# Prescriptive Norms (Deep JSON)

This folder hosts one JSON file per Prescriptive Norm (PN) from the EU AI Act, modeled for deep, mechanical evaluation of applicability (Prüfungsschema). Each PN file follows the schema in `schema/prescriptive-norm.schema.json`.

Key ideas
- Unit: Prescriptive Norm (outward-facing duty/prohibition/permission).
- Separation of concerns: Applicability trees reference shared primitives (roles, classifications, contexts) to minimise duplication.
- Traceability: Every check is anchored to article/paragraph/point, with optional short quotes and hashes.
- Evaluation: Files are facts-agnostic; they define questions and logic. A separate engine provides answers/evidence.

Folder layout
- `schema/` — JSON Schema for PN files.
- `examples/` — Example PN JSONs.
- `shared-primitives/` — Reusable predicates (roles, system types, contexts, exceptions) with IDs.

Conventions
- PN IDs: `PN-<article><optional-letter>` (e.g., `PN-16C`).
- Requirement node IDs: `R-<number>` scoped to the PN file (e.g., `R-1`, `R-1.1`).
- Shared primitive refs: namespaced IDs like `qp:is_provider`, `qp:is_high_risk`, `sys:is_real_time_rbi`, `ctx:is_publicly_accessible_space`, `ex:art6_3_opt_out_valid`.
- All PN evaluations inherit the Global Scope Gate (Art. 2). If a PN requires an additional explicit scope nuance, include it in the tree.

