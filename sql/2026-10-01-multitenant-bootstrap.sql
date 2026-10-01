-- Fresh bootstrap for the tconvido-multitenant Neon project.
-- Contains schema only. No event, guest, gift or RSVP data is copied from production.
-- Platform admin seed is intentionally performed separately and is not stored here.

BEGIN;

CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX admins_email_lower_uq ON admins (lower(email));

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  couple_names text NOT NULL,
  public_intro text NOT NULL,
  message text,
  event_date date NOT NULL,
  event_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  venue text NOT NULL,
  city text NOT NULL,
  maps_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  rsvp_deadline timestamptz,
  gift_deadline timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  guest_access_mode text NOT NULL DEFAULT 'individual' CHECK (guest_access_mode IN ('event','individual')),
  event_access_code_hash text,
  gift_color_preferences jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(gift_color_preferences)='array')
);

CREATE TABLE event_admins (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('owner','admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, admin_id)
);

CREATE UNIQUE INDEX event_admins_one_owner_per_event_idx ON event_admins(event_id) WHERE role='owner';

CREATE UNIQUE INDEX event_admins_owner_single_event_idx ON event_admins(admin_id) WHERE role='owner';

CREATE INDEX event_admins_admin_role_idx ON event_admins(admin_id, role, created_at);

CREATE TABLE platform_admins (
  admin_id uuid PRIMARY KEY REFERENCES admins(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);

CREATE INDEX admin_sessions_admin_active_idx ON admin_sessions(admin_id, expires_at) WHERE revoked_at IS NULL;

CREATE INDEX admin_sessions_event_active_idx ON admin_sessions(admin_id, event_id, expires_at) WHERE revoked_at IS NULL;

CREATE TABLE guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  normalized_name text NOT NULL,
  rsvp_status text NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending','confirmed','declined')),
  rsvp_updated_at timestamptz,
  source text NOT NULL DEFAULT 'admin' CHECK (source IN ('admin','self_registered')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  allowed_adults integer NOT NULL DEFAULT 1,
  allowed_children integer NOT NULL DEFAULT 0,
  confirmed_adults integer NOT NULL DEFAULT 0,
  confirmed_children integer NOT NULL DEFAULT 0,
  submitted_name text,
  match_status text,
  match_score integer,
  needs_review boolean NOT NULL DEFAULT false,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  UNIQUE (event_id, id)
);

CREATE INDEX guests_event_name_idx ON guests(event_id, normalized_name) WHERE deleted_at IS NULL;

CREATE INDEX guests_event_rsvp_idx ON guests(event_id, rsvp_status) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX guests_event_normalized_name_active_uidx ON guests(event_id, normalized_name) WHERE deleted_at IS NULL;

CREATE INDEX guests_rsvp_review_idx ON guests(event_id, needs_review) WHERE deleted_at IS NULL;

CREATE TABLE gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_path text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  available_quantity integer NOT NULL DEFAULT 1 CHECK (available_quantity >= 1 AND available_quantity <= 999),
  UNIQUE (event_id, id)
);

CREATE INDEX gifts_event_sort_idx ON gifts(event_id, sort_order, created_at) WHERE deleted_at IS NULL AND is_active=true;

CREATE TABLE guest_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  link_token_hash text,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX guest_access_codes_one_active_idx ON guest_access_codes(guest_id) WHERE revoked_at IS NULL;

CREATE UNIQUE INDEX guest_access_codes_code_hash_active_uq ON guest_access_codes(code_hash) WHERE revoked_at IS NULL;

CREATE UNIQUE INDEX guest_access_codes_link_token_idx ON guest_access_codes(link_token_hash) WHERE link_token_hash IS NOT NULL AND revoked_at IS NULL;

CREATE TABLE guest_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);

CREATE INDEX guest_sessions_guest_active_idx ON guest_sessions(guest_id, expires_at) WHERE revoked_at IS NULL;

CREATE UNIQUE INDEX guest_sessions_one_active_idx ON guest_sessions(guest_id) WHERE revoked_at IS NULL;

CREATE TABLE guest_companions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  name text,
  companion_type text NOT NULL DEFAULT 'child',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX guest_companions_guest_idx ON guest_companions(guest_id, companion_type);

CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL,
  gift_id uuid NOT NULL,
  released_at timestamptz,
  release_reason text CHECK (release_reason IS NULL OR release_reason IN ('guest','admin','guest_deleted','gift_deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((released_at IS NULL AND release_reason IS NULL) OR released_at IS NOT NULL),
  FOREIGN KEY (event_id, guest_id) REFERENCES guests(event_id, id) ON DELETE CASCADE,
  FOREIGN KEY (event_id, gift_id) REFERENCES gifts(event_id, id) ON DELETE CASCADE
);

CREATE INDEX reservations_event_active_idx ON reservations(event_id, created_at) WHERE released_at IS NULL;

CREATE UNIQUE INDEX reservations_one_active_per_guest_gift_idx ON reservations(guest_id, gift_id) WHERE released_at IS NULL;

CREATE INDEX reservations_gift_active_idx ON reservations(gift_id, created_at) WHERE released_at IS NULL;

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_event_created_idx ON audit_logs(event_id, created_at DESC);

CREATE TABLE invite_visual_designs (
  event_id uuid PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  config jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rsvp_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES guests(id) ON DELETE SET NULL,
  submitted_name text NOT NULL,
  normalized_name text NOT NULL,
  has_children boolean NOT NULL DEFAULT false,
  children_count integer NOT NULL DEFAULT 0 CHECK (children_count >= 0 AND children_count <= 20),
  match_status text NOT NULL DEFAULT 'unmatched' CHECK (match_status IN ('exact','probable','unmatched','reviewed')),
  match_score integer,
  needs_review boolean NOT NULL DEFAULT true,
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rsvp_submissions_event_confirmed_idx ON rsvp_submissions(event_id, confirmed_at DESC);

CREATE INDEX rsvp_submissions_review_idx ON rsvp_submissions(event_id, needs_review) WHERE needs_review=true;

CREATE UNIQUE INDEX rsvp_submissions_one_per_guest_idx ON rsvp_submissions(event_id, guest_id) WHERE guest_id IS NOT NULL;

CREATE TABLE rsvp_submission_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES rsvp_submissions(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rsvp_submission_sessions_submission_idx ON rsvp_submission_sessions(submission_id);

CREATE UNIQUE INDEX rsvp_submission_sessions_one_active_idx ON rsvp_submission_sessions(submission_id) WHERE revoked_at IS NULL;

CREATE TABLE guest_access_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  submitted_name text NOT NULL,
  normalized_name text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1 CHECK (attempt_count > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','denied','added')),
  guest_id uuid REFERENCES guests(id) ON DELETE SET NULL,
  first_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, normalized_name)
);

CREATE INDEX guest_access_attempts_pending_idx ON guest_access_attempts(event_id, last_attempt_at DESC) WHERE status='pending';

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER admins_set_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER gifts_set_updated_at BEFORE UPDATE ON gifts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER guests_set_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE VIEW admin_guest_overview AS
SELECT id,event_id,name,rsvp_status,rsvp_updated_at,source,created_at,updated_at,
       allowed_adults,allowed_children,confirmed_adults,confirmed_children,
       submitted_name,match_status,match_score,needs_review,reviewed_at
FROM guests
WHERE deleted_at IS NULL;

CREATE VIEW admin_gift_overview AS
SELECT g.id,g.event_id,g.name,g.description,g.image_path,g.sort_order,
       CASE WHEN EXISTS (
         SELECT 1 FROM reservations r
         WHERE r.event_id=g.event_id AND r.gift_id=g.id AND r.released_at IS NULL
       ) THEN 'reserved'::text ELSE 'available'::text END AS status,
       g.created_at,g.updated_at
FROM gifts g
WHERE g.deleted_at IS NULL AND g.is_active=true;

CREATE VIEW admin_dashboard AS
SELECT e.id AS event_id,
  (SELECT count(*) FROM guests gu WHERE gu.event_id=e.id AND gu.deleted_at IS NULL) AS guests_total,
  (SELECT count(*) FROM guests gu WHERE gu.event_id=e.id AND gu.deleted_at IS NULL AND gu.rsvp_status='confirmed') AS guests_confirmed,
  (SELECT count(*) FROM guests gu WHERE gu.event_id=e.id AND gu.deleted_at IS NULL AND gu.rsvp_status='declined') AS guests_declined,
  (SELECT count(*) FROM guests gu WHERE gu.event_id=e.id AND gu.deleted_at IS NULL AND gu.rsvp_status='pending') AS guests_pending,
  (SELECT count(*) FROM gifts gi WHERE gi.event_id=e.id AND gi.deleted_at IS NULL AND gi.is_active=true) AS gifts_total,
  (SELECT count(*) FROM gifts gi WHERE gi.event_id=e.id AND gi.deleted_at IS NULL AND gi.is_active=true
    AND EXISTS (SELECT 1 FROM reservations r WHERE r.event_id=e.id AND r.gift_id=gi.id AND r.released_at IS NULL)) AS gifts_reserved,
  (SELECT count(*) FROM gifts gi WHERE gi.event_id=e.id AND gi.deleted_at IS NULL AND gi.is_active=true
    AND NOT EXISTS (SELECT 1 FROM reservations r WHERE r.event_id=e.id AND r.gift_id=gi.id AND r.released_at IS NULL)) AS gifts_available
FROM events e;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_runtime') THEN
    CREATE ROLE app_runtime LOGIN;
  END IF;
END $$;

GRANT CONNECT ON DATABASE neondb TO app_runtime;

GRANT USAGE ON SCHEMA public TO app_runtime;

GRANT SELECT,INSERT,UPDATE ON admins TO app_runtime;

GRANT SELECT,INSERT,UPDATE ON events TO app_runtime;

GRANT SELECT,INSERT,UPDATE ON event_admins TO app_runtime;

GRANT SELECT ON platform_admins TO app_runtime;

GRANT SELECT,INSERT,UPDATE ON admin_sessions TO app_runtime;

GRANT SELECT,INSERT ON audit_logs TO app_runtime;

GRANT SELECT,INSERT,UPDATE ON gifts TO app_runtime;

GRANT SELECT,INSERT,UPDATE ON guest_access_codes TO app_runtime;

GRANT SELECT,INSERT,UPDATE ON guest_sessions TO app_runtime;

GRANT SELECT,INSERT,UPDATE,DELETE ON guest_companions TO app_runtime;

GRANT SELECT,INSERT,UPDATE ON guests TO app_runtime;

GRANT SELECT,INSERT,UPDATE ON reservations TO app_runtime;

GRANT SELECT,INSERT,UPDATE,DELETE ON invite_visual_designs TO app_runtime;

GRANT SELECT,INSERT,UPDATE,DELETE ON rsvp_submissions TO app_runtime;

GRANT SELECT,INSERT,UPDATE,DELETE ON rsvp_submission_sessions TO app_runtime;

GRANT SELECT,INSERT,UPDATE,DELETE ON guest_access_attempts TO app_runtime;

GRANT SELECT ON admin_dashboard,admin_gift_overview,admin_guest_overview TO app_runtime;

COMMIT;
