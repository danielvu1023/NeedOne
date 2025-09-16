-- Create remove_friend RPC function
CREATE OR REPLACE FUNCTION public.remove_friend (friend_user_id uuid) 
RETURNS void AS $$
DECLARE
  current_user_id uuid := auth.uid();
  lower_user_id uuid;
  higher_user_id uuid;
BEGIN
  -- Security Check: Ensure the user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to remove friends.';
  END IF;

  -- Prevent self-removal
  IF current_user_id = friend_user_id THEN
    RAISE EXCEPTION 'You cannot remove yourself as a friend.';
  END IF;

  -- Order user IDs consistently (smaller ID first)
  SELECT LEAST(current_user_id, friend_user_id), GREATEST(current_user_id, friend_user_id)
  INTO lower_user_id, higher_user_id;

  -- Check if friendship exists
  IF NOT EXISTS (
    SELECT 1
    FROM public.friendships
    WHERE user_id_1 = lower_user_id AND user_id_2 = higher_user_id
  ) THEN
    RAISE EXCEPTION 'No friendship exists between these users.';
  END IF;

  -- Remove the friendship record
  DELETE FROM public.friendships
  WHERE user_id_1 = lower_user_id AND user_id_2 = higher_user_id;

  -- TODO: May need to update this if decide to soft delete
  DELETE FROM public.friend_requests
  WHERE (sender_id = current_user_id AND receiver_id = friend_user_id)
     OR (sender_id = friend_user_id AND receiver_id = current_user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

ALTER FUNCTION "public"."remove_friend"("friend_user_id" "uuid") OWNER TO "postgres";


