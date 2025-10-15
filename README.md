# Legal Cartography: EU AI Act

A comprehensive legal cartography project mapping the EU AI Act's complete logical structure with an intelligent evaluation engine.

## 🎯 Project Vision

Map legislation as **deterministic + probabilistic requirement trees**, then build software that can evaluate whether a real-world case satisfies legal requirements by:
1. **Deterministic nodes**: Rule-based evaluation (HIGH confidence elements)
2. **Interpretative nodes**: LLM-assisted evaluation (LOW/MEDIUM confidence elements)
3. **Full traceability**: Every determination explained with confidence scores
4. **Human oversight**: Lawyers can review and override any LLM determination

## 📁 Project Structure

```
carthography/
├── cartography-framework/          # Methodology documentation
│   └── legal-cartography-v0.1.md
│
├── eu-ai-act-cartography/          # Complete EU AI Act mapping
│   ├── definitions/                # Article 3 definitions + scope
│   │   ├── scope-applicability.json
│   │   ├── scope-exclusions.json
│   │   ├── ai-system-definition.json
│   │   ├── core-actor-definitions.json
│   │   ├── temporal-operational-concepts.json
│   │   ├── technical-data-definitions.json
│   │   ├── biometric-definitions.json
│   │   ├── high-risk-classification.json
│   │   └── remaining-definitions-batch-1.json
│   │
│   ├── consequences/               # Mapped obligations (Wirknormen)
│   │   ├── article-5-prohibited-practices.json
│   │   └── article-9-risk-management-COMPLETE.json
│   │
│   ├── annexes/                    # All annexes
│   │   └── annex-iii-high-risk-use-cases.json
│   │
│   ├── working-notes/              # Session notes and analysis
│   └── PROGRESS.md                 # Detailed progress tracker
│
├── evaluation-engine/              # Evaluation software
│   ├── engine.py                   # Core evaluation logic
│   ├── visualizer.py              # HTML/ASCII visualization
│   ├── interactive_cli.py         # Interactive CLI interface
│   ├── requirements.txt
│   └── README.md
│
└── ai-act-source/                  # Source materials
    └── EU_AI_Act.md
```

## 🗺️ Cartography Methodology

### Core Principles

1. **Layered Threshold Architecture**
   ```
   Layer 0: Scope of Application (Art 1-2)
       ↓
   Layer 1: Material Scope - AI System Definition
       ↓
   Layer 2: Territorial/Personal Scope
       ↓
   Layer 3: Exclusions
       ↓
   Layer 4: Actor Classification (provider, deployer, etc.)
       ↓
   Layer 5: System Classification (high-risk, prohibited, etc.)
       ↓
   Layer 6: Specific Provision Applicability
       ↓
   Substantive Obligation
   ```

2. **Deterministic vs. Probabilistic**
   - **Deterministic**: Clear rule-based requirements (e.g., "system is placed on market")
   - **Probabilistic**: Interpretative concepts requiring judgment (e.g., "significant risk", "reasonably foreseeable")

3. **Confidence Tracking**
   - Every node has explicit confidence rating (HIGH/MEDIUM/LOW)
   - LOW confidence nodes flagged for LLM evaluation
   - Interpretative challenges documented

4. **Shared Nodes**
   - Reusable components (scope, definitions, classifications)
   - Referenced across multiple provisions
   - Single source of truth

### JSON Structure

Example structure for a legal requirement:

```json
{
  "provision": "Article 9",
  "title": "Risk management system",
  "wirknorm": {
    "legal_consequence": "Obligation to establish risk management system",
    "confidence": "HIGH"
  },
  "threshold_requirements": {
    "operator": "AND",
    "layers": [
      {"requirement": "Scope applies", "reference": "scope.json"},
      {"requirement": "System is high-risk", "reference": "high-risk.json"},
      {"requirement": "Actor is provider", "confidence": "HIGH"}
    ]
  },
  "substantive_obligations": {
    "requirements": [
      {
        "text": "Identify reasonably foreseeable risks",
        "confidence": "MEDIUM",
        "flag": "LOW_CONFIDENCE: 'reasonably foreseeable' requires interpretation",
        "llm_evaluation_needed": true
      }
    ]
  }
}
```

## 🤖 Evaluation Engine

### Quick Start

```bash
cd evaluation-engine
python interactive_cli.py
```

### Features

1. **Interactive Case Creation**: Describe your AI system
2. **High-Risk Classification**: Automatic evaluation against Article 6 + Annex III
3. **Compliance Assessment**: Check specific requirements (e.g., Article 9)
4. **LLM Integration**: Interpretative elements evaluated by LLM with reasoning
5. **Visual Results**: HTML decision trees + confidence scores
6. **Human Review**: Override any LLM determination

### Example Evaluation Flow

```python
from engine import EvaluationEngine

engine = EvaluationEngine()

case = {
    "system_description": "AI-powered CV screening for hiring",
    "provider_info": {"name": "TechCorp", "location": "Germany"},
    "deployment_context": {"sector": "employment"}
}

result = engine.evaluate("high-risk-classification", case)

# Result:
# {
#   "result": True,  # IS high-risk
#   "confidence": 0.95,
#   "decision_tree": {...},
#   "llm_evaluations": [
#     {
#       "description": "Assess if system materially influences hiring decisions",
#       "result": True,
#       "confidence": 0.85,
#       "reasoning": "System filters 80% of candidates automatically..."
#     }
#   ]
# }
```

## 📊 Mapping Status

### ✅ Completed
- **Article 1-2**: Complete scope architecture (7 pathways, 12 exclusions)
- **Article 3**: All 68 definitions with interdependencies
- **Article 5**: All 8 prohibited practices (despite source text issues)
- **Article 6-7**: Complete high-risk classification logic
- **Annex III**: All 25 high-risk use cases across 8 areas
- **Article 9**: Risk management requirements with full threshold chain
- **Evaluation Engine**: Core logic, visualization, CLI interface

### 🚧 Partial / Pending
- **Article 8, 10-15**: High-risk requirements (partial mapping)
- **Article 16-29**: Provider/deployer obligations
- **Article 50-52**: Transparency obligations
- **Chapter V**: General-purpose AI provisions
- **Chapters VI-VIII**: Governance and enforcement
- **Annexes I, II, IV-XII**: Various technical annexes
- **LLM Integration**: Placeholder (needs API integration)
- **Web Interface**: Pending

## 🎓 Key Insights

### Discovered Through Rigorous Mapping

1. **Threshold Chains Are Deep**: Article 9 obligation requires passing through 5+ layers before even reaching substantive requirements

2. **Interpretative Density**: ~40% of key concepts require contextual LLM evaluation:
   - "Significant risk"
   - "Materially influencing"
   - "Reasonably foreseeable misuse"
   - "Acceptable residual risk"

3. **Profiling Exception**: If system profiles → always high-risk, no opt-out (Art 6(3) second subparagraph)

4. **Provider Defines Purpose**: "Intended purpose" is provider-defined (Art 3(12)), cascades through entire Act

5. **Dynamic Annexes**: Annex III can be amended by Commission (Art 7) - not static list

6. **Real-time Biometric = Most Restricted**: Article 5(1)(h) has most complex procedural safeguards

### Confidence Patterns

- **Scope/Definitions**: Generally HIGH confidence (90%+)
- **Classification Boundaries**: MEDIUM confidence (60-80%)
- **Risk Thresholds**: LOW confidence (40-60%) - require case-by-case evaluation
- **Interpretative Concepts**: LOW confidence - LLM essential

## 🔮 Future Enhancements

### Short Term
1. Complete mapping of remaining provisions
2. Integrate actual LLM API (Anthropic Claude, OpenAI)
3. Build web interface with interactive visualizations
4. Add export to PDF legal reports

### Medium Term
1. Multi-provision compliance checking
2. Gap analysis (what's missing for compliance)
3. Recommendation engine (suggested actions)
4. Comparative analysis across jurisdictions

### Long Term
1. Real-time regulatory updates
2. Case law integration
3. Regulatory sandboxing simulation
4. Automated documentation generation

## 📚 Methodology References

### Legal Cartography v0.1
- **Wirknorm**: Legal consequence with real-world effect
- **Rechtskernsatz**: Deterministic core set of requirements
- **Threshold chain**: Cumulative prerequisites for obligation
- **Operator types**: AND (cumulative), OR (alternative), AND_NOT (exclusions)

### German Legal Methodology
- **Tatbestand**: Operative facts triggering legal consequence
- **Rechtsfolge**: Legal effect/consequence
- **Auslegung**: Interpretation of ambiguous terms
- **Subsumtion**: Application of law to facts

## 🤝 Contributing

This is currently a solo research project demonstrating the legal cartography concept. Future collaboration welcome.

## 📄 License

[To be determined]

## 📧 Contact

[Your contact information]

---

**Status**: Active development
**Version**: 0.1.0 (Proof of Concept)
**Last Updated**: 2025-10-08
