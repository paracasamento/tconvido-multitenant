-- User-managed invitation theme library.
-- The library starts empty; no generated themes are seeded.

CREATE TABLE IF NOT EXISTS design_theme_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT '',
  description text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  palette jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(palette)='array'),
  cover_path text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS design_theme_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id uuid NOT NULL REFERENCES design_theme_kits(id) ON DELETE CASCADE,
  slot text NOT NULL CHECK (slot IN (
    'background','top_left','top_right','top_full',
    'bottom_left','bottom_right','bottom_full',
    'divider_horizontal','frame'
  )),
  name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  bytes integer NOT NULL CHECK (bytes > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kit_id, slot)
);

CREATE INDEX IF NOT EXISTS design_theme_kits_active_idx
  ON design_theme_kits(is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS design_theme_assets_kit_idx
  ON design_theme_assets(kit_id, slot)
  WHERE is_active=true;

DROP TRIGGER IF EXISTS design_theme_kits_set_updated_at ON design_theme_kits;
CREATE TRIGGER design_theme_kits_set_updated_at
  BEFORE UPDATE ON design_theme_kits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS design_theme_assets_set_updated_at ON design_theme_assets;
CREATE TRIGGER design_theme_assets_set_updated_at
  BEFORE UPDATE ON design_theme_assets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

GRANT SELECT,INSERT,UPDATE,DELETE ON design_theme_kits TO app_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON design_theme_assets TO app_runtime;
