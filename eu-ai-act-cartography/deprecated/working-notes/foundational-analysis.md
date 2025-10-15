# EU AI Act: Foundational Legal Architecture Analysis

## Purpose
Before mapping individual Wirknormen (legal consequences), we must rigorously map the foundational architecture that determines WHEN any provision applies at all.

## Layered Threshold Architecture

Every obligation in the EU AI Act requires passing through multiple threshold layers:

```
Layer 0: Scope of Application (Art 1-2)
    ↓
Layer 1: Material Scope - AI System Definition (Art 3(1))
    ↓
Layer 2: Territorial/Personal Scope (Art 2(1))
    ↓
Layer 3: Exclusions (Art 2(3)-(12))
    ↓
Layer 4: Actor Classification (Art 3: provider, deployer, etc.)
    ↓
Layer 5: System Classification (e.g., high-risk per Art 6)
    ↓
Layer 6: Specific Provision Applicability
    ↓
Substantive Obligation
```

## Critical Insight
Article 9 (risk management) cannot apply unless:
1. EU AI Act applies territorially/materially (Art 2)
2. No exclusions apply (Art 2(3)-(12))
3. System is "AI system" per Art 3(1)
4. System is "high-risk" per Art 6
5. Actor is "provider" per Art 3(3)
6. System is being/has been placed on market or put into service

**I initially failed to map Layers 0-3. This was incorrect.**

## Analysis Status

### Layer 0-1: Material & Territorial Scope
- [ ] Article 1 subject matter
- [ ] Article 2(1) territorial scope rules
- [ ] Article 3(1) AI system definition (foundational)

### Layer 2: Exclusions (Article 2)
- [ ] Art 2(2): Special rules for certain high-risk systems
- [ ] Art 2(3): National security exclusion
- [ ] Art 2(4): Third country authorities exclusion
- [ ] Art 2(5): Intermediary services exclusion
- [ ] Art 2(6): Scientific R&D exclusion
- [ ] Art 2(7): GDPR relationship
- [ ] Art 2(8): Pre-market R&D exclusion
- [ ] Art 2(9): Consumer protection harmony
- [ ] Art 2(10): Personal non-professional use exclusion
- [ ] Art 2(11): Worker protection preservation
- [ ] Art 2(12): FOSS exclusion (with exceptions)

### Layer 3: Actor Definitions (Article 3)
- [ ] Provider (3(3)) - with sub-conditions
- [ ] Deployer (3(4))
- [ ] Operator (3(8)) - umbrella term
- [ ] Others: importer, distributor, authorized rep, product manufacturer

### Layer 4: Key Temporal/Operational Concepts
- [ ] Placing on market (3(9))
- [ ] Making available on market (3(10))
- [ ] Putting into service (3(11))
- [ ] Intended purpose (3(12))
- [ ] Reasonably foreseeable misuse (3(13))

### Layer 5: Classification Systems
- [ ] High-risk classification (Art 6) - with Annex I, Annex III
- [ ] Prohibited systems (Art 5)
- [ ] Transparency-obligated systems (Art 50-52)
- [ ] General-purpose AI models (separate regime)

## Next Steps
1. Systematically map each layer with full rigor
2. Create reusable JSON nodes for each foundational element
3. Identify all definition interdependencies
4. Rebuild Article 9 mapping with complete threshold chain
5. Develop standard methodology for mapping any provision

## Confidence Assessment
- Current Article 9 mapping: **INCOMPLETE** - missing Layers 0-3
- Requires: Complete foundational mapping before proceeding to other provisions
