# Prescriptive Norms and Shared Primitives Index

Last updated: 2025-10-10

This index lists the source-of-truth Prescriptive Norms (PNs) and the shared primitives (reusable gates) currently mapped in this repository.

## Prescriptive Norms (source of truth)

- PN-04 — AI literacy duty for providers and deployers (Article 4)
  - File: `eu-ai-act-cartography/prescriptive-norms/PN-04.json`
  - Status: review
  - Notes: Applies to providers and deployers (no high-risk gate). Legal consequence context embedded; requirements gate on Art. 2 scope and provider/deployer roles.

- PN-05E — Prohibition: untargeted scraping to build facial recognition databases (Article 5(1)(e))
  - File: `eu-ai-act-cartography/prescriptive-norms/PN-05E.json`
  - Status: draft
  - Notes: Prohibits placing/putting/using AI systems that create/expand facial recognition databases via untargeted scraping from internet or CCTV. Gates: Art. 2 scope, AI system, and the practice (untargeted scraping + FR DB creation). Recital (43) noted in context.

## Shared Primitives (reusable requirement gates)

- qp:in_scope_art2 — Regulatory scope (Article 2)
  - File: `eu-ai-act-cartography/prescriptive-norms/shared-primitives/qp-in_scope_art2.json`
  - Triggers (Art. 2(1)) and exclusions (Art. 2(3),(4),(6),(8)); includes 2(1)(c) third-country → EU-output.

- qp:is_ai_system — AI system definition gate (Article 3)
  - File: `eu-ai-act-cartography/prescriptive-norms/shared-primitives/qp-is_ai_system.json`

- qp:is_provider — Role gate (Article 3(2))
  - File: `eu-ai-act-cartography/prescriptive-norms/shared-primitives/qp-is_provider.json`

- qp:is_deployer — Role gate (Article 3(4))
  - File: `eu-ai-act-cartography/prescriptive-norms/shared-primitives/qp-is_deployer.json`

- sys:is_untargeted_scraping_faces — System practice
  - File: `eu-ai-act-cartography/prescriptive-norms/shared-primitives/sys-is_untargeted_scraping_faces.json`
  - Source: Article 5(1)(e); with Recital (43) context.

- sys:is_facial_recognition_db_creation — System practice
  - File: `eu-ai-act-cartography/prescriptive-norms/shared-primitives/sys-is_facial_recognition_db_creation.json`
  - Source: Article 5(1)(e).

## Drafts/Examples (not source of truth)

- PN-05E — Prohibition: untargeted scraping to build facial recognition databases (Article 5(1)(e))
  - File: `eu-ai-act-cartography/prescriptive-norms/examples/PN-05E.json`
  - Status: example/draft; final PN will be added under `prescriptive-norms/` when promoted.

## Notes

- Prescriptive Norm JSON files are the single source of truth for obligations.
- Shared primitives are the single source of truth for reusable gates (scope, roles, classifications, contexts, exceptions).
- This index will grow as we add more PNs and primitives. If you prefer a machine-readable index, we can also publish a PN-INDEX.json alongside this file.
