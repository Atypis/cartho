# EU AI Act Legal Cartography (Prescriptive Norms)

Operational cartography of EU AI Act obligations modeled as Prescriptive Norms (PNs): outward-facing duties, prohibitions, and permissions that can be evaluated mechanically.

## Current Structure

```
eu-ai-act-cartography/
├── prescriptive-norms/                # One JSON per PN (deep, evaluatable)
│   ├── PN-04.json                     # Article 4 (AI literacy)
│   ├── schema/                        # JSON schema for PN files
│   ├── shared-primitives/             # Reusable predicates (roles, contexts, etc.)
│   └── examples/                      # Examples/scratch (non-source of truth)
├── definitions/                       # Legacy definitions (to be folded into shared-primitives)
├── consequences/                      # Legacy consequences (superseded by PN JSONs)
├── annexes/                           # Annex materials
├── shared-requirements/               # Legacy shared components (to be migrated)
├── deprecated/                        # Legacy Wirknormen catalog + selector
└── README.md
```

## What’s Deprecated

- The older Wirknormen-based catalog and selector have been archived under `eu-ai-act-cartography/deprecated/`.
  - Use the Prescriptive Norms JSON under `prescriptive-norms/` for current work.

## Next Steps

- Populate `prescriptive-norms/shared-primitives` with deep role/scope/classification predicates.
- Migrate useful content from `definitions/` and `shared-requirements/` into shared primitives.
- Add more PN JSONs (one per obligation) and a PN index file.

---

Last Updated: 2025-10-10
