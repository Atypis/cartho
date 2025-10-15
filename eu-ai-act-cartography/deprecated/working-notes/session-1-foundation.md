# Session 1: Foundational Mapping

## Article 1 Analysis

### Article 1(1) - Purpose Statement
**Not directly operative** - sets regulatory objectives:
- Improve internal market functioning
- Promote human-centric trustworthy AI
- Protect health, safety, fundamental rights, democracy, rule of law, environment
- Support innovation

**Legal Effect**: Interpretative guidance for entire regulation (purposive interpretation principle)

### Article 1(2) - What the Regulation "Lays Down"

This is the **structural map** of the entire regulation:

**(a)** Harmonised rules for:
- Placing on market
- Putting into service
- Use of AI systems in the Union

**(b)** Prohibitions of certain AI practices [→ Article 5]

**(c)** Specific requirements for high-risk AI systems + obligations for operators [→ Chapter III]

**(d)** Harmonised transparency rules for certain AI systems [→ Articles 50-52]

**(e)** Rules for placing on market of general-purpose AI models [→ Chapter V]

**(f)** Market monitoring, surveillance, governance, enforcement [→ Chapters VI-VIII]

**(g)** Innovation support measures [→ Chapter IX]

### Key Insight
Article 1(2) provides the **categorical structure** - there are distinct regulatory tracks:
1. Prohibited systems (absolute)
2. High-risk systems (heavy regulation)
3. Transparency-obligated systems (lighter touch)
4. General-purpose models (separate regime)
5. General governance/enforcement (applies across tracks)

**Confidence: HIGH** - this is explicit structural mapping

---

## LAYER 1: ARTICLE 2(1) - SCOPE (WHO/WHAT/WHERE)

### Critical Discovery: Multiple Scope Tests

Article 2(1) has **7 different addressee categories** with different scope triggers:

### Article 2(1)(a) - Providers
**Trigger**: Placing on market OR putting into service AI systems OR placing on market GP AI models **in the Union**

**Territorial Nexus**: Activity occurs "in the Union"

**Irrespective of**: Whether provider established/located in Union or third country

**Logical Structure**:
```
IF [provider]
AND [places on market OR puts into service]
AND [AI system OR GP AI model]
AND [in the Union]
THEN Regulation applies
```

**Confidence: HIGH**

**Questions**:
- What if system placed on market outside Union but output used in Union? → See Art 2(1)(c)

### Article 2(1)(b) - Deployers
**Trigger**: Deployers with place of establishment OR located within Union

**Territorial Nexus**: Deployer location/establishment

**Logical Structure**:
```
IF [deployer]
AND [place of establishment OR located in Union]
THEN Regulation applies (to deployment activities)
```

**Confidence: HIGH**

**Note**: Broader than 2(1)(a) - covers deployment regardless of where system was placed on market

### Article 2(1)(c) - Extraterritorial Provision (Output-Based)
**Trigger**: Providers/deployers in third countries WHERE output produced by AI system used in Union

**Critical**: This is the **extraterritorial application** clause

**Logical Structure**:
```
IF [provider OR deployer]
AND [established/located in third country]
AND [output produced by AI system]
AND [output used in Union]
THEN Regulation applies
```

**Confidence: HIGH**

**Flag**: "Output used in Union" requires interpretation:
- Does mere data flow to Union = "used"?
- Must output be materially relied upon by Union-based actor?
- What about web services accessed from Union?

**LLM evaluation needed**: Context-dependent

### Article 2(1)(d) - Importers and Distributors
**Trigger**: Being importer or distributor of AI systems

**Implicit territorial nexus**: Definitions of importer (Art 3(6)) and distributor (Art 3(7)) both specify "in the Union"

**Logical Structure**:
```
IF [importer OR distributor per Art 3(6)/(7)]
AND [AI systems]
THEN Regulation applies
```

**Confidence: HIGH**

### Article 2(1)(e) - Product Manufacturers
**Trigger**: Placing on market or putting into service AI system together with product under own name/trademark

**Logical Structure**:
```
IF [product manufacturer]
AND [places on market OR puts into service]
AND [AI system together with their product]
AND [under own name or trademark]
THEN Regulation applies
```

**Confidence: MEDIUM-HIGH**

**Question**: Does this only apply when product manufacturer = provider? Or additional category?
→ Need to check Art 3 definition interplay

### Article 2(1)(f) - Authorized Representatives
**Trigger**: Being authorized representative of provider not established in Union

**Logical Structure**:
```
IF [authorized representative per Art 3(5)]
AND [of provider not established in Union]
THEN Regulation applies
```

**Confidence: HIGH**

### Article 2(1)(g) - Affected Persons
**Trigger**: Being affected person located in Union

**Critical**: This grants **rights/standing** to persons, not obligations

**Logical Structure**:
```
IF [affected person]
AND [located in Union]
THEN Regulation applies (protection provisions)
```

**Confidence: HIGH**

### Synthesis: Article 2(1) Creates Multiple Parallel Scope Tests

The regulation applies through **any one of 7 pathways** - these are **alternative (OR)** not cumulative.

**Confidence: HIGH**

---

## Critical Realization About Data Structure

My initial JSON structure for Article 9 was insufficient. I need:

1. **Scope nodes** that are composable - Art 2(1) creates 7 alternative scope pathways
2. **Actor-specific threshold chains** - different obligations apply to different actors
3. **Alternative vs. cumulative operators** - must be explicit throughout
4. **Confidence tracking at every node**
5. **Interpretation flags** for LLM evaluation points

Will refine structure as I continue mapping.

---

## Next: Article 2(2)-(12) Exclusions and Special Rules
