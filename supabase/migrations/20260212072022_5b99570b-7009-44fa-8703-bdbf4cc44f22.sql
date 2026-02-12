
-- Table for tracking individual clicks with timestamps
CREATE TABLE public.click_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.click_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (for redirect tracking)
CREATE POLICY "Anyone can insert click_logs"
ON public.click_logs
FOR INSERT
WITH CHECK (true);

-- Link owners can view their click logs
CREATE POLICY "Users can view own click_logs"
ON public.click_logs
FOR SELECT
USING (
  link_id IN (SELECT id FROM public.links WHERE user_id = auth.uid())
);

-- Add UPDATE policy on links table for editing
CREATE POLICY "Users can update own links"
ON public.links
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update increment_click_count to also insert into click_logs
CREATE OR REPLACE FUNCTION public.increment_click_count(link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.links SET click_count = click_count + 1 WHERE id = link_id;
  INSERT INTO public.click_logs (link_id) VALUES (link_id);
END;
$$;
