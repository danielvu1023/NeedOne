-- Recreate get_friends_with_status function with SECURITY DEFINER
DROP FUNCTION IF EXISTS "public"."get_friends_with_status"("p_user_id" "uuid");

CREATE OR REPLACE FUNCTION "public"."get_friends_with_status"("p_user_id" "uuid") 
RETURNS TABLE(
    "friend_id" "uuid", 
    "friend_name" "text", 
    "friend_image_url" "text", 
    "is_checked_in" boolean, 
    "checked_in_park_name" "text"
)
LANGUAGE "sql" 
STABLE
SECURITY DEFINER
AS $$
    WITH user_friends AS (
      -- This CTE gets all friend IDs for the provided user ID
      SELECT user_id_2 AS friend_id
      FROM public.friendships
      WHERE user_id_1 = p_user_id

      UNION ALL

      SELECT user_id_1 AS friend_id
      FROM public.friendships
      WHERE user_id_2 = p_user_id
    )
    SELECT
        p.id AS friend_id,
        p.name AS friend_name,
        p.image_url AS friend_image_url,
        -- A more concise way to write the boolean case
        (ci.id IS NOT NULL) AS is_checked_in,
        pk.name AS checked_in_park_name
    FROM
        user_friends uf
    -- Join to get the friend's profile information
    JOIN
        public.profiles p ON uf.friend_id = p.id
    -- Left join to find an *active* check-in for the friend
    LEFT JOIN
        public.check_ins ci ON uf.friend_id = ci.user_id AND ci.check_out_time IS NULL
    -- Left join to get the park name if they are checked in
    LEFT JOIN
        public.parks pk ON ci.park_id = pk.id;
$$;

ALTER FUNCTION "public"."get_friends_with_status"("p_user_id" "uuid") OWNER TO "postgres";