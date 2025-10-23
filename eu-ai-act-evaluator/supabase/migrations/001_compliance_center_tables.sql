-- Compliance Center Tables Migration
-- Phase 1 MVP: obligation_instances and obligation_status_history

-- Create obligation_instances table
CREATE TABLE IF NOT EXISTS public.obligation_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id UUID NOT NULL REFERENCES public.use_cases(id) ON DELETE CASCADE,
  pn_id TEXT NOT NULL,
  pn_title TEXT,
  pn_article TEXT,

  -- Applicability (derived from evaluations)
  applicability_state TEXT NOT NULL DEFAULT 'pending' CHECK (applicability_state IN ('pending', 'evaluating', 'applies', 'not_applicable')),
  latest_evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE SET NULL,
  root_decision BOOLEAN,
  evaluated_at TIMESTAMPTZ,

  -- Compliance (human-managed)
  implementation_state TEXT CHECK (implementation_state IN ('not_started', 'in_progress', 'compliant', 'partial', 'non_compliant', 'waived')),
  owner_id UUID,
  due_date TIMESTAMPTZ,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one obligation per (use_case, pn) combination
  UNIQUE(use_case_id, pn_id)
);

-- Create index for common queries
CREATE INDEX idx_obligation_instances_use_case_id ON public.obligation_instances(use_case_id);
CREATE INDEX idx_obligation_instances_pn_id ON public.obligation_instances(pn_id);
CREATE INDEX idx_obligation_instances_applicability_state ON public.obligation_instances(applicability_state);
CREATE INDEX idx_obligation_instances_implementation_state ON public.obligation_instances(implementation_state);
CREATE INDEX idx_obligation_instances_owner_id ON public.obligation_instances(owner_id);
CREATE INDEX idx_obligation_instances_due_date ON public.obligation_instances(due_date);

-- Create obligation_status_history table for audit trail
CREATE TABLE IF NOT EXISTS public.obligation_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obligation_instance_id UUID NOT NULL REFERENCES public.obligation_instances(id) ON DELETE CASCADE,
  changed_by UUID,
  from_state TEXT,
  to_state TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('applicability', 'implementation')),
  reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for history queries
CREATE INDEX idx_obligation_status_history_instance_id ON public.obligation_status_history(obligation_instance_id);
CREATE INDEX idx_obligation_status_history_changed_at ON public.obligation_status_history(changed_at DESC);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_obligation_instances_updated_at
  BEFORE UPDATE ON public.obligation_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment documentation
COMMENT ON TABLE public.obligation_instances IS 'Tracks compliance obligations (PN × Use Case) with applicability and implementation status';
COMMENT ON TABLE public.obligation_status_history IS 'Audit trail for obligation state changes';

COMMENT ON COLUMN public.obligation_instances.applicability_state IS 'Whether this PN applies to the use case (from evaluation)';
COMMENT ON COLUMN public.obligation_instances.implementation_state IS 'Compliance status if applicable (human-managed)';
COMMENT ON COLUMN public.obligation_instances.root_decision IS 'Evaluation root decision: true=applies, false=not applicable, null=pending';
