-- Drop the old function that requires multiple parameters
DROP FUNCTION IF EXISTS "public"."accept_friend_request"("request_sender_id" "uuid", "request_receiver_id" "uuid", "friend_user_1" "uuid", "friend_user_2" "uuid");

-- Keep the new secure function (already created in previous migration)
-- This function only needs sender_id and gets receiver from auth.uid()

-- Create decline_friend_request function
CREATE OR REPLACE FUNCTION public.decline_friend_request (request_sender_id uuid) 
RETURNS void AS $$
DECLARE
  request_receiver_id uuid := auth.uid();
BEGIN
  -- Security Check: Ensure the user declining the request is the receiver
  IF NOT EXISTS (
    SELECT 1
    FROM public.friend_requests
    WHERE sender_id = request_sender_id AND receiver_id = request_receiver_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Friend request not found or you are not authorized to decline it.';
  END IF;

  -- Update the friend request status to 'declined'
  UPDATE public.friend_requests
  SET status = 'declined'
  WHERE sender_id = request_sender_id AND receiver_id = request_receiver_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

ALTER FUNCTION "public"."decline_friend_request"("request_sender_id" "uuid") OWNER TO "postgres";