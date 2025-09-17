CREATE OR REPLACE FUNCTION public.accept_friend_request (request_sender_id uuid) RETURNS void AS $$
DECLARE
  request_receiver_id uuid := auth.uid();
BEGIN
  -- Security Check: Ensure the user accepting the request is the receiver
  IF NOT EXISTS (
    SELECT 1
    FROM public.friend_requests
    WHERE sender_id = request_sender_id AND receiver_id = request_receiver_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Friend request not found or you are not authorized to accept it.';
  END IF;

  -- Update the friend request status to 'accepted'
  UPDATE public.friend_requests
  SET status = 'accepted'
  WHERE sender_id = request_sender_id AND receiver_id = request_receiver_id;

  -- Insert the new friendship record
  -- It's good practice to insert both sides of the friendship for easier querying
  INSERT INTO public.friendships (user_id_1, user_id_2)
  VALUES (
    LEAST(request_sender_id, request_receiver_id),
    GREATEST(request_sender_id, request_receiver_id)
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = public;
