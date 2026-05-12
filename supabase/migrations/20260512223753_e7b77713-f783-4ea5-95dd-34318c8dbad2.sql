-- Add kind to differentiate public actions from private calendar events
DO $$ BEGIN
  CREATE TYPE public.action_kind AS ENUM ('action','event');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.actions
  ADD COLUMN IF NOT EXISTS kind public.action_kind NOT NULL DEFAULT 'action';

-- Existing rows scheduled previously stay as 'action' by default.

-- Update public visibility policy to only show actions (not private events)
DROP POLICY IF EXISTS "Published actions viewable by everyone" ON public.actions;
CREATE POLICY "Published actions viewable by everyone"
ON public.actions FOR SELECT
TO public
USING (published = true AND kind = 'action');