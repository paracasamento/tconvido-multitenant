import { db } from "@/lib/db";
import {
  THEME_ASSET_PLACEMENT,
  type ThemeAssetSlot,
  type ThemeLibraryItem,
} from "@/lib/theme-library";

function assetUrl(path: string) {
  return `/api/theme-assets?path=${encodeURIComponent(path)}`;
}

export async function getThemeLibrary(options?: { includeInactive?: boolean }): Promise<ThemeLibraryItem[]> {
  const sql = db();
  const includeInactive = options?.includeInactive === true;

  const rows = await sql`
    SELECT
      k.id AS kit_id,
      k.slug,
      k.name AS kit_name,
      k.category,
      k.description,
      k.tags,
      k.palette,
      k.cover_path,
      k.is_active AS kit_active,
      k.created_at,
      a.id AS asset_id,
      a.slot,
      a.name AS asset_name,
      a.storage_path,
      a.mime_type,
      a.bytes,
      a.is_active AS asset_active
    FROM design_theme_kits k
    LEFT JOIN design_theme_assets a
      ON a.kit_id = k.id
     AND a.is_active = true
    WHERE ${includeInactive} OR k.is_active = true
    ORDER BY k.created_at DESC, a.slot ASC
  `;

  const map = new Map<string, ThemeLibraryItem>();

  for (const row of rows as any[]) {
    const id = String(row.kit_id);
    let kit = map.get(id);

    if (!kit) {
      const palette = Array.isArray(row.palette) ? row.palette.map(String) : [];
      const tags = Array.isArray(row.tags) ? row.tags.map(String) : [];
      kit = {
        id,
        slug: String(row.slug || ""),
        name: String(row.kit_name || ""),
        category: String(row.category || ""),
        description: row.description ? String(row.description) : null,
        tags,
        palette,
        preview: row.cover_path ? assetUrl(String(row.cover_path)) : null,
        isActive: row.kit_active !== false,
        backgrounds: [],
        assets: [],
      };
      map.set(id, kit);
    }

    if (!row.asset_id || !row.storage_path || !row.slot) continue;

    const src = assetUrl(String(row.storage_path));
    const base = {
      id: String(row.asset_id),
      name: String(row.asset_name || row.slot),
      src,
      storagePath: String(row.storage_path),
      mimeType: String(row.mime_type || "image/webp"),
      bytes: Number(row.bytes || 0),
    };

    if (row.slot === "background") {
      kit.backgrounds.push(base);
      if (!kit.preview) kit.preview = src;
      continue;
    }

    const slot = String(row.slot) as ThemeAssetSlot;
    kit.assets.push({
      ...base,
      slot,
      placement: THEME_ASSET_PLACEMENT[slot] || {},
    });
    if (!kit.preview) kit.preview = src;
  }

  return [...map.values()];
}
