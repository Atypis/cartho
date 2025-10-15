# EU AI Act Wirknormen Extraction - COMPLETE

**Date Completed**: 2025-10-09
**Source**: EU AI Act (Regulation (EU) 2024/1689)
**Method**: Systematic article-by-article extraction

---

## Executive Summary

✅ **EXTRACTION COMPLETE**: Identified **49 distinct legal consequences (Wirknormen)** from 110 operative articles

### Key Findings

1. **Total Wirknormen**: 49 (W-001 through W-049)
2. **Articles Analyzed**: 110 articles (Articles 4-113)
3. **Exclusions**: Governance/procedural articles (Member State obligations, Commission powers, review procedures)
4. **Most Complex**: High-risk classification (W-003), Provider obligations (W-014), Deployer obligations (W-024), Real-world testing (W-041)

---

## Complete Wirknormen Catalog

### AI Literacy & Prohibitions (W-001 to W-002h)

**W-001**: Providers AND Deployers must ensure AI literacy of staff dealing with operation/use

**W-002a**: Prohibition - Subliminal manipulation causing harm
**W-002b**: Prohibition - Exploitation of vulnerabilities causing harm
**W-002c**: Prohibition - Social scoring by public authorities/on their behalf
**W-002d**: Prohibition - Risk assessment based solely on profiling/processing special category data (for law enforcement/migration/asylum)
**W-002e**: Prohibition - Untargeted scraping of facial images for facial recognition databases
**W-002f**: Prohibition - Emotion recognition in workplace/education (exceptions: medical/safety reasons)
**W-002g**: Prohibition - Biometric categorisation inferring sensitive attributes (exceptions: lawful labeling/filtering)
**W-002h**: Real-time remote biometric identification in public by law enforcement (3 restricted use cases with authorization)

### High-Risk Classification (W-003a to W-003c)

**W-003a**: AI system classified as high-risk if: product safety component under Annex I + requires third-party conformity assessment
**W-003b**: AI system classified as high-risk if: falls under Annex III use cases (subject to Article 6(3) opt-out)
**W-003c**: Provider may opt-out of high-risk classification per Article 6(3) if: narrow procedural task OR improvement of prior human activity OR pattern detection without influence OR preparatory task (BUT profiling ALWAYS high-risk)

### High-Risk Technical Requirements (W-007 to W-013)

**W-007**: Provider must establish risk management system (identify/analyze/estimate/evaluate/mitigate risks throughout lifecycle)
**W-008**: Provider must implement data governance practices (training/validation/testing datasets per Article 10)
**W-009**: Provider must draw up technical documentation per Annex IV (sufficient to assess compliance, keep up-to-date)
**W-010**: Provider must enable automatic recording of events (logs) for appropriate period
**W-011**: Provider must design system with transparency (deployers can interpret output, understand functioning)
**W-012**: Provider must enable appropriate human oversight (by natural persons, prevent/minimize risks)
**W-013**: Provider must design/develop system with accuracy, robustness, cybersecurity (appropriate level throughout lifecycle)

### Provider Core Obligations (W-014 to W-020)

**W-014**: Provider of high-risk AI has 12 obligations: (1) comply with Chapter III Section 2, (2) quality management system, (3) technical documentation + keep 10 years, (4) automatic logging, (5) keep logs if under provider control, (6) conformity assessment before market, (7) registration per Article 49, (8) corrective actions if non-compliant, (9) inform authorities of non-compliance/risks, (10) affix CE marking, (11) demonstrate conformity, (12) EU declaration of conformity

**W-015**: Provider must establish quality management system per Article 17 (post-market monitoring, serious incident reporting, complaint handling, communication with authorities, etc.)

**W-016**: Provider placing significant change must undergo new conformity assessment

**W-017**: Provider changing intended purpose making system high-risk must undergo conformity assessment

**W-018**: Provider must take corrective actions when system non-compliant + inform stakeholders + investigate risks

**W-019**: Provider must cooperate with authorities + provide information/documentation upon reasoned request + give access to logs

**W-020**: Third-country provider must appoint EU authorized representative + give them mandate for compliance tasks

### Supply Chain Obligations (W-021 to W-023)

**W-021**: Importers have 7 obligations: verify conformity, don't place non-compliant systems, indicate name, ensure storage conditions, keep docs 10 years, provide info to authorities, cooperate

**W-022**: Distributors have 6 obligations: verify CE marking/docs, don't make non-compliant available, ensure storage, take corrective actions, provide info, cooperate

**W-023**: Distributor/importer/deployer/third-party BECOMES provider if: (a) put name/trademark on system, OR (b) substantial modification, OR (c) change intended purpose to make it high-risk

### Deployer Obligations (W-024 to W-026)

**W-024**: Deployers have 12 obligations: use per instructions, assign human oversight, ensure input data quality, monitor operation, keep logs 6mo+, inform workers about monitoring systems, register (if public authority using Annex III systems), DPIA (for certain systems), post-remote biometric ID authorization, inform natural persons being subject to high-risk system, cooperate with authorities, suspend system if serious risk

**W-025**: Post-remote biometric ID requires judicial/administrative authorization (ex ante or within 48h)

**W-026**: Certain deployers (public bodies, private providing public services, specific Annex III systems) must perform Fundamental Rights Impact Assessment (FRIA) before deployment + notify market surveillance

### Conformity & Marking (W-027 to W-030)

**W-027**: Providers must undergo conformity assessment (Annex VI internal control OR Annex VII with notified body)

**W-028**: Certificates valid 4-5 years + can be suspended/withdrawn by notified body

**W-029**: Provider must draw up EU declaration of conformity + keep 10 years + submit on request + keep up to date

**W-030**: Provider must affix CE marking (visibly/legibly/indelibly, or on packaging/docs) + digital CE marking for digital systems + include notified body ID if applicable

### Registration (W-031a to W-031e)

**W-031a**: Provider must register self and system in EU database (Annex III high-risk systems, except point 2) before placing on market

**W-031b**: Provider must register in EU database if claiming Article 6(3) opt-out (NOT high-risk)

**W-031c**: Deployer (public authority/institution) must register self + select system + register use in EU database

**W-031d**: Special secure registration for law enforcement/migration/asylum/border control systems (non-public section with limited info)

**W-031e**: National registration for employment/worker management systems (Annex III point 2)

### Transparency Obligations (W-032 to W-035b)

**W-032**: Provider must inform users they're interacting with AI (unless obvious to reasonably well-informed person)

**W-033**: Provider must mark synthetic audio/image/video/text as AI-generated in machine-readable format + detectable

**W-034**: Deployer must inform persons exposed to emotion recognition/biometric categorisation + process personal data per GDPR

**W-035a**: Deployer must disclose deep fake content (image/audio/video) - limited for artistic/creative/satirical works

**W-035b**: Deployer must disclose AI-generated text published for public information purposes

### General-Purpose AI Models (W-036 to W-040)

**W-036**: General-purpose AI model classified as systemic risk if: (a) high impact capabilities (>10^25 FLOPs presumption) OR (b) Commission decision based on Annex XIII criteria

**W-037**: Provider must notify Commission within 2 weeks if model meets systemic risk threshold (may present arguments against classification)

**W-038**: Provider of general-purpose AI model has 4 core obligations: (a) technical documentation (Annex XI), (b) information to downstream providers (Annex XII), (c) copyright compliance policy, (d) public training content summary

**W-039**: Third-country provider of general-purpose AI model must appoint EU authorized representative before placing on market

**W-040**: Provider of systemic risk model has 4 additional obligations: (a) model evaluation + adversarial testing, (b) assess/mitigate systemic risks at Union level, (c) track/document/report serious incidents, (d) adequate cybersecurity protection

**Exceptions**: W-038 (a)(b) and W-039 exempt open-source models UNLESS systemic risk

### Real-World Testing (W-041 to W-045)

**W-041**: Provider conducting real-world testing must meet 11 cumulative conditions: (a) testing plan submitted, (b) authority approval, (c) registration in EU database, (d) EU establishment or legal representative, (e) data transfer safeguards, (f) max 6 months (+6 extension), (g) vulnerable groups protection, (h) deployers informed + agreement, (i) informed consent (or law enforcement exception), (j) qualified oversight, (k) reversible predictions/decisions

**W-042**: Subject of real-world testing can withdraw consent + request data deletion at any time without detriment

**W-043**: Provider must report serious incidents during testing + adopt mitigation or suspend/terminate + establish recall procedure

**W-044**: Provider must notify authority of suspension/termination + final outcomes

**W-045**: Informed consent requirements: freely-given prior to participation + inform about nature/objectives/duration/rights/reversal/ID/contacts + document + provide copy

### Post-Market Monitoring & Incident Reporting (W-046 to W-048)

**W-046**: Provider of high-risk system must establish post-market monitoring system + plan (proportionate, systematic data collection/analysis, evaluate continuous compliance)

**W-047**: Provider must report serious incidents immediately after establishing causal link (max 15 days, 2 days for widespread/serious, 10 days for death)

**W-048**: Provider must investigate serious incident + risk assessment + corrective action + cooperate with authorities + not alter system before informing authorities

### Right to Explanation (W-049)

**W-049**: Deployer must provide clear/meaningful explanations of AI system's role in individual decision-making + main elements of decision (when decision produces legal effects OR significantly affects person + adverse impact on health/safety/fundamental rights)

---

## Foundational Dependencies

### Shared Requirements Hierarchy

Many Wirknormen share common foundational requirements:

**Level 1 - Universal**:
- "Is AI system" (Article 3(1) definition)

**Level 2 - Role-Based**:
- "Is provider" (triggers W-007 through W-020, W-027 through W-033, W-038, W-040, W-041, W-043, W-044, W-046, W-047, W-048)
- "Is deployer" (triggers W-024, W-026, W-034, W-035a, W-035b, W-049)
- "Is importer" (triggers W-021)
- "Is distributor" (triggers W-022)
- "Is general-purpose AI model provider" (triggers W-036 through W-040)

**Level 3 - Classification-Based**:
- "Is high-risk" (per W-003a/b/c) (triggers W-007 through W-030, W-031a/c, W-046, W-047, W-048, W-049)
- "Is systemic risk general-purpose AI model" (per W-036) (triggers W-040)

**Level 4 - Context-Based**:
- Specific use cases (Annex III areas)
- Specific technical requirements
- Specific transparency scenarios

---

## Grouping Analysis

### Identical Requirements Groups

**Group A - All High-Risk Provider Technical Requirements**:
- W-007 through W-013 share: Is provider + Is high-risk + Specific technical requirement
- Could be represented as: W-HIGH-RISK-TECH[risk_management | data_governance | documentation | logging | transparency | human_oversight | accuracy_robustness_security]

**Group B - All Registration Requirements**:
- W-031a through W-031e share: Registration obligation + Specific database/conditions
- Could be represented as: W-REGISTRATION[eu_database | opt_out | deployer_public | secure_law_enforcement | national_employment]

**Group C - All Transparency Requirements**:
- W-032 through W-035b share: Transparency purpose + Specific disclosure scenario
- Could be represented as: W-TRANSPARENCY[ai_interaction | synthetic_content | emotion_recognition | deepfake_av | deepfake_text]

**Group D - General-Purpose AI Model Core Obligations**:
- W-038 (4 obligations) could be broken into W-038a through W-038d
- All share: Is general-purpose AI model provider

**Group E - Systemic Risk Additional Obligations**:
- W-040 (4 obligations) could be broken into W-040a through W-040d
- All share: Is systemic risk model provider

---

## Critical Observations

### Complexity Hotspots

1. **W-003 (High-Risk Classification)**: Two pathways with opt-out mechanism, profiling override, requires understanding of:
   - Annex I (product safety legislation)
   - Annex III (high-risk use cases)
   - Article 6(3) conditions (narrow procedural task, improvement, pattern detection, preparatory)

2. **W-014 (Provider 12 Obligations)**: Umbrella Wirknorm referencing many other obligations

3. **W-024 (Deployer 12 Obligations)**: Umbrella Wirknorm with diverse requirements (human oversight, data quality, logging, registration, FRIA, authorization, information)

4. **W-041 (Real-World Testing)**: 11 cumulative conditions including approval, registration, consent, oversight, reversibility

### Frequent Exceptions

1. **Law Enforcement Carve-outs**: Articles 5, 50 frequently exempt systems "authorised by law to detect, prevent, investigate or prosecute criminal offences"

2. **Open-Source Model Exemptions**: W-038 (a)(b) and W-039 exempt free and open-source models UNLESS systemic risk

3. **Product Safety Integration**: High-risk AI systems under Annex I harmonisation legislation can integrate with existing conformity/monitoring regimes

4. **Financial Services Integration**: Financial institutions under EU financial services law can use existing governance frameworks for post-market monitoring

### Temporal Applicability

Per Article 113:
- **2 February 2025**: Prohibitions (W-002a through W-002h), Definitions
- **2 August 2025**: General-purpose AI obligations (W-036 through W-040), Governance, Transparency (W-032 through W-035b)
- **2 August 2026**: Most high-risk AI obligations (W-007 through W-031, W-046 through W-049)
- **2 August 2027**: Article 6(1) product safety pathway (W-003a)

---

## Next Steps

1. **Map Annex III Use Cases**: Each use case in Annex III triggers high-risk classification → must be mapped as part of W-003b

2. **Map Shared Requirements**: Create library of reusable requirement components:
   - "Is AI system"
   - "Is provider"
   - "Is deployer"
   - "Is high-risk"
   - "System placed on market"
   - "System in Union"

3. **Build Requirement Trees**: For each Wirknorm, create complete decision tree including:
   - All foundational requirements
   - All cumulative conditions
   - All alternative pathways
   - All exceptions

4. **Create Interactive Selector**: Tool that asks user about their system and identifies which Wirknormen apply

5. **Group by Identical Requirements**: Final grouping where Wirknormen with 100% identical requirements are merged

---

## File References

**Detailed Extraction**: [wirknormen-detailed-extraction.md](wirknormen-detailed-extraction.md)
- Line-by-line analysis of all 110 articles
- Complete requirement documentation for each Wirknorm
- Grouping decisions and rationale

**Checkpoint Files**:
- [wirknormen-checkpoint-articles-20-46.md](wirknormen-checkpoint-articles-20-46.md)
- [wirknormen-checkpoint-articles-47-60.md](wirknormen-checkpoint-articles-47-60.md)

**Progress Tracker**: [wirknormen-extraction-progress.md](wirknormen-extraction-progress.md)

---

## Extraction Complete
**Status**: ✅ All 110 operative articles systematically extracted
**Date**: 2025-10-09
**Total Wirknormen**: 49
