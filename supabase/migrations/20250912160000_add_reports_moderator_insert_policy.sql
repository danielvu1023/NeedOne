-- Enable RLS on reports table if not already enabled
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'moderator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE POLICY "Allow moderators to insert reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (public.is_moderator());

