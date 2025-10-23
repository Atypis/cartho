-- Shared Requirement Assessments Cache
-- Persisted, per-use-case cache for shared requirement evaluations

CREATE TABLE IF NOT EXISTS public.shared_requirement_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id UUID NOT NULL REFERENCES public.use_cases(id) ON DELETE CASCADE,
  shared_key TEXT NOT NULL,
  decision BOOLEAN NOT NULL,
  confidence NUMERIC NOT NULL,
  reasoning TEXT NOT NULL,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE SET NULL,
  pn_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(use_case_id, shared_key)
);

CREATE INDEX IF NOT EXISTS idx_shared_req_cache_use_case_id ON public.shared_requirement_assessments(use_case_id);
CREATE INDEX IF NOT EXISTS idx_shared_req_cache_shared_key ON public.shared_requirement_assessments(shared_key);

-- Auto-update updated_at on modification
CREATE TRIGGER update_shared_req_cache_updated_at
  BEFORE UPDATE ON public.shared_requirement_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.shared_requirement_assessments IS 'Per-use-case cache of shared requirement assessment results.';
COMMENT ON COLUMN public.shared_requirement_assessments.shared_key IS 'Key format: <shared_primitive_id>::<shared_node_id>';
COMMENT ON COLUMN public.shared_requirement_assessments.pn_id IS 'Optional: PN that triggered this assessment (for observability).';

