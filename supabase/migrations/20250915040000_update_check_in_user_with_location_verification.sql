-- Update check_in_user function to accept coordinates and verify location
-- This replaces the existing function to include location verification

CREATE OR REPLACE FUNCTION public.check_in_user(
  park_id_to_check_in uuid,
  user_longitude float DEFAULT NULL,
  user_latitude float DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  is_verified boolean := false;
BEGIN
  -- Check if the user already has an active check-in at the specified park.
  IF EXISTS (
    SELECT 1
    FROM public.check_ins
    WHERE user_id = auth.uid()
      AND park_id = park_id_to_check_in
      AND check_out_time IS NULL
  ) THEN
    -- If an active check-in exists, raise a custom exception.
    RAISE EXCEPTION 'User is already checked in at this park.' USING ERRCODE = 'P0001';
  ELSE
    -- Check if coordinates were provided and verify location
    IF user_longitude IS NOT NULL AND user_latitude IS NOT NULL THEN
      -- Use the is_user_near_park function to verify proximity
      SELECT public.is_user_near_park(
        park_id_to_check_in,
        user_longitude,
        user_latitude,
        100  -- 100 meter radius
      ) INTO is_verified;
    END IF;

    -- Insert the new check-in record with verification status
    INSERT INTO public.check_ins (user_id, park_id, verified)
    VALUES (auth.uid(), park_id_to_check_in, is_verified);
  END IF;
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_in_user(uuid, float, float) TO authenticated;