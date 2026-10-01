-- Multitenant foundation: platform admins and event-bound admin sessions.
-- IMPORTANT: apply only to the new tconvido-multitenant Neon project.
-- This migration intentionally does NOT seed a platform admin. Seed only after
-- confirming the target project ID and the intended management account.

BEGIN;

CREATE TABLE IF NOT EXISTS platform_admins (
  admin_id uuid PRIMARY KEY REFERENCES admins(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_sessions
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE CASCADE;

-- Existing sessions were created before event binding existed. Revoking them
-- avoids carrying ambiguous sessions into the multitenant model.
UPDATE admin_sessions
SET revoked_at = now()
WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS admin_sessions_event_active_idx
  ON admin_sessions (admin_id, event_id, expires_at)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS event_admins_admin_role_idx
  ON event_admins (admin_id, role, created_at);

COMMIT;
