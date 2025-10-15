# EU AI Act – Prescriptive Norms (Comprehensive Catalogue)

Document Type: Catalogue (Outward‑Facing Obligations)
Version: 0.9 (first comprehensive pass)
Date: 2025-10-10
Source: ai-act-source/EU_AI_Act.md
Scope: All outward‑facing prescriptive norms (duties, prohibitions, permissions/rights) grouped by actor and article. Classification predicates (e.g., “is high‑risk”) are not catalogued as prescriptive norms; they gate applicability.
Effective Dates: As per Article 113. Where not specified per-item, defaults apply.

Notes:
- PN = Prescriptive Norm (outward-facing conduct directive).
- QP = Qualification Predicate (classification/role/status; not a PN).
- EX = Exception / carve‑out.
- AG = Aggregator (navigation only; no independent obligation).
- This catalogue favors precision and traceability over brevity; paraphrases stay close to the legal text with article anchors.

---

## Effective Date Matrix (Article 113)

- Prohibitions and general provisions (Ch. I–II): from 2025‑02‑02
- Transparency for certain AI systems (Ch. III Sec 4 = EU Database/Authorities timing), GPAI (Ch. V), Governance (Ch. VII), Penalties (Ch. XII), Art. 78: from 2025‑08‑02
- Most obligations (incl. high‑risk requirements and operator duties): from 2026‑08‑02
- Product safety pathway classification Art. 6(1): from 2027‑08‑02

---

## Legend (per PN item)

- ID: PN-<Article><letter/number>
- Actor: provider | deployer | importer | distributor | authorised representative | GPAI provider | provider (systemic‑risk GPAI) | notified body | Member State authority | Commission/AI Office | Union institution/body
- Type: duty | prohibition | permission/right
- Articles: controlling articles (and referenced annexes if core)
- Conditions: primary QPs (e.g., QP-004 high‑risk; QP-002 provider; QP-006 GPAI provider)
- Exceptions: salient EX where the PN is defeated or narrowed
- Effective: yyyy‑mm‑dd (default per Article 113 if not restated)
- Penalty: per Article 99 unless otherwise specified

---

## Title II — Prohibited AI Practices (Article 5)

PN-05A
- Actor: any operator
- Type: prohibition
- Articles: Art. 5(1)(a)
- Rule: Do not place/put into service/use AI that deploys subliminal, purposefully manipulative or deceptive techniques that materially distort behaviour by impairing informed decision-making, causing (or likely to cause) significant harm.
- Conditions: QP-001 is_ai_system
- Exceptions: none
- Effective: 2025-02-02
- Penalty: up to €35M or 7% (Art. 99(3))

PN-05B
- Actor: any operator
- Type: prohibition
- Articles: Art. 5(1)(b)
- Rule: Do not place/put into service/use AI that exploits vulnerabilities of a person or group (age, disability, specific social/economic situation) to materially distort behaviour causing (or likely to cause) significant harm.
- Conditions: QP-001
- Exceptions: none
- Effective: 2025-02-02
- Penalty: €35M/7%

PN-05C
- Actor: any operator
- Type: prohibition
- Articles: Art. 5(1)(c) [as structured across subpoints]; social scoring prohibitions include: (i) detrimental/unfavourable treatment in unrelated social contexts; (ii) detrimental/unfavourable treatment unjustified or disproportionate to behaviour or its gravity.
- Rule: Do not use AI systems for social scoring of natural persons leading to detrimental or unfavourable treatment as described.
- Conditions: QP-001
- Exceptions: none
- Effective: 2025-02-02
- Penalty: €35M/7%

PN-05D
- Actor: any operator
- Type: prohibition
- Articles: Art. 5(1)(d)
- Rule: Do not place/put into service/use AI systems for risk assessments of natural persons to assess/predict risk of committing a criminal offence, when based solely on profiling or on assessing personality traits/characteristics.
- Exceptions: Support to human assessment based on objective, verifiable facts directly linked to a criminal activity is not prohibited.
- Effective: 2025-02-02
- Penalty: €35M/7%

PN-05E
- Actor: any operator
- Type: prohibition
- Articles: Art. 5(1)(e)
- Rule: Do not place/put into service/use AI systems to create or expand facial recognition databases through untargeted scraping of facial images from the internet or CCTV footage.
- Effective: 2025-02-02
- Penalty: €35M/7%

PN-05F
- Actor: any operator
- Type: prohibition
- Articles: Art. 5(1)(f)
- Rule: Do not place/put into service/use AI systems to infer emotions in workplace and education settings, except where intended for medical or safety reasons.
- Effective: 2025-02-02
- Penalty: €35M/7%

PN-05G
- Actor: any operator
- Type: prohibition
- Articles: Art. 5(1)(g)
- Rule: Do not place/put into service/use biometric categorisation systems deducing/infering sensitive attributes (race, political opinions, trade union membership, religious/philosophical beliefs, sex life/sexual orientation).
- Exceptions: Does not cover labelling/filtering of lawfully acquired biometric datasets (e.g., images) or categorising biometric data in law enforcement area.
- Effective: 2025-02-02
- Penalty: €35M/7%

PN-05H
- Actor: law enforcement authorities (special case)
- Type: prohibition with limited permissions
- Articles: Art. 5(1)(h), Art. 5(2)
- Rule: Prohibit ‘real‑time’ remote biometric identification in publicly accessible spaces for law enforcement, except for narrowly defined objectives (search for specific victims/missing persons; prevent specific, substantial and imminent threat incl. terrorist; locate/identify suspect in specified serious crimes) and subject to strict safeguards and authorisations; use only to confirm identity of specifically targeted individual and consider nature/impact factors in Art. 5(2)(a)-(b).
- Effective: 2025-02-02
- Penalty: €35M/7%

---

## Title III — High-Risk AI Systems

### Section 2 — Requirements for High-Risk AI Systems (Articles 9–15)

PN-09
- Actor: provider (high‑risk systems)
- Type: duty
- Articles: Art. 9
- Rule: Establish, implement, document and maintain a risk management system as a continuous, iterative lifecycle process (risk identification/analysis; estimation/evaluation incl. reasonably foreseeable misuse; post‑market feedback; targeted risk controls; acceptable residual risk; testing incl. real‑world when applicable; pre‑defined metrics/probabilistic thresholds; consider vulnerable groups).
- Conditions: QP-004 is_high_risk, QP-002 is_provider
- Effective: 2026-08-02
- Penalty: €15M/3% (Art. 99(4)(a))

PN-10
- Actor: provider (high‑risk systems)
- Type: duty
- Articles: Art. 10; Annex IV (by reference in documentation)
- Rule: Develop high‑risk AI on the basis of training/validation/testing datasets that meet quality criteria; apply appropriate data governance/management practices (design choices; data origin/purpose; preparation operations; assumptions; representativeness/relevance; bias mitigation; data gaps; personal data handling consistent with Union law).
- Conditions: QP-004, QP-002
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-11
- Actor: provider (high‑risk systems)
- Type: duty
- Articles: Art. 11; Annex IV
- Rule: Draw up technical documentation before placing/putting into service; keep up‑to‑date; include minimum Annex IV elements; single set when integrated with Annex I product regimes; SMEs may use Commission simplified form.
- Conditions: QP-004, QP-002
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-12
- Actor: provider (system design) and deployer (logging under Art. 26(6))
- Type: duty
- Articles: Art. 12
- Rule: Ensure high‑risk AI technically allows automatic logging of events over lifetime; logging to enable risk identification, post‑market monitoring, and specific capabilities for Annex III(1)(a) systems (time of use; reference database; matched input; identity of verifiers under Art. 14(5)).
- Conditions: QP-004; provider/deployer role as applicable
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-13
- Actor: provider (design), deployer (use)
- Type: duty
- Articles: Art. 13
- Rule: Design and develop sufficient transparency to enable deployers to interpret outputs/use appropriately; accompany with instructions for use including specified elements (identity, intended purpose, metrics, risks, capabilities to explain, performance for groups, relevant data specs, output interpretation guidance, pre‑determined changes, human oversight measures, resources/lifecycle, logging mechanisms).
- Conditions: QP-004, QP-002 (provider duties)
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-14
- Actor: provider (design) and deployer (implementation)
- Type: duty
- Articles: Art. 14
- Rule: Ensure effective human oversight via design/tools; provider identifies measures built‑in or to be implemented by deployer; natural persons overseeing must be enabled to understand/monitor, avoid automation bias, interpret outputs, decide to not use/override/stop; special 2‑person verification for Annex III(1)(a) unless disproportionate in LE/migration/border/asylum laws.
- Conditions: QP-004; provider/deployer as applicable
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-15
- Actor: provider (high‑risk systems)
- Type: duty
- Articles: Art. 15
- Rule: Design/develop for appropriate accuracy, robustness, cybersecurity; declare accuracy metrics in instructions; ensure resilience (errors, faults, interactions); address feedback loops for systems that continue to learn; ensure cybersecurity incl. measures against data/model poisoning, adversarial examples, confidentiality attacks, model flaws.
- Conditions: QP-004, QP-002
- Effective: 2026-08-02
- Penalty: €15M/3%

### Section 3 — Obligations of Providers, Deployers and Other Parties (Articles 16–27)

PN-16A
- Actor: provider (high‑risk systems)
- Type: duty
- Articles: Art. 16(a)
- Rule: Ensure high‑risk AI complies with Section 2 requirements (Art. 9–15).
- Conditions: QP-004, QP-002
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16B
- Actor: provider
- Type: duty
- Articles: Art. 16(b)
- Rule: Indicate provider identity/contact on system/packaging/documentation.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16C
- Actor: provider
- Type: duty
- Articles: Art. 16(c); Art. 17
- Rule: Put in place a quality management system per Art. 17.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16D
- Actor: provider
- Type: duty
- Articles: Art. 16(d); Art. 11; Art. 18
- Rule: Keep required documentation (technical, QMS, notified body decisions/certificates, EU DoC) available.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16E
- Actor: provider
- Type: duty
- Articles: Art. 16(e); Art. 12; Art. 19
- Rule: Keep automatically generated logs under provider control for at least six months or longer if appropriate/lawful.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16F
- Actor: provider
- Type: duty
- Articles: Art. 16(f); Art. 43–46
- Rule: Ensure relevant conformity assessment before placing on market/putting into service.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16G
- Actor: provider
- Type: duty
- Articles: Art. 16(g); Art. 47
- Rule: Draw up EU declaration of conformity.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16H
- Actor: provider
- Type: duty
- Articles: Art. 16(h); Art. 48
- Rule: Affix CE marking (or on packaging/documentation) incl. notified body ID where applicable.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16I
- Actor: provider
- Type: duty
- Articles: Art. 16(i); Art. 49; Art. 71
- Rule: Comply with EU database registration obligations.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16J
- Actor: provider
- Type: duty
- Articles: Art. 16(j); Art. 20
- Rule: Take corrective actions and provide information as required.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16K
- Actor: provider
- Type: duty
- Articles: Art. 16(k); Art. 21
- Rule: Demonstrate conformity to competent authorities upon reasoned request (incl. logs under control).
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-16L
- Actor: provider
- Type: duty
- Articles: Art. 16(l)
- Rule: Ensure accessibility compliance per Directives (EU) 2016/2102 and 2019/882.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-17
- Actor: provider
- Type: duty
- Articles: Art. 17
- Rule: Put in place a documented QMS covering strategy for compliance, design/development QA, validation, standards/specs, data management, risk management (Art. 9), post‑market monitoring (Art. 72), serious incident reporting (Art. 73), authority communications, record‑keeping, resource management (incl. security of supply), accountability framework; proportional to size; sectoral equivalence for financial institutions.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-18
- Actor: provider
- Type: duty
- Articles: Art. 18
- Rule: Keep documentation at disposal of national authorities for 10 years after placing/putting into service; Member State retention safeguards for bankruptcy/cessation.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-19
- Actor: provider
- Type: duty
- Articles: Art. 19
- Rule: Keep automatically generated logs under control for ≥ 6 months or longer as appropriate; sectoral alignment for financial services providers.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-20A
- Actor: provider
- Type: duty
- Articles: Art. 20(1)
- Rule: If non‑conformity suspected/established: immediately take corrective action (bring into conformity, withdraw, disable or recall), and inform distributors and, where applicable, deployers, authorised representative and importers.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-20B
- Actor: provider
- Type: duty
- Articles: Art. 20(2)
- Rule: If system presents a risk within Art. 79(1): investigate with reporting deployer where applicable and inform competent market surveillance authorities and, where relevant, the notified body of non‑compliance and corrective actions.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-21A
- Actor: provider
- Type: duty
- Articles: Art. 21(1)
- Rule: Provide competent authorities, upon reasoned request, with all information and documentation to demonstrate conformity (in a requested Union language).
- Effective: 2026-08-02
- Penalty: €7.5M/1% if misleading information (Art. 99(5)); otherwise €15M/3%

PN-21B
- Actor: provider
- Type: duty
- Articles: Art. 21(2)–(3)
- Rule: Provide access to logs under control upon reasoned request; confidentiality obligations apply.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-22A
- Actor: authorised representative (for third‑country providers)
- Type: duty
- Articles: Art. 22(1)–(3)
- Rule: Be appointed by written mandate; perform tasks: verify EU DoC and tech documentation; keep contact details/documents for 10 years; provide info/logs upon request; cooperate with authorities; comply with/ensure registration obligations.
- Effective: 2026-08-02 (parts tied to Art. 49 apply when registration in force)
- Penalty: €15M/3% (Art. 99(4)(b))

PN-22B
- Actor: authorised representative
- Type: duty
- Articles: Art. 22(4)
- Rule: Terminate mandate if provider acts contrary to obligations; immediately inform market surveillance authority and, where applicable, relevant notified body.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-23 (Importers)
- Actor: importer
- Type: duty
- Articles: Art. 23(1)–(7)
- Rule: Before placing on market, verify conformity assessment carried out; verify technical documentation; CE marking; EU DoC; authorised representative appointed. If non‑conformity/falsified: do not place on market; inform parties and authorities if risk. Indicate importer identity on system/packaging/docs. Ensure storage/transport conditions preserve compliance. Keep docs for 10 years. Provide info/docs to authorities upon request; cooperate with authorities.
- Effective: 2026-08-02
- Penalty: €15M/3% (Art. 99(4)(c))

PN-24 (Distributors)
- Actor: distributor
- Type: duty
- Articles: Art. 24(1)–(6)
- Rule: Before making available, verify CE marking, EU DoC, instructions; check provider/importer identity obligations. If non‑conformity suspected: do not make available; inform provider/importer if risk. Ensure storage/transport conditions preserve compliance. If own system non‑conform: take corrective actions/ensure operators do so; inform provider/importer/authorities if risk. Provide info/docs to authorities; cooperate.
- Effective: 2026-08-02
- Penalty: €15M/3% (Art. 99(4)(d))

PN-25A
- Actor: distributors/importers/deployers/third parties
- Type: duty
- Articles: Art. 25(1)
- Rule: Become “provider” (with provider obligations) when: (a) rebrand with own name/mark; (b) make a substantial modification to a high‑risk AI; (c) modify intended purpose of a non‑high‑risk AI so it becomes high‑risk under Art. 6.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-25B
- Actor: initial provider (whose system is modified as per PN‑25A)
- Type: duty
- Articles: Art. 25(2)
- Rule: Cooperate with new provider; make necessary information and reasonably expected technical access/assistance available for obligations (esp. conformity assessment), except where initial provider clearly specified its AI is not to be changed into a high‑risk AI.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-25C
- Actor: product manufacturer
- Type: duty
- Articles: Art. 25(3)
- Rule: Be considered the provider (with provider obligations) when the high‑risk AI is a safety component placed with the product under the manufacturer’s name/mark, or designed/intended for exclusive use with the product.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-26A
- Actor: deployer (high‑risk)
- Type: duty
- Articles: Art. 26(1)
- Rule: Take appropriate technical/organizational measures to use the system in accordance with instructions for use.
- Effective: 2026-08-02
- Penalty: €15M/3% (Art. 99(4)(e))

PN-26B
- Actor: deployer
- Type: duty
- Articles: Art. 26(2)–(3)
- Rule: Assign human oversight to competent/trained/authorized natural persons; freedom to organise resources remains.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-26C
- Actor: deployer (controlling inputs)
- Type: duty
- Articles: Art. 26(4)
- Rule: Ensure input data under deployer’s control is relevant and sufficiently representative for intended purpose.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-26D
- Actor: deployer
- Type: duty
- Articles: Art. 26(5)
- Rule: Monitor operation per instructions; inform providers per Art. 72 when relevant; if use per instructions may present Art. 79(1) risk, inform provider/distributor and market surveillance authority and suspend use; if serious incident, inform provider first, then importer/distributor and authorities; if provider unreachable, Art. 73 applies mutatis mutandis. Excludes sensitive operational data of law‑enforcement deployers.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-26E
- Actor: deployer
- Type: duty
- Articles: Art. 26(6)
- Rule: Keep logs under deployer control for ≥ 6 months or longer if appropriate/lawful; financial institutions may align with sector rules.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-26F
- Actor: deployer (employer)
- Type: duty
- Articles: Art. 26(7)
- Rule: Before putting into service/using high‑risk AI at workplace, inform workers’ representatives and affected workers in line with applicable information rules/practice.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-26G
- Actor: deployer (public authority/Union body)
- Type: duty
- Articles: Art. 26(8); Art. 49; Art. 71
- Rule: Register in EU database; if system not registered by provider, do not use and inform provider/distributor.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-26H
- Actor: deployer
- Type: duty
- Articles: Art. 26(9)
- Rule: Use provider information (Art. 13) to comply with DPIA obligations under GDPR/LED.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-26I (Post‑remote biometric identification for law enforcement)
- Actor: deployer (LE)
- Type: duty/limitation
- Articles: Art. 26(10)
- Rule: Obtain prior or immediate ex‑post (≤48h) authorisation by judicial/administrative authority for targeted search of suspected/convicted person, except initial identification based on objective, verifiable facts; stop and delete data if authorisation rejected; prohibit untargeted use; prohibit adverse legal decisions based solely on outputs; document uses; submit annual reports; Member States may set stricter laws; without prejudice to GDPR/LED data rules.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-26J
- Actor: deployer
- Type: duty
- Articles: Art. 26(11)
- Rule: Inform natural persons subject to use of high‑risk AI in Annex III decisions/assistance, without prejudice to LED for law enforcement.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-26K
- Actor: deployer
- Type: duty
- Articles: Art. 26(12)
- Rule: Cooperate with competent authorities.
- Effective: 2026-08-02
- Penalty: €15M/3%

PN-27 (FRIA)
- Actor: deployer (public bodies/private providing public services; and deployers under Annex III points 5(b) and 5(c))
- Type: duty
- Articles: Art. 27(1)–(5)
- Rule: Perform Fundamental Rights Impact Assessment before deploying specified high‑risk AI; include process description, use period/frequency, affected categories, specific risks, human oversight implementation, mitigation and governance/complaint mechanisms; notify market surveillance authority (with template); complement GDPR/LED DPIA as applicable; update if elements change; AI Office to provide template/tool.
- Effective: 2026-08-02
- Penalty: €15M/3%

### Section 4 — Notifying Authorities and Notified Bodies (Articles 28–31, 33–35)

Note: These obligations primarily address Member States and conformity assessment bodies; included for completeness.

PN-28
- Actor: Member State (notifying authority)
- Type: duty
- Articles: Art. 28
- Rule: Designate/establish notifying authorities; organise to avoid conflicts of interest, ensure objectivity; confidentiality; adequate competent personnel; may use national accreditation bodies.
- Effective: 2025-08-02

PN-29/30
- Actor: conformity assessment body / notifying authority
- Type: duty
- Articles: Art. 29–30
- Rule: Bodies apply for notification (with accreditation or documentary evidence); notifying authorities notify Commission/Member States; manage objections; provide documentation.
- Effective: 2025-08-02

PN-31/33/34/35
- Actor: notified body
- Type: duty
- Articles: Art. 31, 33(1),(3),(4), 34
- Rule: Meet requirements (legal personality, impartiality, competence, liability, confidentiality); perform tasks per annexed modules; inform authorities/peers about certificates/actions; cooperate; maintain procedures; subject to penalties under Art. 99(4)(f) for non‑compliance.
- Effective: 2025-08-02
- Penalty: €15M/3%

### Conformity Assessment, EU DoC, CE Marking, Registration (Articles 43–49)

PN-43
- Actor: provider
- Type: duty
- Articles: Art. 43
- Rule: Follow applicable conformity assessment route (Annex VI/VII or sectoral Annex I regimes), including re‑assessment upon substantial modification; special rules for LE/migration/asylum/Union bodies.
- Effective: 2026-08-02

PN-44/45
- Actor: notified body
- Type: duty
- Articles: Art. 44–45
- Rule: Issue/manage certificates; suspend/withdraw/restrict when non‑compliance; inform authorities/other notified bodies; maintain confidentiality and information exchange duties.
- Effective: 2025-08-02

PN-46 (Derogation)
- Actor: market surveillance authority; LE/civil protection authorities (urgent use)
- Type: permission with conditions
- Articles: Art. 46
- Rule: May authorise temporary placing/putting into service for exceptional public security/health/environment/critical assets reasons; urgent use by LE/civil protection allowed with immediate or subsequent authorisation; must cease and discard results if refused; inform Commission/Member States.
- Effective: 2026-08-02

PN-47
- Actor: provider
- Type: duty
- Articles: Art. 47
- Rule: Draw up EU declaration of conformity and keep it available.
- Effective: 2026-08-02

PN-48
- Actor: provider
- Type: duty
- Articles: Art. 48
- Rule: Affix CE marking (including digital where applicable) and notified body ID where applicable; ensure visibility/legibility/indelibility.
- Effective: 2026-08-02

PN-49A (Provider Registration)
- Actor: provider / authorised representative
- Type: duty
- Articles: Art. 49(1)–(2); Art. 71; Annex VIII/IX
- Rule: Register high‑risk AI listed in Annex III (except Annex III point 2) before placing/putting into service; providers claiming Art. 6(3) opt‑out must register the system and claim; secure sections for Annex III points 1,6,7; Annex III point 2 systems register at national level.
- Effective: 2026-08-02

PN-49B (Deployer Registration)
- Actor: deployer (public authority/Union body)
- Type: duty
- Articles: Art. 49(3)–(5); Art. 71
- Rule: Register use prior to putting into service; use secure non‑public section for Annex III points 1,6,7; national registration for Annex III point 2; do not use if not registered.
- Effective: 2026-08-02

---

## Title IV — Transparency Obligations for Certain AI Systems (Article 50)

PN-50A (AI Interaction Disclosure)
- Actor: provider
- Type: duty
- Articles: Art. 50(1)
- Rule: Design/develop AI systems that interact with natural persons so that persons are informed they are interacting with AI, unless obvious to a reasonably well‑informed, observant and circumspect person, considering context; not applicable to certain authorised LE systems unless publicly available for reporting.
- Effective: 2025-08-02
- Penalty: €15M/3% (Art. 99(4)(g))

PN-50B (Synthetic Content Marking – Providers)
- Actor: provider (including GPAI)
- Type: duty
- Articles: Art. 50(2)
- Rule: Ensure outputs generating synthetic audio/image/video/text are machine‑readably marked and detectable as artificially generated/manipulated; solutions must be effective, interoperable, robust, reliable as technically feasible; exceptions for assistive standard editing/no substantial alteration or certain authorised LE uses.
- Effective: 2025-08-02
- Penalty: €15M/3%

PN-50C (Emotion/Biometric Categorisation Disclosure – Deployers)
- Actor: deployer
- Type: duty
- Articles: Art. 50(3)
- Rule: Inform natural persons exposed to emotion recognition or biometric categorisation systems; process personal data per GDPR/Reg. 2018/1725/LED; exception for authorised criminal offence contexts with safeguards and Union law compliance.
- Effective: 2025-08-02
- Penalty: €15M/3%

PN-50D (Deepfakes – Image/Audio/Video Disclosure)
- Actor: deployer
- Type: duty
- Articles: Art. 50(4) first subparagraph
- Rule: Disclose that image/audio/video content has been artificially generated/manipulated; exceptions: authorised LE use; for artistic/creative/satirical/fictional works, limited to appropriate disclosure without hampering enjoyment.
- Effective: 2025-08-02
- Penalty: €15M/3%

PN-50E (Deepfakes – Text Disclosure for Public Interest Publications)
- Actor: deployer
- Type: duty
- Articles: Art. 50(4) second subparagraph
- Rule: Disclose that AI‑generated/manipulated text is used to inform the public on matters of public interest; exceptions: authorised LE use; or where AI‑generated content underwent human review/editorial control and an editor holds responsibility.
- Effective: 2025-08-02
- Penalty: €15M/3%

PN-50F (Timing/Accessibility of Disclosures)
- Actor: provider/deployer (as applicable)
- Type: duty
- Articles: Art. 50(5)–(7)
- Rule: Provide information at latest at first interaction/exposure; conform to accessibility requirements; without prejudice to other Ch. III duties; Commission/AI Office may approve codes of practice or common rules.
- Effective: 2025-08-02

---

## Title V — General-Purpose AI Models (Articles 53–56)

PN-53A (Technical Documentation)
- Actor: GPAI provider
- Type: duty
- Articles: Art. 53(1)(a); Annex XI
- Rule: Draw up and keep up‑to‑date technical documentation covering model training/testing and evaluation results; provide upon request to AI Office/national authorities.
- Effective: 2025-08-02
- Penalty: governance under Art. 101 for Commission fines; and national penalties under Art. 99 where applicable

PN-53B (Information to Downstream Providers)
- Actor: GPAI provider
- Type: duty
- Articles: Art. 53(1)(b); Annex XII
- Rule: Make available information to enable downstream AI system providers to understand capabilities/limitations and comply with obligations; include minimum Annex XII elements.
- Effective: 2025-08-02

PN-53C (Copyright Compliance Policy)
- Actor: GPAI provider
- Type: duty
- Articles: Art. 53(1)(c)
- Rule: Put in place a policy to comply with Union copyright/related rights, including identification and compliance with reservations under DSM Directive Art. 4(3) (opt‑outs), using state‑of‑the‑art technologies.
- Effective: 2025-08-02

PN-53D (Training Data Summary)
- Actor: GPAI provider
- Type: duty
- Articles: Art. 53(1)(d)
- Rule: Draw up and publicly provide a sufficiently detailed summary about content used for training, using AI Office template.
- Effective: 2025-08-02

PN-53E (Open‑Source Exception)
- Actor: GPAI provider (open‑source)
- Type: permission/exception
- Articles: Art. 53(2)
- Rule: Exemption from Art. 53(1)(a),(b) when model released under free/open‑source licence and parameters/architecture/usage info are publicly available; not applicable to systemic‑risk models.
- Effective: 2025-08-02

PN-53F (Cooperation)
- Actor: GPAI provider
- Type: duty
- Articles: Art. 53(3)
- Rule: Cooperate with Commission/national authorities as necessary to exercise powers under Regulation.
- Effective: 2025-08-02

PN-54 (Authorised Representative for GPAI)
- Actor: authorised representative (GPAI)
- Type: duty
- Articles: Art. 54
- Rule: Appoint EU authorised representative for third‑country GPAI providers; perform verification/document retention; provide information; cooperate; terminate mandate if provider non‑compliant; exception for open‑source unless systemic‑risk.
- Effective: 2025-08-02

PN-55A (Systemic‑Risk GPAI – Evaluation & Adversarial Testing)
- Actor: GPAI provider (systemic risk)
- Type: duty
- Articles: Art. 55(1)(a)
- Rule: Perform model evaluation per state‑of‑the‑art protocols/tools; conduct/document adversarial testing to identify/mitigate systemic risks.
- Effective: 2025-08-02
- Penalty: Commission fines up to 3%/€15M (Art. 101)

PN-55B (Systemic‑Risk Assessment & Mitigation)
- Actor: GPAI provider (systemic risk)
- Type: duty
- Articles: Art. 55(1)(b)
- Rule: Continuously assess and mitigate systemic risks at Union level across lifecycle.
- Effective: 2025-08-02

PN-55C (Serious Incident Reporting to AI Office)
- Actor: GPAI provider (systemic risk)
- Type: duty
- Articles: Art. 55(1)(c)
- Rule: Track, document, and report without undue delay to AI Office (and as appropriate to national authorities) information about serious incidents and corrective measures.
- Effective: 2025-08-02

PN-55D (Cybersecurity Protection)
- Actor: GPAI provider (systemic risk)
- Type: duty
- Articles: Art. 55(1)(d)
- Rule: Ensure adequate cybersecurity for model and physical infrastructure.
- Effective: 2025-08-02

PN-56 (Codes of Practice)
- Actor: GPAI providers (all), AI Office, Board
- Type: duty/permission
- Articles: Art. 56
- Rule: Participate in development/adherence to codes of practice covering Art. 53/55 obligations; AI Office may invite providers; Commission may adopt common rules if code not finalised/adequate.
- Effective: 2025-08-02 (codes ready by 2025-05-02 target)

---

## Title VI — Measures in Support of Innovation (Articles 57–63)

PN-57–59 (Member States/EU bodies obligations on sandboxes)
- Actor: Member States; EDPS (for Union bodies)
- Type: duty
- Articles: Art. 57–59
- Rule: Establish at least one national AI regulatory sandbox by 2026‑08‑02; provide guidance/support; allocate resources; allow real‑world testing under supervision; issue exit reports; ensure cooperation.
- Effective: 2026-08-02 (set‑up by date)

PN-60 (Real‑World Testing Conditions – Providers/Prospective Providers)
- Actor: provider/prospective provider; deployer/prospective deployer (when partnering)
- Type: duty/conditioned permission
- Articles: Art. 60; Annex IX; Art. 71(4)
- Rule: May conduct real‑world testing of Annex III high‑risk AI before placing/putting into service if: (a) submit testing plan to national market surveillance authority; (b) obtain approval (tacit possible per national law); (c) register testing with EU database (secure/non‑public as applicable) with unique ID; (d) be established in EU or have EU legal representative; (e) comply with data transfer safeguards; (f) limit duration ≤ 6 months (extendable by 6 with notification); (g) protect vulnerable groups; (h) when partnering with deployers, inform them and conclude roles/responsibilities agreement; (i) obtain informed consent (Art. 61) and implement additional safeguards.
- Effective: 2026-08-02

PN-61 (Informed Consent for Real‑World Testing)
- Actor: provider/prospective provider (and deployers if applicable)
- Type: duty
- Articles: Art. 61
- Rule: Obtain freely‑given informed consent from testing subjects prior to participation; provide concise, clear information (nature/objectives; conditions/duration; rights incl. refusal/withdrawal; reversal/disregard arrangements; unique test ID and contact); document and give copy to subjects.
- Effective: 2026-08-02

PN-62–63 (Support to SMEs/Microenterprises)
- Actor: Member States; AI Office; microenterprises
- Type: duty/permission
- Articles: Art. 62–63
- Rule: Priority access to sandboxes; awareness/training; communication channels; participation in standardisation; reduced conformity assessment fees proportionate to size; templates/platforms provided by AI Office; microenterprises may comply with QMS elements in simplified manner (guidelines) without lowering protection.
- Effective: 2025-08-02 (Art. 62); 2026-08-02 (Art. 63)

---

## Title VII — Governance (Articles 64–71)

PN-64–68 (AI Office & Scientific Panel)
- Actor: Commission/AI Office; Scientific Panel experts
- Type: duty
- Articles: Art. 64–68
- Rule: Establish AI Office; tasks to develop expertise; set up scientific panel; impartiality/confidentiality; alerts on systemic risks; develop tools/benchmarks; support market surveillance.
- Effective: 2025-08-02

PN-69–71 (National Authorities & EU Database)
- Actor: Member States; Commission; providers/deployers (data entry obligations referenced in PN‑49)
- Type: duty
- Articles: Art. 69–71
- Rule: Access pool of experts; designate competent authorities and single points of contact; resource adequacy; confidentiality/cybersecurity; reporting; set up and maintain EU database; ensure accessibility and appropriate public/secure sections.
- Effective: 2025-08-02

---

## Title IX — Post‑Market Monitoring, Information Sharing and Market Surveillance (Articles 72–76)

PN-72 (Post‑Market Monitoring Plan)
- Actor: provider (high‑risk)
- Type: duty
- Articles: Art. 72(1)–(4); Annex IV
- Rule: Establish documented post‑market monitoring system and plan; actively/systematically collect and analyse performance data; evaluate continued compliance; include interactions with other AI systems; exclude sensitive law‑enforcement operational data; integrate with sectoral regimes where applicable; Commission template by 2026‑02‑02.
- Effective: 2026-08-02

PN-73 (Serious Incident Reporting)
- Actor: provider (and deployer when applicable)
- Type: duty
- Articles: Art. 73(1)–(11)
- Rule: Report serious incidents to market surveillance authorities: immediately after causal link established/likely, not later than 15 days; 2 days for widespread incidents/Art. 3(49)(b); immediate ≤ 10 days if death; initial incomplete report allowed; investigate, assess risk, take corrective action; cooperate with authorities; specific routing/limitations for devices (MDR/IVDR) and other regimes; authority measures within 7 days; Commission guidance by 2025‑08‑02.
- Effective: 2026-08-02

PN-74–76 (Market Surveillance & Union Procedures)
- Actor: market surveillance authorities; Member States; Commission
- Type: duty
- Articles: Art. 74–76
- Rule: Apply Reg. 2019/1020; report annually; designate authorities; exercise powers incl. remote; special rules for financial services; safeguard/Union procedures for non‑compliant systems.
- Effective: 2025-08-02

---

## Title X–XII — Standardisation, Delegated/Implementing Acts, Penalties

PN-40–41 (Standards/Common Specifications)
- Actor: Commission; providers (indirect via presumption of conformity)
- Type: duty/permission
- Articles: Art. 40–41
- Rule: Use of harmonised standards yields presumption; Commission may issue common specifications; providers must follow specs or justify.
- Effective: 2026-08-02

PN-97–98 (Delegated/Implementing Acts)
- Actor: Commission
- Type: duty/permission
- Articles: Art. 97–98
- Rule: Adopt delegated/implementing acts as specified (e.g., amend annexes, templates, codes of practice).
- Effective: 2025-08-02

PN-99 (Penalties Framework)
- Actor: Member States
- Type: duty
- Articles: Art. 99
- Rule: Lay down penalties; notify Commission by application date; upper limits: prohibitions €35M/7%; other operator/notified body obligations €15M/3%; misleading info €7.5M/1%; SMEs capped at lower of percent/amount; consider listed factors; rules for public bodies.
- Effective: 2025-08-02

PN-100–101 (Union Institutions/GPAI Commission Fines)
- Actor: EDPS; Commission
- Type: duty/permission
- Articles: Art. 100–101
- Rule: EDPS may fine Union institutions/bodies; Commission may fine GPAI providers up to 3%/€15M for specified infringements; procedural safeguards.
- Effective: 2025-08-02

---

## Title IV bis — Additional Transparency and Information (Cross‑References)

AG-Transparency
- Collects PN‑50A…50F for navigation.

AG-Provider Core Obligations
- Collects PN‑16A…16L, PN‑17…PN‑21 for providers.

AG-High‑Risk Technical Requirements
- Collects PN‑09…PN‑15.

AG-Deployers
- Collects PN‑26A…26K and PN‑27.

AG-GPAI
- Collects PN‑53A…53F and PN‑55A…55D.

---

## Footnotes & Clarifications

- Classifications (QP)
  - QP‑001: is_ai_system (scope)
  - QP‑002: is_provider; QP‑003: is_deployer; QP‑004: is_high_risk (product safety pathway and Annex III pathway with Art. 6(3) opt‑out); QP‑006: is_GPAI_provider; QP‑010: systemic‑risk model.
- Exceptions (EX) examples
  - EX‑LE‑BI: authorised law enforcement carve‑outs in Art. 5(1)(h), Art. 26(10), Art. 50(1),(3),(4).
  - EX‑A6‑3: Article 6(3) opt‑out claims (registration PN‑49A applies).
- Temporal
  - Default effective dates attached per Chapter as above; per‑item deviations are indicated where known.
- Penalties
  - Article 99 provides upper limits; Member State rules apply case‑by‑case. Article 101 governs Commission fines for GPAI providers.

---

## Coverage Statement

This catalogue enumerates all outward‑facing prescriptive norms identifiable in Articles 5, 9–15, 16–27, 28–31/33–35, 40–49, 50, 53–56, 57–63, 64–71, 72–76, 97–101, 113, with brief paraphrases anchored to their articles. Classification predicates (e.g., high‑risk qualification under Article 6, systemic‑risk designation under Article 51–52) are intentionally not catalogued as prescriptive norms but referenced as QPs in “Conditions”.

If you want, we can convert this catalogue into PN/QP/EX JSON with IDs, add effective dates programmatically per Article 113, and wire a validator + selector.

