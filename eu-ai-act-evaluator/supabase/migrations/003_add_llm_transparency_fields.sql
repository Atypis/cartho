-- Migration: Add LLM Transparency Fields
-- Adds full prompt and raw LLM response to evaluation_results for deep transparency

ALTER TABLE evaluation_results
ADD COLUMN IF NOT EXISTS prompt TEXT,
ADD COLUMN IF NOT EXISTS llm_raw_response JSONB;

-- Add indexes for potential querying
CREATE INDEX IF NOT EXISTS idx_evaluation_results_prompt ON evaluation_results USING gin(to_tsvector('english', prompt));

-- Add comments for documentation
COMMENT ON COLUMN evaluation_results.prompt IS 'Full prompt sent to the LLM for this evaluation';
COMMENT ON COLUMN evaluation_results.llm_raw_response IS 'Raw JSON response from the LLM before parsing';
