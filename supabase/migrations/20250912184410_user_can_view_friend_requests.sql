ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their incoming friend requests"
ON public.friend_requests
FOR SELECT
TO authenticated
USING ( receiver_id = auth.uid() );
