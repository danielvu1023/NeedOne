-- Create webhook configuration for push notifications
-- Based on Supabase webhook UI configuration shown in the screenshots

-- Create webhook for check_ins table with INSERT events
-- This matches the Supabase UI configuration:
-- - Name: Send Push on New Notification
-- - Table: check_ins
-- - Events: Insert (checked)
-- - Method: POST
-- - URL: https://c094c41b5fbe.ngrok-free.app/api/webhook
-- - Content-Type: application/json

-- Note: This migration creates the webhook configuration that would be created
-- through the Supabase UI. The actual webhook is managed by Supabase's webhook system,
-- not through database triggers.

-- For local development, you can create this webhook through the Supabase UI at:
-- http://localhost:54323 -> Database -> Webhooks -> Create a new webhook

-- For production, create the webhook through the Supabase dashboard with your production URL

-- The webhook payload will be sent in the format:
-- {
--   "type": "INSERT",
--   "table": "check_ins",
--   "record": { ... },
--   "schema": "public",
--   "old_record": null
-- }