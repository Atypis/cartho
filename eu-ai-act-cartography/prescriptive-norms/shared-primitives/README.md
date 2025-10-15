# Shared Primitives (Qualification Predicates, System Types, Contexts, Exceptions)

Reusable predicates referenced from PN applicability trees. Each primitive should have:
- `id` (e.g., `qp:is_provider`, `qp:is_high_risk`, `sys:is_real_time_rbi`, `ctx:is_publicly_accessible_space`, `ex:art6_3_opt_out_valid`)
- `definition` (Boolean logic over sub-primitives where needed)
- `sources` (article/paragraph/point + optional quote)

Suggested namespaces
- `qp:` Qualification predicates (roles/status): `is_provider`, `is_deployer`, `is_importer`, `is_distributor`, `is_authorised_representative`, `is_gpai_provider`, `is_systemic_risk_model`, `is_high_risk`.
- `sys:` System type predicates: `is_emotion_recognition_system`, `is_biometric_categorisation_system`, `is_real_time_rbi`, `is_post_remote_rbi`, `is_deepfake_generator`.
- `ctx:` Context predicates: `is_publicly_accessible_space`, `is_workplace`, `is_education`, `is_law_enforcement_context`, `is_public_authority_deployer`, `annex_iii_area_<n>`.
- `ex:` Exceptions/defeaters: `le_authorised_rbi_use`, `art6_3_opt_out_valid`, `open_source_exception_gpai`.

This repo does not yet define the primitives JSON schema; we will introduce it after the first PN deep files to drive requirements.

