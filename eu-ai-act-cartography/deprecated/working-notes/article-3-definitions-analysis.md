# Article 3: Definitions - Systematic Analysis

## Purpose
Article 3 contains 68 definitions. These are FOUNDATIONAL - understanding their interdependencies is critical for mapping all obligations.

## Methodology
1. Extract all 68 definitions
2. Identify which definitions reference other definitions (dependency graph)
3. Flag interpretative elements requiring LLM evaluation
4. Create reusable JSON nodes for key definitions

## Progress Tracker

### Core Actor Definitions (WHO)
- [ ] (3) Provider
- [ ] (4) Deployer
- [ ] (5) Authorised representative
- [ ] (6) Importer
- [ ] (7) Distributor
- [ ] (8) Operator (umbrella term)

### System/Model Definitions (WHAT)
- [ ] (1) AI system ⭐ FOUNDATIONAL
- [ ] (63) General-purpose AI model
- [ ] (66) General-purpose AI system
- [ ] (64) High-impact capabilities
- [ ] (65) Systemic risk

### Temporal/Operational Concepts (WHEN/HOW)
- [ ] (9) Placing on the market
- [ ] (10) Making available on the market
- [ ] (11) Putting into service
- [ ] (12) Intended purpose ⭐ REFERENCED EVERYWHERE
- [ ] (13) Reasonably foreseeable misuse ⭐ CRITICAL
- [ ] (23) Substantial modification

### Technical Concepts
- [ ] (14) Safety component
- [ ] (18) Performance of an AI system
- [ ] (29) Training data
- [ ] (30) Validation data
- [ ] (31) Validation data set
- [ ] (32) Testing data
- [ ] (33) Input data

### Biometric Concepts
- [ ] (34) Biometric data
- [ ] (35) Biometric identification
- [ ] (36) Biometric verification
- [ ] (39) Emotion recognition system
- [ ] (40) Biometric categorisation system
- [ ] (41) Remote biometric identification system
- [ ] (42) Real-time remote biometric identification system
- [ ] (43) Post-remote biometric identification system

### Risk and Harm
- [ ] (2) Risk ⭐ FOUNDATIONAL
- [ ] (49) Serious incident

### Compliance/Governance
- [ ] (15) Instructions for use
- [ ] (16) Recall of an AI system
- [ ] (17) Withdrawal of an AI system
- [ ] (19) Notifying authority
- [ ] (20) Conformity assessment
- [ ] (21) Conformity assessment body
- [ ] (22) Notified body
- [ ] (24) CE marking
- [ ] (25) Post-market monitoring system
- [ ] (26) Market surveillance authority
- [ ] (48) National competent authority

### Standards and Specifications
- [ ] (27) Harmonised standard
- [ ] (28) Common specification

### Data Protection Related
- [ ] (37) Special categories of personal data
- [ ] (38) Sensitive operational data
- [ ] (50) Personal data
- [ ] (51) Non-personal data
- [ ] (52) Profiling

### Testing and Innovation
- [ ] (53) Real-world testing plan
- [ ] (54) Sandbox plan
- [ ] (55) AI regulatory sandbox
- [ ] (57) Testing in real-world conditions
- [ ] (58) Subject (for real-world testing)
- [ ] (59) Informed consent

### Miscellaneous
- [ ] (44) Publicly accessible space
- [ ] (45) Law enforcement authority (fragment - appears incomplete in source)
- [ ] (46) Law enforcement
- [ ] (47) AI Office
- [ ] (56) AI literacy
- [ ] (60) Deep fake
- [ ] (61) Union-wide infringement (fragment)
- [ ] (62) Critical infrastructure
- [ ] (67) Floating-point operation
- [ ] (68) Downstream provider

## Critical Interdependencies Identified

### Definition (1) AI system
**Dependencies**: None - this is ROOT definition
**Referenced by**: Almost every provision
**Must map**: With extreme rigor

### Definition (12) Intended purpose
**Dependencies**: References provider, instructions for use, technical documentation
**Referenced by**: Articles 5, 6, 9, 10, and throughout
**Critical**: Determines scope of many obligations

### Definition (13) Reasonably foreseeable misuse
**Dependencies**: Intended purpose (inverse), AI system
**Referenced by**: Article 9(2)(b) risk management
**Interpretative**: "reasonably foreseeable" requires context

### Definition (2) Risk
**Dependencies**: Harm (undefined but referenced)
**Referenced by**: Article 6, 9, and risk management throughout
**Formula**: Probability × Severity

## Next: Extract all definitions systematically
