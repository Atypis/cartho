# Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Option 1: Interactive CLI

```bash
cd evaluation-engine
python3 interactive_cli.py
```

Then follow the prompts:
1. Create a new case (describe your AI system)
2. Evaluate high-risk classification
3. View results with confidence scores
4. Export HTML visualization

### Option 2: Python Script

```python
from evaluation_engine.engine import EvaluationEngine

# Create engine
engine = EvaluationEngine()

# Define your case
case = {
    "system_description": "AI-powered resume screening tool that automatically filters job applications based on candidate qualifications",
    "provider_info": {
        "name": "TechCorp GmbH",
        "location": "Germany"
    },
    "deployment_context": {
        "sector": "employment",
        "scope": "EU-wide"
    }
}

# Evaluate
result = engine.evaluate("high-risk-classification", case)

# Check result
print(f"High-risk: {result['result']}")
print(f"Confidence: {result['confidence']:.0%}")
```

### Option 3: Explore the Cartography

Navigate to `eu-ai-act-cartography/` and explore the JSON files:

**Start with these:**
1. `definitions/scope-applicability.json` - When does the Act apply?
2. `definitions/high-risk-classification.json` - What makes a system high-risk?
3. `annexes/annex-iii-high-risk-use-cases.json` - All 25 high-risk use cases
4. `consequences/article-9-risk-management-COMPLETE.json` - Complete obligation example

## 📊 Example Evaluation

### Input
```json
{
  "system_description": "CV screening AI for hiring",
  "provider": "TechCorp",
  "sector": "employment"
}
```

### Output
```
═══════════════════════════════════════════════════════════
  HIGH-RISK CLASSIFICATION RESULT
═══════════════════════════════════════════════════════════

Result: HIGH-RISK ⚠️
Confidence: 87%

Decision Path:
✓ EU AI Act Scope Applies (95%)
  ✓ Provider in EU → Article 2(1)(a) pathway
  ✓ No exclusions apply

✓ System is AI System (90%)
  ✓ Machine-based
  ✓ Operates with autonomy
  ✓ Generates outputs (filtering decisions)

✓ High-Risk per Article 6(2) - Annex III (85%)
  ✓ Matches Area 4(a): Recruitment/selection
    "AI systems intended to be used for recruitment or
     selection of natural persons, in particular to analyse
     and filter job applications"

  ? Article 6(3) opt-out available? [LLM EVALUATION]
    ✗ Not narrow procedural task (75% confidence)
    → "System materially influences hiring by filtering
       80% of applicants before human review"

✓ Actor is Provider (95%)
  ✓ TechCorp develops and places system on market

═══════════════════════════════════════════════════════════
CONCLUSION: System IS HIGH-RISK
All Chapter III Section 2 requirements apply (Articles 8-15)
═══════════════════════════════════════════════════════════
```

## 🗺️ Understanding the Cartography

### File Structure Logic

```
definitions/
├── scope-applicability.json          # Layer 0: Does Act apply?
├── scope-exclusions.json             # Layer 0: Any exclusions?
├── ai-system-definition.json         # Layer 1: Is it AI?
├── core-actor-definitions.json       # Layer 3: Who is responsible?
├── high-risk-classification.json     # Layer 2: Classification logic
└── ...

consequences/
├── article-5-prohibited-practices.json   # What's banned?
├── article-9-risk-management-COMPLETE.json  # What must providers do?
└── ...

annexes/
└── annex-iii-high-risk-use-cases.json    # 25 specific high-risk scenarios
```

### JSON Node Types

```json
{
  "deterministic_node": {
    "confidence": "HIGH",
    "evaluation": "rule-based",
    "example": "System is placed on market in EU"
  },

  "interpretative_node": {
    "confidence": "LOW",
    "evaluation": "LLM-assisted",
    "flag": "LOW_CONFIDENCE: requires context",
    "llm_evaluation_needed": true,
    "example": "System poses 'significant risk'"
  }
}
```

## 🔍 Common Questions

### "Is my AI system high-risk?"

**Step 1:** Check Article 2 scope
- Are you a provider in/selling to EU?
- Any exclusions apply? (military, pure R&D, FOSS, personal use)

**Step 2:** Check Article 6 pathways
- **Pathway 6(1):** Safety component + Annex I product? → HIGH-RISK
- **Pathway 6(2):** Matches Annex III use case? → Presumptively HIGH-RISK
  - But Article 6(3) opt-out possible if:
    - Narrow procedural task, OR
    - Improves past human work, OR
    - Just pattern detection, OR
    - Preparatory task only
  - **EXCEPTION:** If profiles people → ALWAYS high-risk

**Use the engine to evaluate automatically!**

### "What obligations apply to high-risk systems?"

**If high-risk per Article 6:**
- ✅ Article 8: General compliance
- ✅ Article 9: Risk management system
- ✅ Article 10: Data governance
- ✅ Article 11: Technical documentation
- ✅ Article 12: Record-keeping
- ✅ Article 13: Transparency to deployers
- ✅ Article 14: Human oversight
- ✅ Article 15: Accuracy, robustness, cybersecurity
- ✅ Articles 16-27: Provider obligations
- ✅ Article 72: Post-market monitoring

### "How confident should I be in these evaluations?"

**HIGH confidence (>90%):**
- Scope determinations
- Clear definitional matches
- Temporal triggers
- Actor classifications

**MEDIUM confidence (60-90%):**
- Classification boundaries
- Purpose assessments
- Technical feasibility judgments

**LOW confidence (<60%):**
- "Significant risk" thresholds
- "Materially influencing" assessments
- "Reasonably foreseeable" predictions
- "Acceptable" risk levels

**Recommendation:** For LOW confidence determinations, seek legal counsel or use LLM evaluation with expert review.

## 📁 Project Files Explained

### Core Cartography
- `definitions/` - Foundational concepts (68 definitions from Article 3)
- `consequences/` - Actual obligations (Wirknormen)
- `annexes/` - Lists and technical requirements
- `working-notes/` - Analysis and methodology notes

### Evaluation Engine
- `engine.py` - Core logic (load cartography, evaluate cases)
- `visualizer.py` - Generate HTML/ASCII visualizations
- `interactive_cli.py` - User interface
- `requirements.txt` - Dependencies (minimal for now)

### Documentation
- `README.md` - Complete project overview
- `QUICKSTART.md` - This file
- `EXECUTIVE_SUMMARY.md` - High-level summary
- `PROGRESS.md` - Detailed mapping status

## 🎯 Next Steps

1. **Try the CLI**: `python3 interactive_cli.py`
2. **Test your own system**: Describe your AI and get evaluation
3. **Explore the cartography**: Open JSON files, trace requirement trees
4. **Read methodology**: `cartography-framework/legal-cartography-v0.1.md`
5. **Check progress**: `eu-ai-act-cartography/PROGRESS.md`

## 💡 Tips

- **Start with high-risk classification** - most critical determination
- **Review LLM evaluations carefully** - they're interpretative, not definitive
- **Export HTML visualizations** - great for documentation
- **Use ASCII trees in CLI** - quick overview of decision path
- **Read working notes** - insights from rigorous legal analysis

## 🐛 Known Limitations (Current Version)

1. **LLM integration is placeholder** - needs API key + implementation
2. **Limited provisions mapped** - focus was foundational architecture
3. **No web interface yet** - CLI only
4. **Simplified evaluation logic** - full implementation more sophisticated
5. **Source text issues** - Article 5(1)(c) and (h) partially missing from MD

## 🚀 Coming Soon

- Real LLM integration (Anthropic Claude)
- Web interface with interactive visualizations
- Complete Article 8-15 mapping
- PDF report generation
- Compliance gap analysis
- Multi-provision evaluation

---

**Questions?** Check [README.md](README.md) or [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)

**Ready to dive deep?** Explore `eu-ai-act-cartography/` JSON files directly
