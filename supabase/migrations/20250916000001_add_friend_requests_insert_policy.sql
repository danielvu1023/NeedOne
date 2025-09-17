
DROP POLICY IF EXISTS "Allow users to send friend requests" ON public.friend_requests;
CREATE POLICY "Allow users to send friend requests"
ON public.friend_requests
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND sender_id <> receiver_id
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = receiver_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.friend_requests
    WHERE sender_id = auth.uid()
    AND receiver_id = friend_requests.receiver_id
    AND status = 'pending'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (user_id_1 = auth.uid() AND user_id_2 = friend_requests.receiver_id)
    OR (user_id_1 = friend_requests.receiver_id AND user_id_2 = auth.uid())
  )
);



