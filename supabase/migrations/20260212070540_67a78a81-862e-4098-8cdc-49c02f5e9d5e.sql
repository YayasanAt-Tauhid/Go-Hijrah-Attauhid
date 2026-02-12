
-- Create function to increment click count (no auth needed)
CREATE OR REPLACE FUNCTION public.increment_click_count(link_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.links SET click_count = click_count + 1 WHERE id = link_id;
$$;
