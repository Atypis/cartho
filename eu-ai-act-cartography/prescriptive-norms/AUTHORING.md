# Prescriptive Norm Authoring Guide (EU AI Act)

Purpose: a concise, up‑to‑date playbook for adding new Prescriptive Norms (PNs) and Shared Primitives (SPs), validating them, and seeing results in the evaluator.

## TL;DR Workflow

- Create a PN JSON from the template.
- Reuse shared primitives for gates (scope, roles, classifications, contexts, exceptions). Add new SPs when truly needed.
- Run the validator: `npm run validate:pn`
- Regenerate index: `npm run build:index`
- Start the evaluator and run an evaluation.

## Conventions

- IDs
  - PN: `PN-<article><optional-letter>` (e.g., `PN-16C`, `PN-05E`).
  - Shared primitives: namespaced ids like `qp:is_provider`, `qp:is_high_risk`, `ctx:is_publicly_accessible_space`, `ex:art6_3_opt_out_valid`.
- Structure
  - PN `requirements` is a Boolean tree: composites (allOf|anyOf|not|xor) and primitives (with `question`).
  - Primitive nodes may reference a shared primitive via `ref`. The evaluator expands these automatically.
- Anchoring
  - Include article/paragraph/point in `article_refs` for PN and in `sources` for nodes.
  - Add short quotes where they clarify; consider adding `quote_hash` later if we enable hashing.
- Temporal
  - Prefer to set `side_info.effective_from` on PN. This won’t affect truth but is useful in UI and reporting.

## Shared Primitives (SPs)

Use existing primitives for:
- `qp:in_scope_art2` — global scope & exclusions
- `qp:is_provider`, `qp:is_deployer` — actor gates

Plan to add soon (or add if needed):
- `qp:is_high_risk` (Art. 6 pathways) with `ex:art6_3_opt_out_valid`
- `ctx:is_publicly_accessible_space`
- `sys:` predicates for Article 5 practices (e.g., `sys:is_untargeted_scraping_faces`)

SPs are small trees with clear per-node questions and sources. Keep them reusable; don’t encode PN‑specific narrowing in an SP.

## Authoring Steps

1) Copy the PN template
- `eu-ai-act-cartography/prescriptive-norms/templates/PN.template.json`
- Fill `id`, `title`, `type`, `article_refs`, `legal_consequence.verbatim`, and set `side_info.effective_from` when known.
- Build `requirements`:
  - Start with `allOf` root containing `qp:in_scope_art2` and actor gates.
  - Add classification/context gates; add exceptions as `not(ex:...)`.
  - Use shared primitives for reusable logic; create new SPs only when necessary.

2) Add/reuse shared primitives
- Location: `eu-ai-act-cartography/prescriptive-norms/shared-primitives/`
- Use the SP template if creating new: `templates/SP.template.json`
- Include article anchors and short questions.

3) Validate
- `npm run validate:pn` — runs JSON Schema and deep lint (structure, refs, cycles, reachability, shared_refs integrity).

4) Update the index
- `npm run build:index` — regenerates `PN-INDEX.json` from files on disk.

5) Evaluate in the UI
- Start evaluator; select your PN in the modal; provide a use case; run an evaluation. The evaluator loads PNs and SPs via the bundle API directly from this repo.

## Best Practices

- Keep PN consequences concise and literal in `verbatim`.
- Keep questions short, direct, and decidable; use `help` text to guide the evaluator.
- Put interpretive notes in `context.items` with a `kind` label (definition/guidance), not in the question.
- Prefer fewer, reusable SPs over repeating logic in multiple PNs.
- Use `xor` when the law sets mutually exclusive alternatives; the engine supports it.

## Editor Checklist

- [ ] PN id/title/type present; verbatim copied and anchored.
- [ ] Root tree contains Art. 2 scope and actor gate(s).
- [ ] Exceptions modeled with `not` over a single child.
- [ ] All `children` ids exist; no duplicate node ids.
- [ ] `shared_refs` matches actual `ref` usage.
- [ ] `side_info.effective_from` set (if known).
- [ ] `npm run validate:pn` passes.

## Support Tools

- Validator: `npm run validate:pn`
  - Validates schemas; detects structural issues; checks ref integrity.
- Index builder: `npm run build:index`
  - Regenerates `PN-INDEX.json` (PNs and shared primitives).
- Bundle API (in evaluator): `/api/catalog`, `/api/prescriptive/bundle?pnIds=...`
  - Evaluator consumes this; authors don’t need to copy files to the UI.

## Ground Truth (Legal Text)

- Primary source: `ai-act-source/EU_AI_Act.md` (full consolidated text). Use this to:
  - Copy exact `legal_consequence.verbatim` for PNs (operative text).
  - Anchor nodes with `sources` (article, paragraph, point) and include short quotes where helpful.
  - Pull recital context where it clarifies intent (e.g., Recital (43) for Article 5(1)(e)).
  - Prefer the consolidated HTML (`OJ…TXT.html`) when checking formatting nuances; keep verbatim faithful to the Markdown source.

## Templates

- PN: `eu-ai-act-cartography/prescriptive-norms/templates/PN.template.json`
- SP: `eu-ai-act-cartography/prescriptive-norms/templates/SP.template.json`
