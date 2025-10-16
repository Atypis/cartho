# EU AI Act Evaluator - MVP

An interactive tool for evaluating compliance with the EU AI Act using AI-powered legal reasoning.

## Features

✅ **Prescriptive Norm Evaluation** - Currently supports PN-04 (AI Literacy Duty)
✅ **Interactive Requirement Tree** - Visual representation of all legal requirements
✅ **GPT-5 Powered Analysis** - Uses GPT-5 with high reasoning for legal interpretation
✅ **Live Evaluation Feedback** - Real-time status updates as requirements are evaluated
✅ **Detailed Reasoning** - Click on any node to see the AI's reasoning and confidence score

## Quick Start

```bash
# Install dependencies
npm install

# Add your OpenAI API key to .env.local
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Select a Prescriptive Norm** (currently PN-04)
2. **Enter case facts** describing the AI system and context
3. **Watch the evaluation** as GPT-5 analyzes each requirement
4. **View results** - click nodes for detailed reasoning

## Architecture

- **Next.js 15** + TypeScript + Tailwind CSS
- **React Flow** for tree visualization
- **OpenAI GPT-5** (high reasoning mode)
- **Evaluation Engine** - traverses requirement trees

See full documentation in README for details.
