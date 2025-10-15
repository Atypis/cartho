# Detailed Wirknormen Extraction - EU AI Act

## Article 4 - AI Literacy (Lines 617-621)

**Wirknorm ID**: W-001
**Article**: Article 4
**Type**: General Obligation
**Actors**: Providers AND Deployers
**Consequence**: Must ensure AI literacy of staff
**Requirements**:
1. Is a provider OR deployer of AI system
2. Has staff/persons dealing with operation/use
**Specific Conditions**:
- "To their best extent"
- Consider: technical knowledge, experience, education, training, context, affected persons/groups
**Notes**: Broad, general obligation - applies to both providers and deployers equally

---

## Article 5 - Prohibited AI Practices (Lines 627-678)

### Article 5(1)(a) - Subliminal Manipulation

**Wirknorm ID**: W-002a
**Article**: Article 5(1)(a)
**Type**: Prohibition
**Consequence**: Cannot place on market, put into service, or use
**Requirements**:
1. Is an AI system
2. Deploys subliminal techniques beyond consciousness OR manipulative/deceptive techniques
3. Objective OR effect: materially distort behaviour
4. By appreciably impairing informed decision-making
5. Causes person to take decision they wouldn't otherwise take
6. Causes or likely to cause significant harm

**Grouping**: Check if other 5(1) prohibitions share exact same structure

---

### Article 5(1)(b) - Exploitation of Vulnerabilities

**Wirknorm ID**: W-002b
**Article**: Article 5(1)(b)
**Type**: Prohibition
**Consequence**: Cannot place on market, put into service, or use
**Requirements**:
1. Is an AI system
2. Exploits vulnerabilities due to age, disability, or social/economic situation
3. Objective OR effect: materially distort behaviour
4. Causes or likely to cause significant harm

**Comparison with W-002a**: Different specific condition (exploitation vs subliminal), but same general structure. Need to check if these should be grouped or separate.

---

### Article 5(1)(c) - Social Scoring

**Wirknorm ID**: W-002c
**Article**: Article 5(1)(c)
**Type**: Prohibition
**Consequence**: Cannot place on market, put into service, or use
**Requirements**:
1. Is an AI system
2. Used by public authorities OR on their behalf
3. For evaluation/classification of trustworthiness of persons
4. Based on: social behaviour, personal/personality characteristics
5. Over certain period of time
6. Leads to EITHER:
   - (i) Detrimental treatment in unrelated social contexts, OR
   - (ii) Detrimental treatment unjustified/disproportionate to behaviour

**Notes**: More complex structure with OR conditions at the end. Definitely separate from W-002a/b.

---

### Article 5(1)(d) - Predictive Crime Risk Assessment

**Wirknorm ID**: W-002d
**Article**: Article 5(1)(d)
**Type**: Prohibition
**Consequence**: Cannot place on market, put into service, or use FOR THIS SPECIFIC PURPOSE
**Requirements**:
1. Is an AI system
2. Used for risk assessment of criminal offence
3. Based SOLELY on profiling OR personality traits assessment
4. **Exception**: Does not apply to systems supporting human assessment based on objective, verifiable facts

**Notes**: "For this specific purpose" qualifier important. Has built-in exception. Separate group.

---

### Article 5(1)(e) - Untargeted Facial Recognition Scraping

**Wirknorm ID**: W-002e
**Article**: Article 5(1)(e)
**Type**: Prohibition
**Consequence**: Cannot place on market, put into service FOR THIS PURPOSE, or use
**Requirements**:
1. Is an AI system
2. Creates OR expands facial recognition databases
3. Through untargeted scraping from internet OR CCTV

**Notes**: Narrow, specific prohibition. Separate group.

---

### Article 5(1)(f) - Emotion Inference (Workplace/Education)

**Wirknorm ID**: W-002f
**Article**: Article 5(1)(f)
**Type**: Prohibition
**Consequence**: Cannot place on market, put into service FOR THIS PURPOSE, or use
**Requirements**:
1. Is an AI system
2. Infers emotions of natural persons
3. In workplace OR education institutions
4. **Exception**: Medical or safety reasons

**Notes**: Area-specific prohibition with exception. Separate group.

---

### Article 5(1)(g) - Biometric Categorisation (Sensitive Attributes)

**Wirknorm ID**: W-002g
**Article**: Article 5(1)(g)
**Type**: Prohibition
**Consequence**: Cannot place on market, put into service FOR THIS PURPOSE, or use
**Requirements**:
1. Is a biometric categorisation system
2. Categorises natural persons individually
3. Based on biometric data
4. To deduce/infer: race, political opinions, trade union membership, religious/philosophical beliefs, sex life, sexual orientation
5. **Exception**: Does not cover lawful datasets labelling/filtering, OR categorizing in law enforcement

**Notes**: Very specific prohibition with exceptions. Separate group.

---

### Article 5(1)(h) - Real-Time Remote Biometric ID (Law Enforcement)

**Wirknorm ID**: W-002h
**Article**: Article 5(1)(h) + 5(2) + 5(3)
**Type**: RESTRICTED PERMISSION (not absolute prohibition!)
**Consequence**: Can be used ONLY under strict conditions
**Requirements**: [COMPLEX - needs detailed analysis]

**This is NOT a simple prohibition - it's a heavily restricted permission with 3 permitted use cases:**

#### Use Case 1: Victim Search (5(1)(h)(i))
**Wirknorm ID**: W-002h-i
- Requirements: All general biometric ID requirements + targeted search for victims of abduction/trafficking/sexual exploitation OR missing persons

#### Use Case 2: Imminent Threat to Life (5(1)(h)(ii))
**Wirknorm ID**: W-002h-ii
- Requirements: All general + prevention of specific, substantial, imminent threat to life/safety OR terrorist attack

#### Use Case 3: Criminal Offence Localisation (5(1)(h)(iii))
**Wirknorm ID**: W-002h-iii
- Requirements: All general + localisation/identification of suspect for offences in Annex II + punishable by 4+ years custody

**Shared Requirements for ALL 5(1)(h) use cases**:
1. Is real-time remote biometric identification system
2. In publicly accessible spaces
3. For law enforcement purposes
4. Prior authorisation (judicial/administrative authority) - Article 5(3)
5. Completed FRIA - Article 5(2)
6. Registered in EU database - Article 5(2)
7. Member State has enacted enabling law - Article 5(5)
8. Proportionality assessment - Article 5(2)
9. Identity confirmation only (not broad search) - Article 5(2)
10. Notification to market surveillance + DPA - Article 5(4)

**Notes**: This is the most complex provision. Three use cases share exact same procedural requirements but differ in substantive triggers. Should these be grouped together or separate?

---

## Grouping Analysis So Far

### Potential Group 1: "Simple Prohibitions"
- **Candidates**: 5(1)(a), 5(1)(b)?
- **Shared Requirements**: AI system + harmful effect structure
- **Differences**: Specific mechanism (subliminal vs exploitation)
- **Decision**: Need to determine if mechanism difference prevents grouping

### Separate Groups (Confirmed):
- W-002c (Social scoring - unique structure with public authority requirement)
- W-002d (Predictive crime - has exception clause)
- W-002e (Facial scraping - very specific)
- W-002f (Emotion inference - area-specific with exception)
- W-002g (Biometric categorisation - sensitive attributes with exceptions)
- W-002h group (Real-time biometric ID - permission not prohibition)

---

## Next Steps

**Continue from**: Line 679 (Article 6 onwards)
**Next Article**: Article 6 - High-Risk Classification

**Key Questions to Resolve**:
1. Should 5(1)(a) and 5(1)(b) be grouped despite different mechanisms?
2. Should the three 5(1)(h) use cases be grouped (same requirements, different triggers)?


## Article 6 - High-Risk Classification (Lines 687-721)

### Article 6(1) - Safety Component/Product Pathway

**Wirknorm ID**: W-003a
**Article**: Article 6(1)
**Type**: Classification
**Consequence**: AI system is classified as high-risk
**Requirements**:
1. Is an AI system
2. (a) Intended as safety component of product OR is itself a product
3. Product covered by Union harmonisation legislation in Annex I
4. (b) Product required to undergo third-party conformity assessment

**Notes**: Two cumulative conditions (a) AND (b). This is a high-risk classification pathway.

---

### Article 6(2) - Annex III Pathway

**Wirknorm ID**: W-003b
**Article**: Article 6(2)
**Type**: Classification
**Consequence**: AI system is classified as high-risk
**Requirements**:
1. Is an AI system
2. Referred to in Annex III (27 use cases across 8 areas)

**Notes**: Separate pathway from 6(1). Subject to opt-out under 6(3).

---

### Article 6(3) - Opt-Out from High-Risk (Annex III only)

**Wirknorm ID**: W-003c
**Article**: Article 6(3)
**Type**: Derogation/Exception
**Consequence**: AI system in Annex III is NOT classified as high-risk
**Requirements**:
1. AI system referred to in Annex III
2. Does not pose significant risk to health/safety/fundamental rights
3. Does not materially influence outcome of decision-making
4. Meets ANY of: (a) narrow procedural task, OR (b) improve prior human activity, OR (c) detect patterns without replacing human assessment, OR (d) preparatory task
5. **Exception to opt-out**: Does NOT perform profiling (if it does, always high-risk)

**Notes**: Complex opt-out with 4 alternative conditions but profiling override. Provider must document assessment (6(4)).

---

### Article 6(4) - Documentation Obligation for Opt-Out

**Wirknorm ID**: W-004
**Article**: Article 6(4)
**Type**: Documentation Obligation
**Consequence**: Must document assessment + register
**Requirements**:
1. Provider considers Annex III system is not high-risk
2. Before placing on market or putting into service
3. Must document assessment
4. Must register (Article 49(2))
5. Must provide documentation upon request

**Notes**: Separate obligation from classification - triggers even if opt-out successful.

---

## Article 7 - Amendments to Annex III (Lines 723-763)

**No Wirknormen** - This is Commission powers, not operator obligations.

---

## Article 8 - Compliance Requirement (Lines 769-775)

### Article 8(1) - General Compliance

**Wirknorm ID**: W-005
**Article**: Article 8(1)
**Type**: General Obligation
**Consequence**: Must comply with Section 2 requirements
**Requirements**:
1. Is a high-risk AI system
2. Must comply with Articles 9-15 requirements
3. Taking into account intended purpose + state of the art

**Notes**: Umbrella obligation - specific requirements in Articles 9-15.

---

### Article 8(2) - Product Integration

**Wirknorm ID**: W-006
**Article**: Article 8(2)
**Type**: Provider Obligation
**Consequence**: Must ensure full compliance with all applicable law
**Requirements**:
1. Is a provider
2. Product contains AI system
3. Subject to this Regulation + Union harmonisation legislation (Annex I)
4. Must ensure full compliance with both
5. Can integrate documentation/procedures

**Notes**: Specific to products under multiple regimes (AI Act + sectoral law).

---

## Article 9 - Risk Management System (Lines 777-817)

**Wirknorm ID**: W-007
**Article**: Article 9(1)-(10)
**Type**: Technical Requirement for High-Risk Systems
**Consequence**: Must establish, implement, document, maintain risk management system
**Requirements**:
1. Is a high-risk AI system
2. Must establish risk management system with:
   - (a) Identify/analyze known and foreseeable risks
   - (b) Estimate/evaluate risks including misuse
   - (c) Evaluate risks from post-market monitoring
   - (d) Adopt appropriate risk management measures
3. Continuous iterative process throughout lifecycle
4. Testing required (paragraph 6-8)
5. Consider impact on children + vulnerable groups (paragraph 9)

**Notes**: Detailed technical obligation. Providers of high-risk systems must comply.

---

## Article 10 - Data Governance (Lines 819-861)

**Wirknorm ID**: W-008
**Article**: Article 10(1)-(6)
**Type**: Technical Requirement for High-Risk Systems
**Consequence**: Must ensure data quality + governance
**Requirements**:
1. Is a high-risk AI system using training/AI models
2. Training/validation/testing data must meet quality criteria:
   - Data governance practices (paragraph 2: design, collection, preparation, assumptions, availability, bias assessment, bias mitigation, gap identification)
   - Relevant, representative, error-free, complete (paragraph 3)
   - Appropriate statistical properties (paragraph 3)
   - Consider geographical/contextual/behavioral/functional setting (paragraph 4)
3. **Special provision**: May exceptionally process special categories of personal data for bias detection/correction (paragraph 5) under strict conditions

**Notes**: Detailed data requirements. Providers of high-risk systems must comply.

---

## Article 11 - Technical Documentation (Lines 863-873)

**Wirknorm ID**: W-009
**Article**: Article 11(1)-(2)
**Type**: Documentation Requirement for High-Risk Systems
**Consequence**: Must draw up and maintain technical documentation
**Requirements**:
1. Is a provider of high-risk AI system
2. Must draw up technical documentation before market/service
3. Must keep up-to-date
4. Must contain elements in Annex IV
5. If under sectoral law (Annex I), single set of docs covering both
6. SMEs can use simplified form

**Notes**: Documentation obligation for providers.

---

## Article 12 - Record-Keeping/Logging (Lines 875-897)

**Wirknorm ID**: W-010
**Article**: Article 12(1)-(3)
**Type**: Technical Requirement for High-Risk Systems
**Consequence**: Must enable automatic logging
**Requirements**:
1. Is a high-risk AI system
2. Must technically allow automatic recording of events (logs)
3. Logging must enable recording for: risk identification, post-market monitoring, monitoring operation
4. **Special for biometric ID (Annex III point 1(a))**: Must log period of use, reference database, matching input data, verification persons

**Notes**: Technical logging requirement for high-risk systems.

---

## Article 13 - Transparency to Deployers (Lines 899-931)

**Wirknorm ID**: W-011
**Article**: Article 13(1)-(3)
**Type**: Technical + Information Requirement for High-Risk Systems
**Consequence**: Must ensure transparency + provide instructions for use
**Requirements**:
1. Is a high-risk AI system
2. Must be designed/developed for sufficient transparency
3. Must be accompanied by instructions for use including:
   - Provider identity/contact
   - Intended purpose
   - Accuracy/robustness/cybersecurity levels
   - Known risks
   - Technical capabilities
   - Performance for specific persons/groups
   - Input data specifications
   - Output interpretation info
   - Pre-determined changes
   - Human oversight measures
   - Computational/hardware resources, lifetime, maintenance
   - Logging mechanisms

**Notes**: Comprehensive information provision obligation for providers.

---

## Article 14 - Human Oversight (Lines 933-961)

**Wirknorm ID**: W-012
**Article**: Article 14(1)-(5)
**Type**: Technical Requirement for High-Risk Systems
**Consequence**: Must design/develop for effective human oversight
**Requirements**:
1. Is a high-risk AI system
2. Must be designed/developed for human oversight during use
3. Oversight measures commensurate with risks/autonomy/context
4. Must enable natural persons to:
   - Understand capacities/limitations
   - Remain aware of automation bias
   - Interpret output
   - Decide not to use/override
   - Intervene/interrupt (stop button)
5. **Special for biometric ID (Annex III 1(a))**: No action unless verified by at least 2 natural persons (exceptions for law enforcement if disproportionate)

**Notes**: Technical + organizational requirement for human oversight.

---

## Article 15 - Accuracy, Robustness, Cybersecurity (Lines 963-983)

**Wirknorm ID**: W-013
**Article**: Article 15(1)-(5)
**Type**: Technical Requirement for High-Risk Systems
**Consequence**: Must achieve appropriate accuracy/robustness/cybersecurity
**Requirements**:
1. Is a high-risk AI system
2. Must achieve appropriate level of accuracy, robustness, cybersecurity
3. Must perform consistently throughout lifecycle
4. Must declare accuracy levels in instructions
5. Must be resilient to errors/faults/inconsistencies
6. Must address feedback loops (for systems that continue learning)
7. Must be resilient against unauthorized alterations
8. Must implement cybersecurity measures appropriate to circumstances
9. Must address AI-specific vulnerabilities (data poisoning, model poisoning, adversarial examples, confidentiality attacks)

**Notes**: Comprehensive technical security/performance requirement.

---

## Article 16 - Provider Obligations (High-Risk) (Lines 989-1017)

**Wirknorm ID**: W-014
**Article**: Article 16(a)-(l)
**Type**: Comprehensive Provider Obligations
**Consequence**: Providers of high-risk systems must fulfill 12 obligations
**Requirements**:
1. Is a provider of high-risk AI system
2. Must:
   - (a) Ensure compliance with Section 2 requirements
   - (b) Indicate name/trademark/contact on system/packaging/docs
   - (c) Have quality management system (Article 17)
   - (d) Keep documentation (Article 18)
   - (e) Keep automatically generated logs (Article 19)
   - (f) Undergo conformity assessment (Article 43)
   - (g) Draw up EU declaration of conformity (Article 47)
   - (h) Affix CE marking (Article 48)
   - (i) Register system (Article 49(1))
   - (j) Take corrective actions (Article 20)
   - (k) Demonstrate conformity upon request
   - (l) Ensure accessibility compliance (Directives 2016/2102, 2019/882)

**Notes**: Comprehensive package of 12 distinct obligations for high-risk providers.

---

## Article 17 - Quality Management System (Lines 1019-1055)

**Wirknorm ID**: W-015
**Article**: Article 17(1)-(4)
**Type**: QMS Requirement for High-Risk Providers
**Consequence**: Must establish and maintain quality management system
**Requirements**:
1. Is a provider of high-risk AI system
2. Must put in place QMS documented in written policies/procedures/instructions including:
   - (a) Regulatory compliance strategy
   - (b) Design techniques/procedures
   - (c) Development quality control/assurance
   - (d) Examination/test/validation procedures
   - (e) Technical specifications/standards
   - (f) Data management systems/procedures
   - (g) Risk management system (Article 9)
   - (h) Post-market monitoring system (Article 72)
   - (i) Serious incident reporting procedures (Article 73)
   - (j) Communication handling
   - (k) Record-keeping systems
   - (l) Resource management
   - (m) Accountability framework
3. Implementation proportionate to organization size
4. Financial institutions can integrate with existing systems
5. QMS can be integrated with sectoral law requirements

**Notes**: Detailed QMS requirement - 13 mandatory elements.

---

## Article 18 - Documentation Keeping (Lines 1057-1075)

**Wirknorm ID**: W-016
**Article**: Article 18(1)-(3)
**Type**: Record Retention Obligation
**Consequence**: Must keep documentation for 10 years
**Requirements**:
1. Is a provider of high-risk AI system
2. Must keep for 10 years after placing on market/service:
   - Technical documentation (Article 11)
   - QMS documentation (Article 17)
   - Notified body approvals (if applicable)
   - Notified body decisions/documents (if applicable)
   - EU declaration of conformity (Article 47)
3. Financial institutions keep as part of sectoral law docs

**Notes**: 10-year retention period for 5 document types.

---

## Article 19 - Automatically Generated Logs (Lines 1077-1083)

**Wirknorm ID**: W-017
**Article**: Article 19(1)-(2)
**Type**: Log Retention Obligation
**Consequence**: Must keep automatically generated logs
**Requirements**:
1. Is a provider of high-risk AI system
2. Logs under their control
3. Must keep logs for period appropriate to purpose, minimum 6 months
4. Unless other Union/national law provides otherwise
5. Financial institutions keep as part of sectoral law docs

**Notes**: Minimum 6-month log retention, can be longer.

---

## Grouping Analysis (Articles 4-19)

### Potential Groups:

**Group A: High-Risk Technical Requirements (Articles 9-15)**
- All share requirement: "Is a high-risk AI system"
- Each has distinct technical obligation:
  - W-007: Risk management
  - W-008: Data governance
  - W-010: Logging capability
  - W-011: Transparency/instructions
  - W-012: Human oversight
  - W-013: Accuracy/robustness/cybersecurity
- **Decision**: Keep separate - each is a distinct technical requirement

**Group B: High-Risk Provider Obligations (Articles 16-19)**
- W-014: Umbrella obligations (12 duties)
- W-015: QMS (detailed sub-obligation)
- W-016: Documentation retention
- W-017: Log retention
- W-009: Technical documentation (from Article 11)
- **Decision**: These could be grouped as "Provider Compliance Package" but better to keep granular

**Group C: High-Risk Classification (Article 6)**
- W-003a: Safety component pathway
- W-003b: Annex III pathway
- W-003c: Opt-out exception
- **Decision**: Keep separate - different pathways/conditions

---

## Progress Update

**Lines Read**: 617-1984 (1367 lines)
**Articles Completed**: 4-60 (57 articles)
**Wirknormen Extracted**: W-001 through W-039 (39+ distinct consequences)
**Next Article**: Article 60 continuation (Testing in real world conditions)

---

## Articles 47-60 Analysis

### Article 47 - EU Declaration of Conformity

**W-029**: Provider of high-risk AI system must draw up EU declaration of conformity
**Requirements**:
1. Is provider
2. System is high-risk
3. System is being placed on market OR put into service

**Consequence**: Must draw up written, machine-readable, physical/electronically signed EU declaration + keep 10 years + submit to authorities on request + keep up to date

**Details**:
- Declaration must state system meets Section 2 requirements
- Must contain info per Annex V
- Must be translated to understandable language
- If subject to other EU harmonisation law → single declaration

### Article 48 - CE Marking

**W-030**: Provider of high-risk AI system must affix CE marking
**Requirements**:
1. Is provider
2. System is high-risk
3. System has undergone conformity assessment

**Consequence**: Must affix CE marking (visibly, legibly, indelibly, or on packaging/docs if not possible) + digital CE marking for digitally provided systems + include notified body ID number if applicable

### Article 49 - Registration

**W-031a**: Provider must register self and system in EU database (Annex III systems)
**Requirements**:
1. Is provider (or authorized representative)
2. System is high-risk per Annex III
3. System NOT listed in Annex III point 2 (which has separate national registration)
4. Before placing on market or putting into service

**Consequence**: Must register themselves and system in EU database (Article 71)

**W-031b**: Provider must register self and system in EU database (Article 6(3) opt-out systems)
**Requirements**:
1. Is provider (or authorized representative)
2. Provider concluded system is NOT high-risk per Article 6(3) opt-out
3. Before placing on market or putting into service

**Consequence**: Must register themselves and system in EU database (Article 71)

**W-031c**: Deployer (public authority/institution) must register self, select system, register use
**Requirements**:
1. Is deployer
2. Deployer is: public authority OR Union institution/body/office/agency OR person acting on their behalf
3. System is high-risk per Annex III
4. System NOT listed in Annex III point 2
5. Before putting into service or using

**Consequence**: Must register themselves + select system + register use in EU database (Article 71)

**W-031d**: Special registration regime for law enforcement/migration/asylum/border control
**Requirements**:
1. System falls under Annex III points 1, 6, or 7 (law enforcement, migration, asylum, border control)
2. System is high-risk

**Consequence**: Registration in secure non-public section of EU database with limited information per Annex VIII/IX subsets

**W-031e**: National registration for employment/workers/self-employed management
**Requirements**:
1. System is high-risk per Annex III point 2 (employment/worker management)

**Consequence**: Must register at national level (not EU database)

### Article 50 - Transparency Obligations

**W-032**: Provider must inform users they're interacting with AI
**Requirements**:
1. Is provider
2. AI system intended to interact directly with natural persons
3. NOT obvious from reasonably well-informed person's perspective

**Consequence**: Must design/develop system so natural persons informed they're interacting with AI

**Exception**: AI systems authorized by law to detect/prevent/investigate/prosecute crime (unless public-facing crime reporting)

**W-033**: Provider must mark synthetic content as AI-generated
**Requirements**:
1. Is provider (including general-purpose AI systems)
2. System generates synthetic audio, image, video, or text content

**Consequence**: Must ensure outputs marked in machine-readable format and detectable as artificially generated/manipulated + technical solutions must be effective, interoperable, robust, reliable (as technically feasible)

**Exceptions**:
- Assistive function for standard editing
- Doesn't substantially alter input data/semantics
- Authorized by law for criminal offence detection/prevention/investigation/prosecution

**W-034**: Deployer must inform persons exposed to emotion recognition/biometric categorisation
**Requirements**:
1. Is deployer
2. System is emotion recognition OR biometric categorisation system
3. Natural persons are exposed to system operation

**Consequence**: Must inform natural persons of system operation + process personal data per GDPR/data protection regulations

**Exception**: Systems permitted by law to detect/prevent/investigate crime (with appropriate safeguards)

**W-035a**: Deployer must disclose deep fake content (image/audio/video)
**Requirements**:
1. Is deployer
2. System generates or manipulates image, audio, or video content
3. Content constitutes deep fake

**Consequence**: Must disclose content has been artificially generated or manipulated

**Exceptions**:
- Authorized by law to detect/prevent/investigate/prosecute crime
- Evidently artistic/creative/satirical/fictional work (limited disclosure requirement)

**W-035b**: Deployer must disclose AI-generated text published for public information
**Requirements**:
1. Is deployer
2. System generates or manipulates text
3. Text published with purpose of informing public on matters of public interest

**Consequence**: Must disclose text has been artificially generated or manipulated

**Exceptions**:
- Authorized by law to detect/prevent/investigate/prosecute crime
- Content underwent human review/editorial control with natural/legal person holding editorial responsibility

### Articles 51-52 - General-Purpose AI Model Classification

**W-036**: General-purpose AI model classified as systemic risk model
**Requirements** (EITHER):
1. Is general-purpose AI model
2. AND EITHER:
   - (a) Has high impact capabilities per technical tools/methodologies/indicators/benchmarks, OR
   - (b) Commission decision (ex officio or following scientific panel alert) determines equivalent capabilities/impact per Annex XIII criteria

**Presumption**: Model with cumulative training computation > 10^25 FLOPs = presumed high impact

**Consequence**: Model classified as "general-purpose AI model with systemic risk" → triggers Article 55 obligations

**W-037**: Provider must notify Commission of systemic risk model
**Requirements**:
1. Is provider of general-purpose AI model
2. Model meets Article 51(1)(a) condition (high impact capabilities)

**Consequence**: Must notify Commission without delay, within 2 weeks after requirement met/known + include information demonstrating requirement met

**Provider opt-out**: Provider may present substantiated arguments that model doesn't present systemic risks despite meeting threshold → Commission decides

### Articles 53-54 - General-Purpose AI Model Obligations

**W-038**: Provider of general-purpose AI model has 4 core obligations
**Requirements**:
1. Is provider
2. Model is general-purpose AI model

**Consequences** (4 obligations):
(a) Draw up and keep up-to-date technical documentation (training, testing, evaluation, per Annex XI) + provide to AI Office/national authorities on request
(b) Draw up and make available information/documentation to downstream AI system providers (to understand capabilities/limitations, per Annex XII)
(c) Put in place policy to comply with EU copyright law, including reservation of rights per Directive 2019/790
(d) Draw up and make publicly available detailed summary of training content per AI Office template

**Exception**: Open-source models (free and open-source license, publicly available parameters/weights/architecture/usage) are exempt from (a) and (b), UNLESS systemic risk model

**W-039**: Third-country provider must appoint EU authorized representative
**Requirements**:
1. Is provider of general-purpose AI model
2. Provider established in third country (non-EU)
3. Before placing model on Union market

**Consequence**: Must appoint by written mandate an authorized representative established in EU + enable representative to perform specified tasks (verify documentation, keep documentation 10 years, provide info to AI Office, cooperate with authorities)

**Exception**: Open-source models (free and open-source license, publicly available parameters) are exempt UNLESS systemic risk model

### Article 55 - Systemic Risk Model Additional Obligations

**W-040**: Provider of systemic risk model has 4 additional obligations
**Requirements**:
1. Is provider
2. Model is general-purpose AI model with systemic risk

**Consequences** (4 additional obligations beyond W-038):
(a) Perform model evaluation per standardised protocols + conduct/document adversarial testing to identify/mitigate systemic risks
(b) Assess and mitigate possible systemic risks at Union level from development/placing on market/use
(c) Keep track of, document, and report without undue delay to AI Office (and national authorities as appropriate) relevant information about serious incidents + possible corrective measures
(d) Ensure adequate cybersecurity protection for model and physical infrastructure

**Note**: Providers can rely on codes of practice (Article 56) to demonstrate compliance until harmonised standards published

### Articles 57-60 - AI Regulatory Sandboxes & Real-World Testing

**No direct Wirknormen for operators in Articles 57-59** - These establish sandbox framework, procedures, and data processing rules but don't create direct obligations for AI system providers/deployers outside sandbox participation

**Article 60 - Real-World Testing** - Begins defining testing framework but article continues beyond current reading position

---

## Articles 60-99 Analysis

### Article 60 - Real-World Testing (completion) & Article 61 - Informed Consent

**W-041**: Provider conducting real-world testing must meet 11 cumulative conditions
**Requirements**:
1. Is provider or prospective provider
2. Conducting testing of high-risk AI system (Annex III) in real world conditions outside sandbox
3. Before placing on market or putting into service

**Consequences** (11 conditions must be met):
(a) Drew up real-world testing plan + submitted to market surveillance authority
(b) Market surveillance authority approved testing (or tacit approval after 30 days)
(c) Registered testing in EU database with unique ID (or secure non-public section for law enforcement/migration/asylum/border, or national for employment systems)
(d) Provider established in EU or appointed EU legal representative
(e) Data transferred to third countries only with appropriate safeguards
(f) Testing duration max 6 months (extendable +6 months with notification)
(g) Vulnerable groups (age/disability) appropriately protected
(h) Deployers informed + given instructions + agreement specifying roles/responsibilities
(i) Subjects gave informed consent per Article 61 (exception: law enforcement if consent would prevent testing, no negative effects, data deleted)
(j) Effective oversight by qualified persons
(k) AI predictions/recommendations/decisions can be reversed and disregarded

**W-042**: Subject of real-world testing can withdraw consent + request data deletion at any time without detriment/justification

**W-043**: Provider must report serious incidents during testing + adopt immediate mitigation or suspend/terminate testing + establish recall procedure

**W-044**: Provider must notify market surveillance authority of suspension/termination + final outcomes

**W-045**: Informed consent requirements for real-world testing
**Requirements**: Freely-given informed consent prior to participation
**Must inform subjects about**: (a) nature/objectives/inconvenience, (b) conditions/duration, (c) rights to refuse/withdraw, (d) arrangements for reversal, (e) unique ID + contact details
**Must**: Date and document consent + give copy to subjects

### Article 62-63 - SME Support & Derogations

**No direct Wirknormen** - These are Member State/Commission support obligations, not operator obligations

**Note**: Article 63 - Microenterprises may comply with certain quality management system elements (Article 17) in simplified manner, but NOT exempted from other obligations

### Articles 64-70 - Governance Structures

**No direct Wirknormen for AI system operators** - These establish AI Office, Board, advisory forum, scientific panel, and national competent authorities

### Article 71 - EU Database

**No direct Wirknorm** - Database setup/maintenance is Commission obligation; registration obligations already captured in W-031a-e

### Article 72 - Post-Market Monitoring

**W-046**: Provider of high-risk AI system must establish post-market monitoring system + plan
**Requirements**:
1. Is provider
2. System is high-risk

**Consequence**: Must establish and document post-market monitoring system proportionate to AI tech nature and risks + actively/systematically collect/document/analyze data on performance throughout lifetime + evaluate continuous compliance with Chapter III Section 2 requirements + base on post-market monitoring plan (part of technical documentation)

**Exception**: High-risk systems under Annex I harmonisation legislation may integrate into existing systems; financial institutions under financial services law may use existing governance systems

### Article 73 - Serious Incident Reporting

**W-047**: Provider must report serious incidents to market surveillance authorities
**Requirements**:
1. Is provider
2. High-risk AI system placed on Union market
3. Serious incident occurred

**Consequence**: Must report immediately after establishing causal link (or reasonable likelihood), not later than 15 days after becoming aware

**Timing variations**:
- Widespread infringement or serious incident (Art 3(49)(b)): immediately, max 2 days
- Death of person: immediately after establishing/suspecting causal relationship, max 10 days
- May submit incomplete initial report followed by complete report

**W-048**: Provider must investigate serious incident + perform risk assessment + take corrective action + cooperate with authorities + not alter system before informing authorities

**Special reporting for specific systems**:
- Systems under other EU law with equivalent reporting: limited to Article 3(49)(c) incidents only
- Medical device high-risk AI: limited to Article 3(49)(c) incidents

### Articles 74-78 - Market Surveillance, Powers, Confidentiality

**No direct Wirknormen for operators** - These establish market surveillance framework, authority powers, fundamental rights authority powers, and confidentiality obligations

**Note**: These provide enforcement framework but don't create new operator obligations beyond those already captured

### Articles 79-84 - Enforcement Procedures

**No direct Wirknormen for operators** - These establish procedures for dealing with non-compliant systems, Union safeguard procedure, compliant systems presenting risk, formal non-compliance, and testing support structures

**Note**: While these trigger corrective obligations, the underlying obligations are already captured in earlier Wirknormen

### Article 85 - Right to Complaint

**No Wirknorm** - This is right of natural/legal persons to lodge complaints, not operator obligation

### Article 86 - Right to Explanation

**W-049**: Deployer must provide explanation of AI system's role in individual decision-making
**Requirements**:
1. Is deployer
2. Decision taken on basis of output from high-risk AI system (Annex III, except point 2 employment systems)
3. Decision produces legal effects OR similarly significantly affects person
4. Person considers adverse impact on health, safety, or fundamental rights
5. Affected person requests explanation

**Consequence**: Must provide clear and meaningful explanations of AI system's role in decision-making procedure + main elements of decision taken

**Exceptions**:
- Where Union/national law provides exceptions/restrictions
- Where right already provided under other Union law

### Article 87 - Whistleblower Protection

**No Wirknorm** - Directive 2019/1937 applies (whistleblower protection framework)

### Articles 88-94 - General-Purpose AI Model Enforcement

**No direct Wirknormen for operators** - These establish Commission/AI Office enforcement powers, monitoring actions, alerts, documentation requests, evaluation powers, measure requests, and procedural rights

**Note**: Underlying obligations already captured in W-038, W-039, W-040

### Articles 95-98 - Codes of Conduct, Guidelines, Delegation, Committee

**No direct Wirknormen** - These establish voluntary codes of conduct framework, Commission guidelines, delegated acts procedures, and committee procedures

### Article 99 - Penalties (beginning)

**No Wirknorm** - This establishes penalty framework but doesn't create new obligations (penalties apply to violations of obligations already captured)

---

## Articles 99-113 Analysis

### Article 99-101 - Penalties

**No direct Wirknormen** - These establish penalty frameworks (administrative fines) but don't create new obligations for operators. Penalties apply to violations of obligations already captured:
- Article 99: Up to €35M or 7% turnover for Article 5 violations
- €15M or 3% turnover for provider/representative/importer/distributor/deployer/notified body obligations
- €7.5M or 1% turnover for incorrect/incomplete/misleading information
- Article 100: Fines for EU institutions/bodies
- Article 101: Fines up to 3% or €15M for general-purpose AI model providers

### Articles 102-110 - Amendments to Other Regulations

**No direct Wirknormen** - These amend other product safety regulations to require consideration of AI Act Chapter III Section 2 requirements when adopting technical specifications for AI safety components

### Article 111 - Transitional Provisions

**No direct Wirknormen** - These establish grace periods for existing systems:
- Large-scale IT systems (Annex X): Compliance by 31 Dec 2030
- Other high-risk systems placed before 2 Aug 2026: Only if significant design changes (public authority systems by 2 Aug 2030)
- General-purpose AI models placed before 2 Aug 2025: Compliance by 2 Aug 2027

**Note**: Article 5 prohibitions apply immediately per Article 113

### Article 112 - Evaluation and Review

**No direct Wirknormen** - Establishes Commission review obligations (annual Annex III/Article 5 assessments, quadrennial evaluations)

### Article 113 - Entry into Force and Application

**No direct Wirknormen** - Establishes application dates:
- Enters into force: 20 days after publication
- General application: 2 August 2026
- Chapters I & II (definitions, scope): 2 February 2025
- Chapter V (general-purpose AI), Chapter VII (governance), transparency provisions: 2 August 2025
- Article 6(1) (product safety pathway): 2 August 2027

---

## FINAL Count

**Total Wirknormen Identified**: **49 distinct legal consequences** (W-001 through W-049)

**Articles Analyzed**: Articles 4-113 (110 articles)
**Lines Read**: 617-3280+ (~2,665 lines of 3,672 total core text)
**Progress**: **100% of operative articles completed**

**Note**: Annexes contain definitional/classificatory content (high-risk use cases, criminal offences, etc.) which are referenced by the main Wirknormen but don't themselves create independent obligations

---

## EXTRACTION COMPLETE - Final Summary

### Wirknormen Breakdown by Category

**Prohibitions (Article 5)**: W-002a through W-002h (8 prohibitions)
**AI Literacy**: W-001
**High-Risk Classification**: W-003a, W-003b, W-003c
**High-Risk Technical Requirements**: W-007 through W-013 (7 technical requirements)
**Provider Obligations**: W-014 through W-020 (provider duties, authorized representatives)
**Supply Chain Obligations**: W-021 through W-023 (importers, distributors, responsibility shifts)
**Deployer Obligations**: W-024 through W-026 (deployer duties, FRIA)
**Conformity & Marking**: W-027 through W-030 (conformity assessment, certificates, declaration, CE marking)
**Registration**: W-031a through W-031e (5 distinct registration requirements)
**Transparency**: W-032 through W-035b (AI disclosure, synthetic content marking, emotion recognition, deep fakes)
**General-Purpose AI Models**: W-036 through W-040 (classification, notification, core obligations, representatives, systemic risk obligations)
**Testing**: W-041 through W-045 (real-world testing conditions, consent, incident reporting)
**Post-Market**: W-046 through W-048 (monitoring, serious incident reporting, investigation)
**Rights**: W-049 (right to explanation)

### Critical Observations

1. **Most Complex Wirknormen**: W-003 (high-risk classification), W-014 (provider 12 obligations), W-024 (deployer 12 obligations), W-041 (real-world testing 11 conditions)

2. **Foundational Requirements**: Many Wirknormen share common requirements:
   - "Is AI system" (foundational)
   - "Is high-risk" (triggers W-007 through W-049 for most)
   - "Is provider" vs "Is deployer" (different obligation sets)
   - "Is general-purpose AI model" (triggers W-036 through W-040)

3. **Grouping Candidates**: Despite 49 distinct Wirknormen, many can be grouped by shared requirements:
   - All high-risk technical requirements (W-007-W-013) share: is provider + is high-risk + specific technical obligation
   - All registration obligations (W-031a-e) share: registration requirement + specific conditions
   - All transparency obligations (W-032-W-035b) share: transparency purpose + specific context

4. **Exceptions and Carve-outs**:
   - Law enforcement exceptions appear frequently
   - Open-source model exceptions for basic obligations (but NOT systemic risk)
   - Medical device/product safety regimes have integration provisions
   - Financial institutions can use existing governance frameworks

