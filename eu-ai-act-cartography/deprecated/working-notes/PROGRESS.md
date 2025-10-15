# EU AI Act Cartography Progress

## Mission
Rigorously map the entire EU AI Act with complete logical structure, threshold requirements, and shared nodes.

## Completed

### Foundational Architecture (Layers 0-3)
✅ **Article 1**: Subject matter and purpose
✅ **Article 2(1)**: Scope - 7 alternative pathways mapped
✅ **Article 2(2-12)**: All exclusions and special rules mapped
✅ **Article 3 - Core Definitions**:
  - (1) AI system - with interpretative questions
  - (2) Risk
  - (3)-(8) All actor definitions (provider, deployer, importer, distributor, authorized rep, operator)
  - (9)-(13) Temporal/operational concepts (placing on market, putting into service, intended purpose, reasonably foreseeable misuse)
  - (23) Substantial modification

### Shared Nodes Created
- `scope-applicability.json` - Complete scope determination
- `scope-exclusions.json` - All 10+ exclusions with sub-conditions
- `ai-system-definition.json` - Foundational definition with interpretative questions
- `core-actor-definitions.json` - All 6+ actor types
- `temporal-operational-concepts.json` - Market entry and purpose concepts

### Working Notes
- `session-1-foundation.md` - Article 1-2 analysis
- `article-3-definitions-analysis.md` - Definitions tracker
- `article-5-structure-notes.md` - Prohibited practices structure
- `source-text-issues.md` - Documentation of MD source gaps

## In Progress

### Article 3 Remaining Definitions (~50 definitions)
- [ ] (14) Safety component
- [ ] (15) Instructions for use
- [ ] (16)-(17) Recall/withdrawal
- [ ] (18) Performance
- [ ] (19)-(28) Compliance/governance definitions
- [ ] (29)-(33) Data definitions
- [ ] (34)-(43) Biometric definitions (critical for Art 5)
- [ ] (44)-(48) Law enforcement and governance
- [ ] (49) Serious incident
- [ ] (50)-(52) Data protection related
- [ ] (53)-(59) Testing and sandbox
- [ ] (60)-(68) Misc (deep fake, GP AI, etc.)

### Article 5: Prohibited AI Practices
- [ ] Map all 8 prohibitions (a-h) with full logical structure
- [ ] Note: (c) and (h) text incomplete in source - inferring from context
- [ ] Map Art 5(2)-(7) procedural regime for biometric identification

### Article 6-7: High-Risk Classification
- [ ] Article 6 complete logic tree
- [ ] Annex I (Union harmonisation legislation)
- [ ] Annex III (high-risk use cases)
- [ ] Article 7 (amendments to Annex III)

## Pending

### High-Risk Requirements (Chapter III Section 2)
- [ ] Article 8: Compliance framework
- [ ] Article 9: Risk management (NEEDS RECONSTRUCTION with full threshold chain)
- [ ] Article 10: Data governance
- [ ] Article 11: Technical documentation
- [ ] Article 12: Record-keeping
- [ ] Article 13: Transparency/information for deployers
- [ ] Article 14: Human oversight
- [ ] Article 15: Accuracy, robustness, cybersecurity

### Provider/Deployer Obligations (Chapter III Sections 3-5)
- [ ] Articles 16-27: Provider obligations
- [ ] Articles 23-27: Deployer obligations
- [ ] Articles 28-29: Responsibility allocation

### Other Regulatory Tracks
- [ ] Transparency obligations (Art 50-52)
- [ ] General-purpose AI (Chapter V)
- [ ] Governance (Chapter VI-VII)
- [ ] Enforcement (Chapter VIII)
- [ ] Innovation measures (Chapter IX)

### All Annexes
- [ ] Annex I: Union harmonisation legislation (Sections A & B)
- [ ] Annex II: Criminal offences for biometric identification
- [ ] Annex III: High-risk AI systems use cases
- [ ] Annex IV: Technical documentation
- [ ] Annexes V-XII: Various requirements

## Methodological Refinements Needed

### Data Structure Evolution
Current JSON structure works for:
- Scope determination (OR pathways, AND exclusions)
- Actor definitions
- Temporal concepts

Needs refinement for:
- Nested exception structures (Art 5 prohibitions with exceptions)
- Multi-level dependency graphs
- Cross-referenced obligations
- Annex integration

### Confidence Tracking
Working well - explicit HIGH/MEDIUM/LOW at each node with flags for LLM evaluation

### Shared Node Strategy
Successfully identifying:
- Foundational definitions (AI system, risk, actors)
- Classification systems (high-risk, prohibited)
- Temporal triggers (market placement)

## Critical Insights So Far

1. **Layered Architecture**: Every obligation requires passing through scope → exclusions → actor status → system classification → specific provision

2. **Provider-Centric**: Provider defines "intended purpose" which cascades through entire regulatory framework

3. **Classification Tracks**: Act creates parallel tracks (prohibited, high-risk, transparency, GP AI) with different regimes

4. **Interpretative Elements**: Extensive use of context-dependent terms requiring LLM evaluation ("reasonably foreseeable", "significant harm", "materially distorting", "acceptable risk")

5. **European Regulatory Style**: Detailed procedural requirements, extensive cross-references, multiple annexes, delegated acts provisions

## Estimated Completion

Based on progress:
- **Definitions**: 2-3 more hours
- **Article 5**: 1-2 hours
- **Article 6-7 + Annexes I-III**: 2-3 hours
- **Chapter III Section 2 (Art 8-15)**: 3-4 hours
- **Remaining provisions**: 5-7 hours
- **Validation & refinement**: 2-3 hours

**Total**: 15-22 hours of rigorous mapping work

## Next Immediate Steps

1. Complete Article 3 definitions (batch process in groups)
2. Map Article 5 prohibitions despite source text issues
3. Map Article 6 high-risk classification (critical dependency)
4. Reconstruct Article 9 with complete threshold chain
5. Continue systematically through all provisions

## Quality Standards Being Applied

✅ Every node has confidence rating
✅ Interpretative elements flagged for LLM evaluation
✅ Dependencies explicitly mapped
✅ Alternative vs cumulative operators clear
✅ Shared nodes extracted
✅ Source text issues documented
✅ Legal reasoning explained

---

*Updated: 2025-10-08*
*Methodology: Legal Cartography v0.1*
