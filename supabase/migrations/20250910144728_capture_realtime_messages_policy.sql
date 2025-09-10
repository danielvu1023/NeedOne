CREATE POLICY "Authenticated users can receieve their unique broadcasts"
ON "realtime"."messages"
FOR SELECT
TO authenticated
USING (
  (
    (string_to_array(realtime.topic(), ':'::text))[2] = (auth.uid())::text
  )
  AND realtime.messages.extension IN ('broadcast')
);