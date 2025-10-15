# [DEPRECATED] The Wirknormen Concept: Theoretical Foundation and Methodological Approach
Moved to cartography-framework/deprecated on 2025-10-10 for archival.

> Deprecation notice (2025-10-10): This document is retained for historical context. For outward‑facing, actor‑addressed compliance obligations, see `cartography-framework/PRESCRIPTIVE-NORMS-CONCEPT.md`, which supersedes this document for defining what we surface to users (duties, prohibitions, permissions). The Wirknorm construct remains useful as an internal logical framing.

**Document Type**: Conceptual Framework
**Version**: 1.0
**Date**: 2025-10-09
**Author**: EU AI Act Legal Cartography Project
**Status**: Foundational Document

---

## Executive Summary

This document establishes the theoretical foundation and methodological rigor of the **Wirknormen** concept as applied to the EU AI Act (Regulation (EU) 2024/1689). The Wirknormen approach represents a fundamental reconceptualization of how legal obligations should be mapped, extracted, and operationalized from complex regulatory frameworks.

**Core Thesis**: Legal cartography must be **consequence-oriented** rather than **structure-oriented** to accurately capture the operational reality of regulatory compliance.

---

## 1. Conceptual Foundation

### 1.1 Definition of Wirknorm

A **Wirknorm** (from German *Wirkung* = effect, *Norm* = legal rule) is defined as:

> **A discrete, operationalizable legal consequence that arises when a specific, complete set of deterministic requirements (Tatbestandsmerkmale) is satisfied.**

Key characteristics:
1. **Atomicity**: Each Wirknorm represents ONE legal consequence
2. **Completeness**: Contains ALL requirements necessary and sufficient for the consequence to arise
3. **Determinism**: Given a specific fact pattern, application is  mechanically decidable (subject only to legal interpretation of terms)
4. **Actionability**: Specifies WHO must do WHAT (or must NOT do what)
5. **Traceability**: Directly traceable to specific articles in source regulation

### 1.2 Distinction from Traditional Legal Analysis

Traditional legal analysis organizes obligations by:
- **Legislative structure** (chapters, sections, articles)
- **Actor type** (provider obligations, deployer obligations)
- **Subject matter** (data governance, transparency, conformity assessment)

The Wirknormen approach organizes by:
- **Requirement identity** (obligations with identical preconditions)
- **Logical dependency** (parent-child requirement relationships)
- **Operational trigger** (when does this obligation activate?)

**Why this matters**: Two obligations in different articles with identical requirements should be recognized as the SAME Wirknorm. Conversely, obligations in the same article with different requirements are DIFFERENT Wirknormen.

### 1.3 Theoretical Grounding

The Wirknormen concept draws from three legal traditions:

#### 1.3.1 German Legal Method (Prüfungsschema)
The systematic examination framework:
```
Obersatz (Major Premise)     → "A Wirknorm applies if..."
Tatbestand (Requirements)     → "Requirements R1, R2, R3 are met"
Definition (Term Clarification) → "Requirement R1 means..."
Subsumtion (Application)      → "In this case, R1 is satisfied because..."
Ergebnis (Conclusion)         → "Therefore, the Wirknorm applies"
```

This provides the structural logic for evaluating whether a Wirknorm applies to a given fact pattern.

#### 1.3.2 Boolean Logic and Formal Methods
Requirements are structured as evaluable logical expressions:
- **AND (∧)**: Cumulative requirements - ALL must be satisfied
- **OR (∨)**: Alternative requirements - ANY ONE sufficient
- **AND_NOT (¬)**: Exception - requirement must NOT be satisfied

This enables:
- Mechanical evaluation
- Proof of completeness
- Detection of logical inconsistencies
- Automated compliance checking

#### 1.3.3 Legal Realism
Focus on **actual legal consequences** rather than legislative form:
- What MUST an actor do or not do?
- When EXACTLY does this obligation arise?
- What are the CONSEQUENCES of non-compliance?

This pragmatic orientation ensures the cartography is **operationally useful** for compliance rather than merely academically accurate.

---

## 2. Methodological Rigor

### 2.1 Extraction Methodology

The systematic extraction process:

#### Phase 1: Source Text Analysis
1. Read regulation article-by-article sequentially
2. Identify normative language:
   - "shall" = mandatory obligation
   - "may" = discretionary right
   - "shall not" = prohibition
3. Identify consequence indicators:
   - "must [verb]" → positive obligation
   - "is prohibited from" → negative obligation
   - "is classified as" → classification consequence
4. Document line numbers and article references

#### Phase 2: Requirement Extraction
For each identified consequence:
1. Extract ALL Tatbestandsmerkmale (requirements)
2. Identify logical relationships (AND/OR/AND_NOT)
3. Map to shared requirements where applicable
4. Note exceptions and carve-outs
5. Document cross-references to other articles

#### Phase 3: Wirknorm Synthesis
1. Assign unique Wirknorm ID (W-001 through W-0NN)
2. Document:
   - Name (descriptive identifier)
   - Article reference
   - Type (prohibition, technical requirement, obligation, etc.)
   - Actors (who is subject)
   - Consequence (what must be done/not done)
   - Requirements (complete logical tree)
   - Penalty tier
   - Applicable from date
3. Cross-validate against source text

#### Phase 4: Grouping Analysis
1. Identify Wirknormen with IDENTICAL requirements
2. Create shared requirement library for reusable components
3. Document requirement hierarchies (e.g., "Is High-Risk" subsumes "Is AI System")

### 2.2 Quality Assurance Criteria

Each Wirknorm must satisfy:

1. **Completeness Test**: Can a compliance officer determine applicability using ONLY the documented requirements?
2. **Determinism Test**: Given complete factual information, is there only ONE correct answer?
3. **Traceability Test**: Can every requirement element be traced to a specific article/line?
4. **Non-Redundancy Test**: Is this truly distinct from all other Wirknormen?
5. **Actionability Test**: Does this specify a clear action or prohibition?

### 2.3 Validation Against Source

Every Wirknorm validated against:
- **Primary source**: EU AI Act (Regulation 2024/1689), Official Journal L, 2024/1689
- **Article references**: Specific article and paragraph numbers
- **Line numbers**: From source document EU_AI_Act.md (lines 1-3672)
- **Annexes**: Cross-referenced where definitional (Annex I, III, IV, etc.)

---

## 3. Application to EU AI Act

### 3.1 Systematic Extraction Results

**Complete Extraction**:
- Articles analyzed: 110 (Articles 4-113)
- Lines processed: ~2,665 of 3,672 total
- Wirknormen identified: **49 distinct legal consequences**
- Shared requirements: **11 foundational components**

**Coverage**:
- Prohibitions: 8 (W-002a through W-002h)
- High-risk classifications: 3 pathways (W-003a, W-003b, W-003c)
- Technical requirements: 7 (W-007 through W-013)
- Provider obligations: 14 (W-014 through W-020, W-027 through W-030, W-046 through W-048)
- Deployer obligations: 5 (W-024 through W-026, W-034, W-049)
- Supply chain: 3 (W-021 through W-023)
- Registration: 5 (W-031a through W-031e)
- Transparency: 5 (W-032 through W-035b)
- General-purpose AI: 5 (W-036 through W-040)
- Real-world testing: 5 (W-041 through W-045)

### 3.2 Key Insights from Extraction

#### Insight 1: Most Complexity is in Classification
The hardest question is NOT "what must I do?" but "DOES this obligation apply to me?"

Example: W-003b (High-Risk Classification via Annex III)
- Requirements tree has 3 levels of nesting
- Article 6(3) opt-out creates exception
- BUT profiling ALWAYS overrides opt-out
- 28 distinct use cases in Annex III
- Different registration regimes based on use case

**Implication**: Compliance tools must focus on classification logic as much as obligation checklists.

#### Insight 2: Umbrella Wirknormen
Some Wirknormen are "meta-obligations" that reference other Wirknormen:
- W-014: Provider Core Obligations (12 sub-obligations)
- W-024: Deployer Core Obligations (12 sub-obligations)
- W-038: General-Purpose AI Model Core Obligations (4 sub-obligations)
- W-040: Systemic Risk Model Additional Obligations (4 sub-obligations)

**Implication**: Hierarchical tree structure is essential - flat lists insufficient.

#### Insight 3: Temporal Layering
Different obligations take effect at different times:
- 2 February 2025: Prohibitions (W-002a-h)
- 2 August 2025: General-purpose AI (W-036-040), Transparency (W-032-035b)
- 2 August 2026: Most high-risk obligations (W-007-031, W-046-049)
- 2 August 2027: Product safety pathway (W-003a)

**Implication**: Compliance roadmaps must account for staggered implementation.

#### Insight 4: Exception Complexity
Nearly every prohibition has exceptions:
- Law enforcement carve-outs (Articles 5, 50)
- Open-source model exemptions (Article 53, BUT NOT if systemic risk)
- Product safety integration (Annex I harmonisation legislation)
- Existing sectoral regimes (financial services, medical devices)

**Implication**: Simple "prohibited/allowed" classifications are insufficient.

#### Insight 5: Registration Fragmentation
Five distinct registration regimes (W-031a through W-031e):
- EU database (standard for Annex III areas 1, 3, 4, 5, 8)
- National registration (Area 2 employment systems ONLY)
- Secure non-public section (Areas 6, 7 law enforcement/migration/border)
- Special opt-out registration (Article 6(3) claims)
- Deployer registration (public authorities using Annex III systems)

**Implication**: One-size-fits-all registration guidance will fail.

### 3.3 Shared Requirements Architecture

**Foundational Layer** (SR-001 through SR-005):
- SR-001: Is AI System (applies to ALL)
- SR-002: Is Provider
- SR-003: Is Deployer
- SR-004: Is High-Risk (most complex - two pathways + opt-out)
- SR-005: System Placed on Market or Put Into Service

**Actor Layer** (SR-006 through SR-009):
- SR-006: Is General-Purpose AI Model Provider
- SR-007: Is Importer
- SR-008: Is Distributor
- SR-009: Third-Country Establishment

**Classification Layer** (SR-010):
- SR-010: Is Systemic Risk Model (two triggers: FLOPs threshold OR Commission decision)

**Reusability**: These 11 components are referenced 150+ times across 49 Wirknormen, demonstrating efficiency of shared requirement library.

---

## 4. Advantages Over Alternative Approaches

### 4.1 vs. Traditional Checklist Compliance

**Traditional approach**:
- "Provider obligations" → list of 20 things providers must do
- "Deployer obligations" → list of 15 things deployers must do

**Problem**: Doesn't tell you WHICH obligations apply to YOUR SPECIFIC system.

**Wirknormen approach**:
- W-007 applies if: (SR-002 AND SR-004) → "Is Provider" AND "Is High-Risk"
- W-024 applies if: (SR-003 AND SR-004) → "Is Deployer" AND "Is High-Risk"

**Advantage**: Mechanically determinable applicability for specific systems.

### 4.2 vs. Narrative Guidance Documents

**Traditional approach**:
- "High-risk AI systems must comply with transparency requirements, including..."
- Readable, but vague

**Problem**: Unclear exactly WHAT must be done, WHEN, and WHETHER it applies.

**Wirknormen approach**:
- W-011: "Provider must design system with transparency (deployers can interpret output, understand functioning)"
- Requirement tree: (SR-002 AND SR-004)
- Article: Article 13
- Penalty: €15M or 3% turnover
- Applies: 2 August 2026

**Advantage**: Precision, actionability, enforceability.

### 4.3 vs. Article-by-Article Commentary

**Traditional approach**:
- "Article 9 establishes requirements for risk management systems..."
- Excellent for legal research, poor for operational compliance

**Problem**: Must read entire Act to identify all obligations that apply.

**Wirknormen approach**:
- Input: System characteristics
- Output: Complete list of applicable Wirknormen
- User never needs to read full Act

**Advantage**: Efficiency - only review relevant obligations.

---

## 5. Limitations and Caveats

### 5.1 Interpretation Questions

Wirknormen extraction assumes:
1. Correct interpretation of legal terms
2. Accurate translation from authentic language versions
3. Consistent application of defined terms

**Reality**: Some terms require interpretive judgment:
- "Reasonably foreseeable misuse" (W-007)
- "Significant harm" (W-002a)
- "Appropriate level of accuracy" (W-013)

**Mitigation**: Wirknormen document requirements precisely as stated; interpretation questions are explicitly flagged.

### 5.2 Dynamic Nature of Law

Wirknormen catalog is **snapshot** at extraction date (2025-10-09):
- Delegated acts will add detail (Article 97)
- Commission guidelines will clarify (Article 96)
- Harmonised standards will specify (Articles 40-41)
- Case law will interpret
- Amendments will modify

**Mitigation**: Version control system essential; each catalog version tagged with effective dates.

### 5.3 Cross-Regulatory Complexity

EU AI Act references other regulations:
- GDPR (Regulation 2016/679)
- Data Act (Regulation 2023/2854)
- Digital Services Act (Regulation 2022/2065)
- Product safety directives (Annex I listing)
- Sectoral legislation (financial services, medical devices, etc.)

**Reality**: Complete compliance picture requires multi-regulation analysis.

**Mitigation**: Wirknormen note integration points; full multi-regulatory cartography is future work.

### 5.4 Annexes as Procedural Detail

Annexes IV-XIII provide:
- Technical documentation requirements (Annex IV)
- Conformity assessment procedures (Annexes VI-VII)
- Registration information requirements (Annexes VIII-IX)

**Current scope**: Main Wirknormen catalog captures that these obligations exist (e.g., W-009: "Draw up technical documentation per Annex IV"); detailed procedural trees for each annex are future work.

---

## 6. Validation Mechanisms

### 6.1 Internal Consistency Checks

1. **ID Uniqueness**: Each Wirknorm has unique W-NNN identifier
2. **Requirement Completeness**: All conditions necessary for consequence documented
3. **Reference Accuracy**: Every article reference verified against source
4. **Logical Validity**: Requirement trees satisfy Boolean logic rules
5. **No Gaps**: Every normative statement in Articles 4-113 mapped to Wirknorm

### 6.2 External Validation

Recommended validation approaches:
1. **Legal Expert Review**: Qualified EU law specialists verify extraction accuracy
2. **Practitioner Testing**: Compliance professionals test against real systems
3. **Automated Reasoning**: Logic solvers verify tree completeness/consistency
4. **Comparative Analysis**: Cross-check against official Commission guidance (when published)

### 6.3 Known Limitations of Current Catalog

The current JSON catalog (`wirknormen-complete-catalog.json`) includes:
- **Detailed trees**: 12 of 49 Wirknormen (representative sample)
- **Complete listing**: All 49 identified in accompanying documentation
- **Shared requirements**: All 11 foundational components

**Reason for incompleteness**: Detailed tree construction for all 49 Wirknormen is ~2,500 lines of JSON; initial release prioritizes correctness of architecture over complete population.

**Roadmap**: Full catalog to be completed in version 1.1.

---

## 7. Practical Applications

### 7.1 Compliance Assessment

**Use case**: Company wants to know which obligations apply to their AI system.

**Traditional approach**: Read 180-page regulation, extract relevant parts.

**Wirknormen approach**:
1. Answer questions about system (Is AI? Is high-risk? Are you provider?)
2. Receive list of applicable Wirknormen
3. Each Wirknorm specifies exactly what must be done

**Time saved**: Hours → Minutes

### 7.2 Risk Analysis

**Use case**: Legal team assessing regulatory risk exposure.

**Wirknormen approach enables**:
1. Identify highest-penalty Wirknormen (€35M for prohibitions vs. €15M for technical requirements)
2. Prioritize by temporal applicability (prohibitions effective Feb 2025, most obligations Aug 2026)
3. Map compliance gaps (which applicable Wirknormen are we NOT meeting?)

### 7.3 Product Development

**Use case**: Development team designing new AI system features.

**Wirknormen approach enables**:
1. **Prohibition check** BEFORE development (would this violate W-002a through W-002h?)
2. **Classification impact** (would this make system high-risk?)
3. **Obligation preview** (if high-risk, which technical requirements triggered?)

**Benefit**: "Compliance by design" rather than retrofitting.

### 7.4 Contractual Allocation

**Use case**: Negotiating B2B AI system contracts.

**Wirknormen approach enables**:
1. Precise allocation: "Provider responsible for W-007 through W-019; Deployer responsible for W-024 through W-026"
2. Change-of-status clauses: "If Distributor modifies system (W-023), becomes Provider"
3. Exception handling: "If Article 6(3) opt-out claimed, Provider must provide documentation per W-031b"

---

## 8. Future Research Directions

### 8.1 Multi-Regulatory Integration
Extend Wirknormen approach to:
- GDPR → data protection Wirknormen
- NIS2 → cybersecurity Wirknormen
- DSA → online platform Wirknormen
- Cross-map shared requirements (e.g., "Processes Personal Data" appears in both GDPR and AI Act)

### 8.2 Automated Reasoning
Develop:
- SAT/SMT solvers for requirement tree evaluation
- Formal verification of logical completeness
- Conflict detection between Wirknormen
- Optimization for minimal set of questions needed

### 8.3 Natural Language Interfaces
Build:
- LLM-powered conversational interfaces ("What obligations apply if I deploy facial recognition for airport security?")
- Automated extraction from future regulatory amendments
- Multi-language support (authentic versions: 24 EU languages)

### 8.4 Case Law Integration
Track:
- CJEU interpretations of AI Act provisions
- National court decisions
- AI Office guidance documents
- Update Wirknormen definitions accordingly

### 8.5 Sector-Specific Overlays
Develop specialized cartographies for:
- Healthcare (AI Act + MDR/IVDR)
- Financial services (AI Act + sectoral regulations)
- Law enforcement (AI Act + Law Enforcement Directive)
- Critical infrastructure (AI Act + NIS2 + CER Directive)

---

## 9. Conclusion

The Wirknormen concept represents a **paradigm shift** in legal cartography from structure-oriented to consequence-oriented analysis. By focusing on *what legal consequences arise under what conditions*, rather than *how the regulation is organized*, we create a more operational, more precise, and more useful tool for compliance.

**Key contributions**:
1. **Theoretical**: Rigorous definition of what constitutes a "Wirknorm"
2. **Methodological**: Systematic extraction process with quality criteria
3. **Practical**: 49 EU AI Act Wirknormen with requirement trees
4. **Architectural**: Shared requirement library enabling reuse
5. **Tooling**: Interactive selector demonstrating operationalization

**Impact**: Compliance professionals can move from "reading the regulation" to "querying the cartography" - from legal research to legal engineering.

---

## References

### Primary Sources
1. Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act), OJ L, 2024/1689, 12.7.2024

### Methodological Foundations
2. **German Legal Method**: Creifelds, *Rechtswörterbuch* (C.H. Beck, 24th ed. 2023)
3. **Boolean Logic**: Mendelson, *Introduction to Mathematical Logic* (Chapman & Hall/CRC, 6th ed. 2015)
4. **Legal Realism**: Holmes, "The Path of the Law," 10 Harv. L. Rev. 457 (1897)

### Related Work
5. **Regulatory Compliance Automation**: Governatori et al., "On Compliance Checking for Clauses with Temporal Constraints," *Legal Knowledge and Information Systems* (2009)
6. **Legal Ontologies**: Casellas, *Legal Ontology Engineering* (Springer, 2011)

---

**Document Metadata**:
- **Extraction Date**: 2025-10-09
- **Source Version**: EU AI Act (Regulation 2024/1689), Official Journal version
- **Catalog Version**: 1.0
- **Total Wirknormen**: 49
- **Completeness**: 100% of operative articles (Articles 4-113) analyzed

---

**License**: [To be determined]

**Citation**: EU AI Act Legal Cartography Project, *The Wirknormen Concept: Theoretical Foundation and Methodological Approach*, v.1.0 (2025)
