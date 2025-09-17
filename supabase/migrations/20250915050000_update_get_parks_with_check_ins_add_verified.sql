-- Update get_parks_with_check_ins function to include verified field in current_check_ins
-- This adds the verified column to the JSON object returned for each checked-in user

CREATE OR REPLACE FUNCTION "public"."get_parks_with_check_ins"("p_user_id" "uuid")
RETURNS TABLE(
    "id" "uuid",
    "name" "text",
    "location" "text",
    "courts" integer,
    "tags" "jsonb",
    "active_check_in_count" bigint,
    "latest_report_count" integer,
    "latest_check_in_time" timestamp with time zone,
    "latest_report_created_at" timestamp with time zone,
    "currently_checked_in_park_id" "uuid",
    "current_check_ins" json
)
LANGUAGE "plpgsql"
SECURITY DEFINER
AS $$
DECLARE
    -- Variable to hold the ID of the park the user is actively checked into.
    active_check_in_park_id uuid;
BEGIN
    -- Find the single park_id for the user's active check-in.
    -- This will be NULL if the user is not checked in anywhere.
    SELECT park_id INTO active_check_in_park_id
    FROM public.check_ins
    WHERE user_id = p_user_id
      AND check_out_time IS NULL
    LIMIT 1; -- Ensures only one row is returned.

    -- Now, run the main query.
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.location,
        p.courts,
        p.tags,
        (SELECT COUNT(*)
         FROM public.check_ins ci
         WHERE ci.park_id = p.id AND ci.check_out_time IS NULL
        ) AS active_check_in_count,
        COALESCE((SELECT r.report_count
                  FROM public.reports r
                  WHERE r.park_id = p.id
                  ORDER BY r.created_at DESC
                  LIMIT 1), 0) AS latest_report_count,
        (SELECT MAX(ci.check_in_time)
         FROM public.check_ins ci
         WHERE ci.park_id = p.id
        ) AS latest_check_in_time,
        (SELECT r.created_at
         FROM public.reports r
         WHERE r.park_id = p.id
         ORDER BY r.created_at DESC
         LIMIT 1
        ) AS latest_report_created_at,
        active_check_in_park_id AS currently_checked_in_park_id,
        (
            SELECT json_agg(
                json_build_object(
                    'user_id', profile.id,
                    'fullname', profile.name,
                    'profile_pic', profile.image_url,
                    'verified', ci.verified,  -- Add verified field from check_ins table
                    'is_friend', (
                        EXISTS (
                            SELECT 1
                            FROM public.friendships f
                            WHERE (f.user_id_1 = p_user_id AND f.user_id_2 = ci.user_id)
                               OR (f.user_id_2 = p_user_id AND f.user_id_1 = ci.user_id)
                        )
                    ),
                    'has_pending_request', (
                        EXISTS (
                            SELECT 1
                            FROM public.friend_requests fr
                            WHERE
                                fr.status = 'pending' AND
                                (
                                    (fr.sender_id = p_user_id AND fr.receiver_id = ci.user_id) OR
                                    (fr.sender_id = ci.user_id AND fr.receiver_id = p_user_id)
                                )
                        )
                    )
                )
            )
            FROM public.check_ins ci
            JOIN public.profiles profile ON ci.user_id = profile.id
            WHERE ci.park_id = p.id AND ci.check_out_time IS NULL
        ) AS current_check_ins
    FROM
        public.parks p
    JOIN
        public.park_users pu ON p.id = pu.park_id
    WHERE
        pu.user_id = p_user_id;
END;
$$;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION "public"."get_parks_with_check_ins"("p_user_id" "uuid") TO authenticated;