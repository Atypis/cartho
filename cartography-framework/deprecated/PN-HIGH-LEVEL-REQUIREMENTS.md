# Prescriptive Norms – High-Level Requirements (Prüfprogramm)

Document Type: Evaluation Schema (High-Level)
Version: 0.9
Date: 2025-10-10
Source Anchor: ai-act-source/EU_AI_Act.md
Relation: Complements PRESCRIPTIVE-NORMS-CATALOG.md (same folder)

Purpose: Provide a first-pass, high-level applicability schema per Prescriptive Norm (PN). At this layer, we keep classifications generic (e.g., “is high-risk”) unless the article narrows them (e.g., specific Annex III points, public authorities, law enforcement). This is the outward-facing “What applies to me?” checklist to determine which PNs a given actor/system must follow. Detailed sub-requirements (definitions, Annex enumerations, full Art. 6/51 trees) are deferred to the mid/full layers.

Legend
- Applies if: all high-level conditions to trigger the PN
- Exceptions: defeaters/caveats that disable or narrow applicability
- Action: the outward obligation/prohibition/permission
- Effective: default per Art. 113 unless stated
- Penalty: upper limit per Art. 99 (or Art. 101 for GPAI fines)

---

## Global Scope & Applicability Gate (Article 2)

All PNs below are evaluated only if the following global scope applies and none of the exclusions apply.

SCOPE-APPLIES (any of Art. 2(1)):
- Provider places on the market or puts into service an AI system in the Union, or places a general-purpose AI model on the Union market (regardless of establishment).
- Deployer of an AI system is established or located within the Union.
- Provider or deployer is in a third country and the output of the AI system is used in the Union.
- Importer or distributor of AI systems (Union market).
- Product manufacturer placing on the market or putting into service an AI system together with the product and under its name/mark.
- Authorised representative of a provider not established in the Union.
- Affected person is located in the Union (relevant for rights/transparency obligations).

SCOPE-EXCLUSIONS (all must be false):
- Areas outside Union law; Member State national security competences are unaffected (Art. 2(3)).
- AI systems placed/put into service or used exclusively for military, defence or national security purposes (including where output used in the Union exclusively for those purposes) (Art. 2(3)).
- Use by third-country public authorities/international organisations in the framework of international law-enforcement/judicial cooperation with adequate safeguards (Art. 2(4)).
- AI systems or AI models (including outputs) specifically developed and put into service for the sole purpose of scientific research and development (Art. 2(6)).
- Research, testing or development activities prior to placing on the market or putting into service (Art. 2(8)); Note: this exclusion does not cover testing in real world conditions, which is regulated by Art. 60.

Special carve-out — product safety pathway (Art. 2(2)):
- For AI systems classified as high-risk under Art. 6(1) related to products covered by Union harmonisation legislation listed in Annex I Section B, only Art. 6(1), Arts. 102–109 and Art. 112 apply (and Art. 57 where integrated). Many Chapter III obligations may not apply via this pathway. Evaluation should branch accordingly.

Evaluation order (for every PN):
1) Global Scope Gate (this section)
2) Actor role(s) and classification gates (e.g., provider, deployer; is high-risk; GPAI/systemic-risk)
3) PN-specific context gates and explicit exceptions (e.g., LE-only, Annex III point limitations, public authority)
4) Temporal applicability (Art. 113)
5) Penalty framework (Art. 99/101)

## Title II — Prohibited AI Practices (Article 5)

PN-05A (Art. 5(1)(a))
- Applies if: Actor = any operator; System = AI; Practice = subliminal/manipulative/deceptive techniques materially distorting behaviour causing or likely to cause significant harm
- Exceptions: none
- Action: Do not place/put into service/use such AI
- Effective: 2025-02-02; Penalty: €35M or 7%

PN-05B (Art. 5(1)(b))
- Applies if: Actor = any operator; System = AI; Practice = exploit vulnerabilities due to age/disability/specific social or economic situation; material distortion; significant harm
- Exceptions: none
- Action: Prohibited
- Effective: 2025-02-02; Penalty: €35M or 7%

PN-05C (Art. 5(1)(c))
- Applies if: Actor = any operator; System = AI; Practice = social scoring leading to detrimental/unfavourable treatment in unrelated contexts or unjustified/disproportionate to behaviour
- Exceptions: none
- Action: Prohibited
- Effective: 2025-02-02; Penalty: €35M or 7%

PN-05D (Art. 5(1)(d))
- Applies if: Actor = any operator; System = AI; Practice = risk assessment of criminal offence based solely on profiling or personality traits/characteristics
- Exceptions: Support to human assessment based on objective, verifiable facts directly linked to a criminal activity
- Action: Prohibited (as described)
- Effective: 2025-02-02; Penalty: €35M or 7%

PN-05E (Art. 5(1)(e))
- Applies if: Actor = any operator; System = AI; Practice = untargeted scraping to create/expand facial recognition databases
- Exceptions: none
- Action: Prohibited
- Effective: 2025-02-02; Penalty: €35M or 7%

PN-05F (Art. 5(1)(f))
- Applies if: Actor = any operator; System = AI; Context = workplace or education; Practice = infer emotions
- Exceptions: Intended for medical or safety reasons
- Action: Prohibited (except as allowed)
- Effective: 2025-02-02; Penalty: €35M or 7%

PN-05G (Art. 5(1)(g))
- Applies if: Actor = any operator; System = AI; Practice = biometric categorisation deducing/infering sensitive attributes
- Exceptions: Labelling/filtering of lawfully acquired biometric datasets; categorisation in law-enforcement area (as specified)
- Action: Prohibited (except carve-outs)
- Effective: 2025-02-02; Penalty: €35M or 7%

PN-05H (Art. 5(1)(h), 5(2))
- Applies if: Actor = law-enforcement authority; System = ‘real-time’ remote biometric identification in publicly accessible spaces; Objective ∈ {victim/missing search; prevent specific, substantial and imminent threat incl. terrorist; locate/identify suspect of listed serious crimes}
- Exceptions: All other ‘real-time’ RBI deployments prohibited; must meet safeguards/authorisations; only to confirm identity of specific target; consider factors in Art. 5(2)
- Action: Prohibited beyond the narrow exceptions; where permitted, follow strict limits
- Effective: 2025-02-02; Penalty: €35M or 7%

---

## Title III — High-Risk AI Systems

### Section 2 — Requirements for High-Risk AI Systems (Articles 9–15)

PN-09 (Art. 9)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Establish/maintain risk management system (lifecycle; testing; acceptable residual risk)
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-10 (Art. 10)
- Applies if: Actor = provider; Classification = is high-risk; System uses data-driven model training
- Exceptions: none
- Action: Meet data/data governance quality criteria and practices
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-11 (Art. 11; Annex IV)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Draw up/maintain technical documentation incl. Annex IV minimum
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-12 (Art. 12)
- Applies if: Actor = provider (design logging); and deployer (retain logs under control); Classification = is high-risk; Special = Annex III(1)(a) extra logging elements
- Exceptions: none
- Action: Ensure automatic logging capability; retain logs appropriately
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-13 (Art. 13)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Design for sufficient transparency; provide instructions for use with required content
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-14 (Art. 14)
- Applies if: Actor = provider (design/identify oversight); deployer (implement oversight); Classification = is high-risk; Special = Annex III(1)(a) two-person verification unless disproportionate in LE/migration/border/asylum contexts per law
- Exceptions: Limited derogations as specified
- Action: Ensure effective human oversight (design and use)
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-15 (Art. 15)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Ensure appropriate accuracy, robustness, cybersecurity; declare accuracy metrics; address feedback loops and specific attack vectors
- Effective: 2026-08-02; Penalty: €15M or 3%

### Section 3 — Obligations of Providers, Deployers and Other Parties (Articles 16–27)

PN-16A (Art. 16(a))
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Ensure compliance with Art. 9–15
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-16B (Art. 16(b))
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Indicate provider identity/contact on system/packaging/docs
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-16C (Art. 16(c), 17)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: Financial institutions may rely on sectoral governance (except specific points)
- Action: Implement quality management system per Art. 17
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-16D (Art. 16(d), 11, 18)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Keep technical/QMS/docs/certificates/EU DoC available for 10 years
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-16E (Art. 16(e), 12, 19)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Keep automatically generated logs under control for ≥ 6 months (or as applicable)
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-16F (Art. 16(f), 43–46)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: Derogation under Art. 46 (specific conditions)
- Action: Complete conformity assessment before placing/putting into service
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-16G (Art. 16(g), 47)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Draw up EU declaration of conformity
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-16H (Art. 16(h), 48)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Affix CE marking (incl. digital/with notified body ID as applicable)
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-16I (Art. 16(i), 49, 71)
- Applies if: Actor = provider; Classification = is high-risk where Art. 49 registration rules apply
- Exceptions: See PN-49A (Annex III(2) national regime)
- Action: Comply with EU database registration obligations
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-16J (Art. 16(j), 20)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Take corrective actions and provide information when non-compliance/risk
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-16K (Art. 16(k), 21)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: confidentiality limits per Art. 78
- Action: Demonstrate conformity and provide access to logs upon reasoned request
- Effective: 2026-08-02; Penalty: €15M or 3% (plus €7.5M/1% for misleading info under Art. 99(5))

PN-16L (Art. 16(l))
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Ensure accessibility per Directives (EU) 2016/2102 and 2019/882
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-17 (Art. 17)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: Financial sector equivalence as specified
- Action: Implement documented QMS with listed components
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-18 (Art. 18)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: Member State arrangements for bankruptcy/cessation
- Action: Keep documentation available for 10 years
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-19 (Art. 19)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: Sectoral financial rules alignment
- Action: Keep logs for at least six months or longer as appropriate
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-20A (Art. 20(1))
- Applies if: Actor = provider; Classification = is high-risk; Condition = suspected/known non-conformity
- Exceptions: none
- Action: Correct/withdraw/disable/recall; inform relevant parties
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-20B (Art. 20(2))
- Applies if: Actor = provider; Classification = is high-risk; Condition = risk per Art. 79(1)
- Exceptions: none
- Action: Investigate; inform authorities/notified body; take corrective action
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-21A (Art. 21(1))
- Applies if: Actor = provider; Classification = is high-risk; Condition = reasoned request by competent authority
- Exceptions: confidentiality per Art. 78
- Action: Provide information/docs in requested language
- Effective: 2026-08-02; Penalty: €15M or 3% (and €7.5M/1% for misleading info)

PN-21B (Art. 21(2)-(3))
- Applies if: Actor = provider; Classification = is high-risk; Condition = reasoned request
- Exceptions: confidentiality per Art. 78
- Action: Give access to logs under control; respect confidentiality
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-22A (Art. 22(1)-(3))
- Applies if: Actor = authorised representative of third-country provider; System = high-risk
- Exceptions: none
- Action: Verify docs/assessments; retain docs 10 years; provide info/logs; cooperate; register where applicable
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-22B (Art. 22(4))
- Applies if: Actor = authorised representative; Condition = provider acts contrary to obligations
- Exceptions: none
- Action: Terminate mandate; inform authority/notified body
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-23 (Art. 23)
- Applies if: Actor = importer; System = high-risk
- Exceptions: none
- Action: Verify conformity before placing; identity marking; storage/transport conditions; retain docs; provide info; cooperate; do not place if non-conform/falsified; inform if risk
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-24 (Art. 24)
- Applies if: Actor = distributor; System = high-risk
- Exceptions: none
- Action: Verify CE, EU DoC, instructions; ensure correct storage/transport; with non-conformity take/ensure corrective action; inform if risk; provide info; cooperate
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-25A (Art. 25(1))
- Applies if: Actor = distributor/importer/deployer/third party; Condition = rebrand or substantial modification to high-risk AI; or modify intended purpose of non-high-risk such that it becomes high-risk per Art. 6
- Exceptions: none
- Action: Assumed provider role with provider obligations
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-25B (Art. 25(2))
- Applies if: Actor = initial provider; Condition = PN-25A occurred
- Exceptions: Where initial provider clearly specified system is not to be changed into a high-risk AI
- Action: Cooperate with new provider; provide necessary information and reasonable technical access/assistance
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-25C (Art. 25(3))
- Applies if: Actor = product manufacturer; Condition = high-risk AI is a safety component placed with product under manufacturer’s name/mark, or designed for exclusive use with product
- Exceptions: none
- Action: Considered provider; assume provider obligations
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26A (Art. 26(1))
- Applies if: Actor = deployer; Classification = is high-risk
- Exceptions: none
- Action: Use per instructions; take appropriate technical/organisational measures
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26B (Art. 26(2)-(3))
- Applies if: Actor = deployer; Classification = is high-risk
- Exceptions: none
- Action: Assign human oversight to competent/trained/authorised persons; organise resources accordingly
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26C (Art. 26(4))
- Applies if: Actor = deployer; Classification = is high-risk; Condition = deployer controls input data
- Exceptions: none
- Action: Ensure input data is relevant and sufficiently representative for intended purpose
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26D (Art. 26(5))
- Applies if: Actor = deployer; Classification = is high-risk
- Exceptions: Sensitive operational data for LE deployers excluded from reporting scope
- Action: Monitor operation; suspend use and inform provider/distributor/authority if risk; report serious incidents; if provider unreachable follow Art. 73 mutatis mutandis
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26E (Art. 26(6))
- Applies if: Actor = deployer; Classification = is high-risk
- Exceptions: Financial institutions align with sector rules
- Action: Keep logs under control ≥ 6 months or longer as applicable
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26F (Art. 26(7))
- Applies if: Actor = deployer (employer); Classification = is high-risk; Context = workplace
- Exceptions: none
- Action: Inform workers’ representatives and affected workers before use
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26G (Art. 26(8), 49, 71)
- Applies if: Actor = deployer (public authority/Union body or on their behalf); Classification = Annex III high-risk (except point 2)
- Exceptions: none
- Action: Register use in EU database; if not registered by provider, do not use and inform provider/distributor
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26H (Art. 26(9))
- Applies if: Actor = deployer; Classification = is high-risk
- Exceptions: none
- Action: Use provider info (Art. 13) to meet DPIA obligations under GDPR/LED
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26I (Art. 26(10))
- Applies if: Actor = deployer (law enforcement); System = post-remote biometric identification; Context = targeted search within criminal investigation/proceeding (subject to strict conditions)
- Exceptions: No untargeted use; no adverse legal decision solely on output; data deletion upon authorisation rejection; Member States may adopt stricter laws; without prejudice to data protection rules
- Action: Obtain prior or immediate ex-post authorisation (≤48h); document and annually report uses
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26J (Art. 26(11))
- Applies if: Actor = deployer; Classification = Annex III high-risk used to make/assist decisions about natural persons
- Exceptions: For LE uses, LED rules apply
- Action: Inform natural persons they are subject to high-risk AI use
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-26K (Art. 26(12))
- Applies if: Actor = deployer; Classification = is high-risk
- Exceptions: none
- Action: Cooperate with competent authorities
- Effective: 2026-08-02; Penalty: €15M or 3%

PN-27 (Art. 27)
- Applies if: Actor = deployer that is: public body or private entity providing public services; and deployers of systems under Annex III points 5(b) and 5(c); Classification = high-risk via Art. 6(2); Exclusion = Annex III point 2 systems
- Exceptions: May rely on prior FRIA in similar cases; complements GDPR/LED DPIA
- Action: Perform Fundamental Rights Impact Assessment; notify market surveillance authority; update if elements change
- Effective: 2026-08-02; Penalty: €15M or 3%

### Section 4 — Notifying Authorities and Notified Bodies (Articles 28–31,33–35)

PN-28 (Art. 28)
- Applies if: Actor = Member State (notifying authority establishment/operation)
- Exceptions: none
- Action: Designate/organise notifying authorities; ensure resources, impartiality, confidentiality
- Effective: 2025-08-02

PN-29/30 (Art. 29–30)
- Applies if: Actor = conformity assessment body; and notifying authority
- Exceptions: none
- Action: Apply for notification with required evidence; notify Commission/Member States; handle objections; maintain documentation
- Effective: 2025-08-02

PN-31/33/34/35 (Art. 31, 33(1)(3)(4), 34)
- Applies if: Actor = notified body
- Exceptions: confidentiality obligations
- Action: Meet organisational/competence requirements; perform conformity tasks; inform authorities/peers; cooperate; maintain procedures
- Effective: 2025-08-02; Penalty: €15M or 3%

### Conformity Assessment, EU DoC, CE Marking, Registration (Articles 43–49)

PN-43 (Art. 43)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: Sectoral Annex I regimes; changes pre-determined at initial CA are not substantial modifications
- Action: Follow applicable conformity assessment route; re-assess after substantial modification
- Effective: 2026-08-02

PN-44/45 (Art. 44–45)
- Applies if: Actor = notified body
- Exceptions: confidentiality obligations
- Action: Issue/manage certificates; suspend/withdraw/restrict where needed; share info with authorities/peers
- Effective: 2025-08-02

PN-46 (Art. 46)
- Applies if: Actor = market surveillance authority; LE/civil protection (urgent use)
- Exceptions: Stop use and discard outputs if authorisation refused
- Action: Authorise temporary placing/putting into service for exceptional reasons; urgent use allowed with subsequent authorisation; inform Commission/Member States
- Effective: 2026-08-02

PN-47 (Art. 47)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Draw up EU declaration of conformity
- Effective: 2026-08-02

PN-48 (Art. 48)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: none
- Action: Affix CE marking (incl. digital and notified body ID where applicable)
- Effective: 2026-08-02

PN-49A (Art. 49(1)-(2), 71)
- Applies if: Actor = provider/authorised representative; System = Annex III high-risk (except Annex III point 2) before placing/putting into service; or AI system registered for Art. 6(3) opt-out claim
- Exceptions: Annex III point 2 → national registration
- Action: Register provider/system (or opt-out claim) in EU database (secure sections as applicable)
- Effective: 2026-08-02

PN-49B (Art. 49(3)-(5), 71)
- Applies if: Actor = deployer (public authority/Union body or on their behalf); System = Annex III high-risk (except Annex III point 2)
- Exceptions: none
- Action: Register deployer/use in EU database (secure section for Annex III points 1,6,7); national registration for Annex III point 2
- Effective: 2026-08-02

---

## Title IV — Transparency Obligations for Certain AI Systems (Article 50)

PN-50A (Art. 50(1))
- Applies if: Actor = provider; System = AI intended to interact directly with natural persons
- Exceptions: Obviousness to a reasonably well-informed, observant, circumspect person; authorised LE systems except when publicly available for reporting
- Action: Inform natural persons they are interacting with AI
- Effective: 2025-08-02; Penalty: €15M or 3%

PN-50B (Art. 50(2))
- Applies if: Actor = provider (including GPAI); System = generates synthetic audio/image/video/text
- Exceptions: Assistive standard editing or no substantial alteration; authorised LE uses
- Action: Mark outputs machine-readably; ensure detectability (effective/interoperable/robust/reliable)
- Effective: 2025-08-02; Penalty: €15M or 3%

PN-50C (Art. 50(3))
- Applies if: Actor = deployer; System = emotion recognition or biometric categorisation
- Exceptions: Permitted LE uses with safeguards and Union law compliance
- Action: Inform natural persons exposed; process personal data per GDPR/Reg. 2018/1725/LED
- Effective: 2025-08-02; Penalty: €15M or 3%

PN-50D (Art. 50(4) 1st subpara)
- Applies if: Actor = deployer; System = generates/manipulates image/audio/video constituting deep fake
- Exceptions: Authorised LE use; artistic/creative/satirical/fictional/analogous works → limited disclosure that doesn’t hamper enjoyment
- Action: Disclose that content is artificially generated/manipulated
- Effective: 2025-08-02; Penalty: €15M or 3%

PN-50E (Art. 50(4) 2nd subpara)
- Applies if: Actor = deployer; System = generates/manipulates text published to inform public on matters of public interest
- Exceptions: Authorised LE use; or where AI-generated content underwent human review/editorial control and an editor holds responsibility
- Action: Disclose that text is artificially generated/manipulated
- Effective: 2025-08-02; Penalty: €15M or 3%

PN-50F (Art. 50(5)-(7))
- Applies if: Actor = provider/deployer under PN-50A–E
- Exceptions: none
- Action: Provide information by first interaction/exposure; meet accessibility; subject to codes of practice/common rules
- Effective: 2025-08-02

---

## Title V — General-Purpose AI Models (Articles 53–56)

PN-53A (Art. 53(1)(a), Annex XI)
- Applies if: Actor = GPAI provider; Scope = model placed on EU market
- Exceptions: Open-source exemption does not cover this point for systemic-risk models
- Action: Draw up/maintain technical documentation; provide upon request
- Effective: 2025-08-02; Penalty: Commission fines (Art. 101) and national penalties as applicable

PN-53B (Art. 53(1)(b), Annex XII)
- Applies if: Actor = GPAI provider; Scope = EU market
- Exceptions: none (systemic risk: also PN-55)
- Action: Provide information enabling downstream providers to understand capabilities/limitations and comply; include Annex XII elements
- Effective: 2025-08-02

PN-53C (Art. 53(1)(c))
- Applies if: Actor = GPAI provider; Scope = EU market
- Exceptions: none
- Action: Policy to comply with EU copyright/related rights incl. reservation of rights detection/compliance
- Effective: 2025-08-02

PN-53D (Art. 53(1)(d))
- Applies if: Actor = GPAI provider; Scope = EU market
- Exceptions: none
- Action: Publish a sufficiently detailed summary of training content (AI Office template)
- Effective: 2025-08-02

PN-53E (Art. 53(2))
- Applies if: Actor = GPAI provider; Model = free/open-source with parameters/architecture/usage info public
- Exceptions: Not applicable to systemic-risk models
- Action: Exemption from PN-53A/B only; not from PN-53C/D
- Effective: 2025-08-02

PN-53F (Art. 53(3))
- Applies if: Actor = GPAI provider
- Exceptions: none
- Action: Cooperate with Commission/national authorities
- Effective: 2025-08-02

PN-54 (Art. 54)
- Applies if: Actor = authorised representative for third-country GPAI provider; Scope = EU market
- Exceptions: Open-source models unless systemic-risk
- Action: Verify/retain docs; provide info; cooperate; terminate if non-compliant
- Effective: 2025-08-02

PN-55A (Art. 55(1)(a))
- Applies if: Actor = GPAI provider; Classification = systemic-risk model per Art. 51/52
- Exceptions: none
- Action: Perform model evaluation and adversarial testing
- Effective: 2025-08-02; Penalty: Commission fines (Art. 101)

PN-55B (Art. 55(1)(b))
- Applies if: Actor = GPAI provider; Classification = systemic-risk model
- Exceptions: none
- Action: Assess and mitigate systemic risks at Union level across lifecycle
- Effective: 2025-08-02; Penalty: Commission fines (Art. 101)

PN-55C (Art. 55(1)(c))
- Applies if: Actor = GPAI provider; Classification = systemic-risk model
- Exceptions: none
- Action: Track/document/report serious incidents and corrective measures to AI Office/authorities
- Effective: 2025-08-02; Penalty: Commission fines (Art. 101)

PN-55D (Art. 55(1)(d))
- Applies if: Actor = GPAI provider; Classification = systemic-risk model
- Exceptions: none
- Action: Ensure adequate cybersecurity for model and infrastructure
- Effective: 2025-08-02; Penalty: Commission fines (Art. 101)

PN-56 (Art. 56)
- Applies if: Actor = GPAI providers; AI Office; Board
- Exceptions: none
- Action: Develop/adhere to codes of practice; Commission may adopt common rules if codes are not finalised/adequate
- Effective: 2025-08-02 (codes targeted by 2025-05-02)

---

## Title VI — Measures in Support of Innovation (Articles 57–63)

PN-57–59 (Art. 57–59)
- Applies if: Actor = Member States; EDPS for Union bodies
- Exceptions: none
- Action: Establish AI sandboxes; resource and supervise; issue guidance/exit reports; cooperate
- Effective: 2026-08-02 (established by date)

PN-60 (Art. 60)
- Applies if: Actor = provider/prospective provider (and partnering deployers); System = Annex III high-risk (RWT before placing/putting into service)
- Exceptions: Prohibitions under Art. 5; sectoral testing laws; tacit approval depends on national law
- Action: Meet plan/approval/registration/establishment/data transfer/duration/vulnerable groups/agreements/consent safeguards for real-world testing
- Effective: 2026-08-02

PN-61 (Art. 61)
- Applies if: Actor = provider/prospective provider (and deployers if applicable); Context = real-world testing
- Exceptions: none
- Action: Obtain/document freely-given informed consent with required information; provide copy to subjects
- Effective: 2026-08-02

PN-62–63 (Art. 62–63)
- Applies if: Actor = Member States; AI Office; microenterprises
- Exceptions: none
- Action: Priority access/support to SMEs; reduced fees; templates/platform; microenterprises may use simplified QMS elements (guidelines)
- Effective: Art. 62 from 2025-08-02; Art. 63 from 2026-08-02

---

## Title VII — Governance (Articles 64–71)

PN-64–68 (Art. 64–68)
- Applies if: Actor = Commission/AI Office; scientific panel experts
- Exceptions: confidentiality, independence rules
- Action: Establish Union governance, scientific panel, alerts, tools/benchmarks support
- Effective: 2025-08-02

PN-69–71 (Art. 69–71)
- Applies if: Actor = Member States; Commission; providers/deployers (data entry per PN-49)
- Exceptions: secure sections for LE/migration/asylum
- Action: Access experts; designate authorities and SPOCs; resource and report; set up/maintain EU database; ensure public/secure access split
- Effective: 2025-08-02

---

## Title IX — Post-Market Monitoring, Information Sharing and Market Surveillance (Articles 72–76)

PN-72 (Art. 72)
- Applies if: Actor = provider; Classification = is high-risk
- Exceptions: integrate with sectoral regimes where applicable
- Action: Establish post-market monitoring system based on plan; collect/analysis; evaluate continuous compliance; include interactions; exclude sensitive LE deployer data
- Effective: 2026-08-02

PN-73 (Art. 73)
- Applies if: Actor = provider (and deployer when applicable); Classification = is high-risk; Condition = serious incident
- Exceptions: MDR/IVDR routing; other regime limitations
- Action: Timely reporting with deadlines; investigate/assess risk; corrective actions; cooperate; authority follow-up within 7 days
- Effective: 2026-08-02

PN-74–76 (Art. 74–76)
- Applies if: Actor = market surveillance authorities; Member States; Commission
- Exceptions: sectoral Annex I procedures supersede
- Action: Enforce under Reg. 2019/1020; report annually; remote powers; safeguard and Union procedures
- Effective: 2025-08-02

---

## Title X–XII — Standards, Delegated/Implementing Acts, Penalties (Articles 40–41, 97–101)

PN-40–41 (Art. 40–41)
- Applies if: Actor = Commission (standards/common specifications); providers (presumption of conformity use)
- Exceptions: none
- Action: Promote/issue standards/common specifications; providers may rely on harmonised standards for presumption
- Effective: 2026-08-02

PN-97–98 (Art. 97–98)
- Applies if: Actor = Commission
- Exceptions: none
- Action: Adopt delegated/implementing acts as specified (amend annexes, templates, codes)
- Effective: 2025-08-02

PN-99 (Art. 99)
- Applies if: Actor = Member States
- Exceptions: SMEs caps at lower of percent/amount; public body rules by MS
- Action: Lay down penalties; notify Commission; apply upper limits per category; consider listed factors; due process
- Effective: 2025-08-02

PN-100–101 (Art. 100–101)
- Applies if: Actor = EDPS (Union bodies); Commission (GPAI providers)
- Exceptions: judicial review safeguards
- Action: EDPS impose administrative fines on Union institutions; Commission impose fines on GPAI providers for specified infringements
- Effective: 2025-08-02

---

Notes
- High-risk kept generic at this layer; narrowings (e.g., Annex III point references) are captured where the article expressly limits them (e.g., PN-26G, PN-49A/B, PN-27).
- Law-enforcement carve-outs/limitations are included where explicit (PN-05H, PN-26I, PN-50C/D/E).
- GPAI systemic-risk depends on Art. 51/52 designation (captured generically).
- Next layers will expand QP trees (Art. 6(1)/(2)/(3); Annexes; systemic-risk criteria) and derive minimal question sets for evaluation.
