/**
 * Use Case Analysis API Route
 *
 * Analyzes user-provided use case descriptions and identifies
 * what information is complete, missing, or needs clarification
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import type { UseCaseAnalysis } from '@/lib/usecase/types';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { title, description } = await req.json();

  const prompt = `You are an expert legal assistant helping evaluate AI systems under the EU AI Act.

Analyze the following use case description and extract structured information.

Use Case Title: ${title}

Description:
${description}

Your task is to:
1. Extract available information across 5 key areas
2. Determine the completeness status of each area
3. Generate specific clarification questions for incomplete areas

The 5 key areas are:
1. **System Purpose**: What does the AI system do? What is its intended use?
2. **Technical Details**: What AI techniques, models, or algorithms are used? What data is processed?
3. **Use Context**: Who uses the system? In what sector/domain? For what specific purpose?
4. **User Role**: Is the person developing, deploying, importing, distributing, or using the system?
5. **Geographic Scope**: Where will the system be used? (countries, regions)

For each area, determine the status:
- **complete**: Clear, sufficient information provided (no further questions needed)
- **needs_clarification**: Some information exists but is vague, incomplete, or ambiguous
- **missing**: No information provided at all

IMPORTANT GUIDELINES:
- Never use legal terminology when asking questions (avoid terms like "provider", "deployer", "high-risk")
- Ask questions a non-lawyer can understand
- Be specific in your questions - don't ask vague questions like "tell me more about X"
- If multiple aspects are unclear, focus on the most important gaps first
- Don't ask more than 5 clarification questions total
- Only generate questions for areas that are "needs_clarification" or "missing"

Return your analysis in this EXACT JSON format:
{
  "completeness": <number 0-100, overall completeness score>,
  "extractedInfo": {
    "systemPurpose": "<what was extracted, or null if missing>",
    "technicalDetails": "<what was extracted, or null if missing>",
    "useContext": "<what was extracted, or null if missing>",
    "userRole": "<what was extracted, or null if missing>",
    "geographicScope": "<what was extracted, or null if missing>"
  },
  "coverageAreas": [
    {
      "id": "system_purpose",
      "label": "System Purpose",
      "status": "complete" | "needs_clarification" | "missing",
      "extractedValue": "<what was found, or null>"
    },
    {
      "id": "technical_details",
      "label": "Technical Details",
      "status": "complete" | "needs_clarification" | "missing",
      "extractedValue": "<what was found, or null>"
    },
    {
      "id": "use_context",
      "label": "Use Context",
      "status": "complete" | "needs_clarification" | "missing",
      "extractedValue": "<what was found, or null>"
    },
    {
      "id": "user_role",
      "label": "Your Role",
      "status": "complete" | "needs_clarification" | "missing",
      "extractedValue": "<what was found, or null>"
    },
    {
      "id": "geographic_scope",
      "label": "Geographic Scope",
      "status": "complete" | "needs_clarification" | "missing",
      "extractedValue": "<what was found, or null>"
    }
  ],
  "clarificationQuestions": [
    {
      "id": "q1",
      "area": "technical_details",
      "question": "<specific, clear question in plain language>",
      "context": "<optional: why you're asking, to help the user understand>",
      "status": "needs_clarification" | "missing"
    }
  ],
  "isComplete": <true if completeness >= 70 and no critical gaps, false otherwise>
}

Critical areas (must have at least some info for isComplete=true):
- System Purpose
- Technical Details
- Use Context

Return ONLY valid JSON, no other text.`;

  try {
    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt,
      maxTokens: 2000,
    });

    // Parse the JSON response
    const analysis: UseCaseAnalysis = JSON.parse(text);

    return Response.json(analysis);
  } catch (error) {
    console.error('Error analyzing use case:', error);
    return Response.json(
      { error: 'Failed to analyze use case' },
      { status: 500 }
    );
  }
}
