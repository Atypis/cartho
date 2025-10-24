-- Create waitlist table for landing page beta signups
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE
);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Add index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for the signup form)
CREATE POLICY "Allow anonymous inserts" ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to read all entries
CREATE POLICY "Allow authenticated users to read" ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Add comment
COMMENT ON TABLE public.waitlist IS 'Stores email signups from the landing page for private beta access';
