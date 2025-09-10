


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";








ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_permission" AS ENUM (
    'reports.insert'
);


ALTER TYPE "public"."app_permission" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'moderator'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."push_subscription_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."push_subscription_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_friend_request"("request_sender_id" "uuid", "request_receiver_id" "uuid", "friend_user_1" "uuid", "friend_user_2" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update the friend request status to 'accepted'
  UPDATE public.friend_requests
  SET status = 'accepted'
  WHERE sender_id = request_sender_id AND receiver_id = request_receiver_id;

  -- Insert the new friendship record
  INSERT INTO public.friendships (user_id_1, user_id_2)
  VALUES (friend_user_1, friend_user_2);
END;
$$;


ALTER FUNCTION "public"."accept_friend_request"("request_sender_id" "uuid", "request_receiver_id" "uuid", "friend_user_1" "uuid", "friend_user_2" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."authorize"("requested_permission" "public"."app_permission") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  bind_permissions int;
  user_role public.app_role;
begin
  -- Fetch user role once and store it to reduce number of calls
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;
  select count(*)
  into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = user_role;
  return bind_permissions > 0;
end;
$$;


ALTER FUNCTION "public"."authorize"("requested_permission" "public"."app_permission") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_checkout_stale_users"() RETURNS "void"
    LANGUAGE "sql"
    AS $$UPDATE public.check_in
  SET check_out_time = now()
  WHERE
    check_out_time IS NULL
    AND check_in_time < now() - interval '2 hours';$$;


ALTER FUNCTION "public"."auto_checkout_stale_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_in_user"("park_id_to_check_in" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
    -- If no active check-in is found, insert the new check-in record.
    INSERT INTO public.check_ins (user_id, park_id)
    VALUES (auth.uid(), park_id_to_check_in);
  END IF;
END;
$$;


ALTER FUNCTION "public"."check_in_user"("park_id_to_check_in" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
  declare
    claims jsonb;
    user_role public.app_role;
  begin
    -- Fetch the user role in the user_roles table
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;
    claims := event->'claims';
    if user_role is not null then
      -- Set the claim
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', 'null');
    end if;
    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);
    -- Return the modified or original event
    return event;
  end;
$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_friends_with_status"("p_user_id" "uuid") RETURNS TABLE("friend_id" "uuid", "friend_name" "text", "friend_image_url" "text", "is_checked_in" boolean, "checked_in_park_name" "text")
    LANGUAGE "sql" STABLE
    AS $$
    WITH user_friends AS (
      -- This CTE gets all friend IDs for the provided user ID
      SELECT user_id_2 AS friend_id
      FROM friendships
      WHERE user_id_1 = p_user_id

      UNION ALL

      SELECT user_id_1 AS friend_id
      FROM friendships
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
        profiles p ON uf.friend_id = p.id
    -- Left join to find an *active* check-in for the friend
    LEFT JOIN
        check_ins ci ON uf.friend_id = ci.user_id AND ci.check_out_time IS NULL
    -- Left join to get the park name if they are checked in
    LEFT JOIN
        parks pk ON ci.park_id = pk.id;
$$;


ALTER FUNCTION "public"."get_friends_with_status"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_parks_with_check_ins"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "location" "text", "courts" integer, "tags" "jsonb", "active_check_in_count" bigint, "latest_report_count" integer, "latest_check_in_time" timestamp with time zone, "latest_report_created_at" timestamp with time zone, "currently_checked_in_park_id" "uuid", "current_check_ins" json)
    LANGUAGE "plpgsql"
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
                    'is_friend', (
                        EXISTS (
                            SELECT 1
                            FROM public.friendships f
                            WHERE (f.user_id_1 = p_user_id AND f.user_id_2 = ci.user_id)
                               OR (f.user_id_2 = p_user_id AND f.user_id_1 = ci.user_id)
                        )
                    ),
                    -- ### NEW FIELD ADDED BELOW ###
                    'has_pending_request', (
                        EXISTS (
                            SELECT 1
                            FROM public.friend_requests fr
                            WHERE
                                fr.status = 'pending' AND -- Check that the request is currently pending
                                (
                                    -- Check for a request in either direction
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


ALTER FUNCTION "public"."get_parks_with_check_ins"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_park_details"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "location" "text", "courts" integer, "tags" "jsonb", "active_check_in_count" bigint, "latest_report_count" integer, "latest_check_in_time" timestamp with time zone, "latest_report_created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.location,
        p.courts,
        p.tags,

        -- Subquery for active check-ins (from before)
        (SELECT COUNT(*)
         FROM public.check_ins ci
         WHERE ci.park_id = p.id AND ci.check_out_time IS NULL
        ) AS active_check_in_count,

        -- Subquery to get the latest report count (from before)
        COALESCE((SELECT r.report_count
                  FROM public.reports r
                  WHERE r.park_id = p.id
                  ORDER BY r.created_at DESC
                  LIMIT 1), 0) AS latest_report_count,

        -- NEW: Subquery to get the latest check-in time for this park
        (SELECT MAX(ci.check_in_time)
         FROM public.check_ins ci
         WHERE ci.park_id = p.id
        ) AS latest_check_in_time,

        -- NEW: Subquery to get the 'created_at' timestamp from the latest report
        (SELECT r.created_at
         FROM public.reports r
         WHERE r.park_id = p.id
         ORDER BY r.created_at DESC
         LIMIT 1
        ) AS latest_report_created_at
    FROM
        public.parks p
    JOIN
        public.park_users pu ON p.id = pu.park_id
    WHERE
        pu.user_id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."get_user_park_details"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_parks_with_details"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "location" "text", "courts" integer, "tags" "jsonb", "active_check_in_count" bigint, "latest_report_count" integer, "latest_check_in_time" timestamp with time zone, "latest_report_created_at" timestamp with time zone, "currently_checked_in_park_id" "uuid")
    LANGUAGE "plpgsql"
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

        -- All previous subqueries remain the same...
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

        -- NEW: Return the stored variable directly.
        -- This will be the same value for every row returned.
        active_check_in_park_id AS currently_checked_in_park_id
    FROM
        public.parks p
    JOIN
        public.park_users pu ON p.id = pu.park_id
    WHERE
        pu.user_id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."get_user_parks_with_details"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_friend_request_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  perform realtime.broadcast_changes(
     'friend_requests:' || NEW.receiver_id, -- topic - the topic to which we're broadcasting
    TG_OP,                                             -- event - the event that triggered the function
    TG_OP,                                             -- operation - the operation that triggered the function
    TG_TABLE_NAME,                                     -- table - the table that caused the trigger
    TG_TABLE_SCHEMA,                                   -- schema - the schema of the table that caused the trigger
    NEW,                                               -- new record - the record after the change
    OLD                                                -- old record - the record before the change
  );
  return null;
end;
$$;


ALTER FUNCTION "public"."handle_friend_request_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.Profile (id, name, image_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_friends_of_check_in"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  -- This variable will hold the ID of the friend we need to notify.
  friend_to_notify_id uuid;
  -- This is the unique channel name for the friend.
  friend_channel_name text;
  -- This is the lightweight JSON message we will send.
  payload jsonb;
BEGIN
  FOR friend_to_notify_id IN
    -- Find friends where the user who checked in is user_id_1
    SELECT user_id_2 FROM public.friendships WHERE user_id_1 = NEW.user_id
    UNION
    -- Also find friends where the user who checked in is user_id_2
    SELECT user_id_1 FROM public.friendships WHERE user_id_2 = NEW.user_id
  LOOP
    friend_channel_name := 'user_friends:' || friend_to_notify_id;

 
     perform realtime.broadcast_changes(
    friend_channel_name, -- topic - the topic to which we're broadcasting
    TG_OP,                                             -- event - the event that triggered the function
    TG_OP,                                             -- operation - the operation that triggered the function
    TG_TABLE_NAME,                                     -- table - the table that caused the trigger
    TG_TABLE_SCHEMA,                                   -- schema - the schema of the table that caused the trigger
    NEW,                                               -- new record - the record after the change
    OLD                                                -- old record - the record before the change
  );
  END LOOP;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."notify_friends_of_check_in"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_park_check_in_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'realtime'
    AS $$
DECLARE
  -- Declare the variables we need inside the function
  park_id_to_notify INT;
  channel_name TEXT;
BEGIN
  -- Log that the function has started
  RAISE LOG '[TRIGGER DEBUG] Function started by operation: %', TG_OP;

  -- Get the park_id from the row that was just inserted or deleted
  park_id_to_notify := COALESCE(NEW.park_id, OLD.park_id);

  -- Log the park_id we found
  RAISE LOG '[TRIGGER DEBUG] Park ID found: %', park_id_to_notify;

  -- Check if the park_id is NULL, which would cause a failure
  IF park_id_to_notify IS NULL THEN
    RAISE LOG '[TRIGGER DEBUG] ERROR: park_id is NULL. Cannot broadcast.';
    RETURN NULL;
  END IF;

  -- Construct the channel name
  channel_name := 'parks:' || park_id_to_notify::text;
  RAISE LOG '[TRIGGER DEBUG] Broadcasting to channel: %', channel_name;

  -- Broadcast a message on a channel specific to the PARK
  PERFORM realtime.broadcast_changes(
    channel_name,
    TG_OP, -- Our custom event name
    TG_OP,
    'check_in',
    'public',
    NEW,
    OLD
  );

  RAISE LOG '[TRIGGER DEBUG] Broadcast command sent successfully.';

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."notify_park_check_in_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_park_report_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  perform realtime.broadcast_changes(
    'park_reports:' || NEW.park_id ::text, -- Dynamic topic for the specific park
    TG_OP,                                 -- The event (INSERT, UPDATE, DELETE)
    TG_OP,                                 -- The operation
    TG_TABLE_NAME,                         -- The table name ('reports')
    TG_TABLE_SCHEMA,                       -- The schema ('public')
    NEW,                                   -- The new report data
    OLD                                    -- The old data (null on INSERT)
  );
  return null;
end;
$$;


ALTER FUNCTION "public"."notify_park_report_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" "text",
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_steps_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."_prisma_migrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."check_ins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "park_id" "uuid" NOT NULL,
    "check_in_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "check_out_time" timestamp with time zone
);


ALTER TABLE "public"."check_ins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."friend_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "friend_requests_check" CHECK (("sender_id" <> "receiver_id")),
    CONSTRAINT "friend_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text"])))
);


ALTER TABLE "public"."friend_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."friendships" (
    "user_id_1" "uuid" NOT NULL,
    "user_id_2" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "friendships_check" CHECK (("user_id_1" <> "user_id_2"))
);


ALTER TABLE "public"."friendships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."park_users" (
    "park_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."park_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."parks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "location" "text",
    "courts" integer,
    "tags" "jsonb"
);


ALTER TABLE "public"."parks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "image_url" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh_key" character varying(255) NOT NULL,
    "auth_key" character varying(255) NOT NULL,
    "user_agent_info" "jsonb",
    "last_successful_push" timestamp with time zone,
    "status" "public"."push_subscription_status" DEFAULT 'active'::"public"."push_subscription_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "park_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "report_count" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" bigint NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "permission" "public"."app_permission" NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."role_permissions" IS 'Application permissions for each role.';



ALTER TABLE "public"."role_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."role_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh" character varying(255) NOT NULL,
    "auth" character varying(255) NOT NULL,
    "expirationtime" timestamp without time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_roles" IS 'Application roles for each user.';



ALTER TABLE "public"."user_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."_prisma_migrations"
    ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."check_ins"
    ADD CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("user_id_1", "user_id_2");



ALTER TABLE ONLY "public"."park_users"
    ADD CONSTRAINT "park_users_pkey" PRIMARY KEY ("park_id", "user_id");



ALTER TABLE ONLY "public"."parks"
    ADD CONSTRAINT "parks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE ("endpoint");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_endpoint_unique" UNIQUE ("endpoint");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



CREATE OR REPLACE TRIGGER "on_check_in_change_notify_friends" AFTER INSERT OR UPDATE ON "public"."check_ins" FOR EACH ROW EXECUTE FUNCTION "public"."notify_friends_of_check_in"();



CREATE OR REPLACE TRIGGER "on_new_friend_request" AFTER INSERT ON "public"."friend_requests" FOR EACH ROW EXECUTE FUNCTION "public"."handle_friend_request_changes"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."push_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



ALTER TABLE ONLY "public"."check_ins"
    ADD CONSTRAINT "fk_checkins_to_park" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."check_ins"
    ADD CONSTRAINT "fk_checkins_to_profile" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "fk_profile" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "fk_reports_to_park" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "fk_reports_to_profile" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "friend_requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "friend_requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_user_id_1_fkey" FOREIGN KEY ("user_id_1") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_user_id_2_fkey" FOREIGN KEY ("user_id_2") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."park_users"
    ADD CONSTRAINT "park_users_park_id_fkey" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."park_users"
    ADD CONSTRAINT "park_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow auth admin to read user roles" ON "public"."user_roles" FOR SELECT TO "supabase_auth_admin" USING (true);



CREATE POLICY "Allow receiver to update friend request" ON "public"."friend_requests" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "receiver_id")) WITH CHECK (("auth"."uid"() = "receiver_id"));



CREATE POLICY "Allow users to create their own friendships" ON "public"."friendships" FOR INSERT TO "authenticated" WITH CHECK (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."park_users";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";






REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";














































































































































































REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."get_friends_with_status"("p_user_id" "uuid") TO "authenticated";
























GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."check_ins" TO "authenticated";



GRANT SELECT,INSERT,UPDATE ON TABLE "public"."friend_requests" TO "authenticated";



GRANT SELECT,INSERT ON TABLE "public"."friendships" TO "authenticated";



GRANT SELECT,INSERT,DELETE ON TABLE "public"."park_users" TO "authenticated";



GRANT SELECT ON TABLE "public"."parks" TO "authenticated";



GRANT SELECT ON TABLE "public"."profiles" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."push_subscriptions" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."reports" TO "authenticated";



GRANT ALL ON TABLE "public"."user_roles" TO "supabase_auth_admin";

































RESET ALL;
