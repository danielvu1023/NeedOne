ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their friendships"
ON public.friendships
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id_1) OR (auth.uid() = user_id_2)
);