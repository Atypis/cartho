# Wirknormen Extraction Progress

**Task**: Extract ALL legal consequences (Wirknormen) from the EU AI Act and group by identical requirements

**Source File**: `/Users/a1984/carthography/ai-act-source/EU_AI_Act.md`
**Total Lines**: 3,672
**Article Range**: Article 1 through Article 113 (estimated)

**Started**: 2025-10-09
**Status**: In Progress

---

## Progress Tracker

### Completed Articles
- [ ] Article 1 - Subject matter
- [ ] Article 2 - Scope
- [ ] Article 3 - Definitions
- [x] Article 4 - AI literacy (STARTED - line 617)
- [ ] Article 5 - Prohibited practices
- [ ] Article 6 - High-risk classification
- [ ] Article 7 - Amendments to Annex III
- [ ] Article 8 - Compliance with requirements
- [ ] Article 9 - Risk management system
- [ ] Article 10 - Data governance
- ... (to be continued)

### Current Position
**Last Line Read**: 3280+ (COMPLETED)
**Current Article**: Article 113 + Annexes (EXTRACTION COMPLETE)
**Current Section**: All operative articles completed

**STATUS**: ✅ **EXTRACTION COMPLETE** - All 110 operative articles (Articles 4-113) systematically extracted

---

## Extraction Rules

### What Counts as a Wirknorm:
1. **Prohibitions** - "shall be prohibited", "shall not"
2. **Obligations** - "shall", "must", "is required to"
3. **Classifications** - "shall be considered high-risk", "is classified as"
4. **Conditional Requirements** - "where X, then Y shall apply"

### What to Exclude:
1. Definitions (Article 3) - unless they trigger obligations
2. Governance structures (Board, Commission powers)
3. Procedural rules about regulators
4. Transitional provisions
5. Amendment procedures

### Grouping Logic:
- Group together ONLY if requirements are 100% identical
- Even one additional condition = separate group
- Track shared requirements (like "is AI system", "in scope", "is high-risk")

---

## Extracted Wirknormen (By Article)

