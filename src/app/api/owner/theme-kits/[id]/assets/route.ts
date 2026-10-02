import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sameOriginStrict } from "@/lib/security";
import { getPlatformSession } from "@/lib/sessions";
import { deleteStoredImage, uploadThemeLibraryAsset } from "@/lib/storage";
import { THEME_SLOT_DEFINITIONS } from "@/lib/theme-library";

const validSlots = new Set(THEME_SLOT_DEFINITIONS.map(item => item.slot));

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!sameOriginStrict(request)) {
    return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  }
  const session = await getPlatformSession();
  if (!session) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  const { id } = await context.params;
  const form = await request.formData();
  const slot = String(form.get("slot") || "");
  const file = form.get("image");
  const name = String(form.get("name") || "").trim() || slot.replaceAll("_", " ");

  if (!validSlots.has(slot as any)) {
    return NextResponse.json({ message: "Posição inválida." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ message: "Selecione um PNG, WEBP ou JPG." }, { status: 400 });
  }

  const sql = db();
  const kits = await sql`SELECT id FROM design_theme_kits WHERE id = ${id} LIMIT 1`;
  if (!kits.length) return NextResponse.json({ message: "Kit não encontrado." }, { status: 404 });

  const current = await sql`
    SELECT storage_path
    FROM design_theme_assets
    WHERE kit_id = ${id} AND slot = ${slot}
    LIMIT 1
  `;

  let uploaded: string | null = null;
  try {
    uploaded = await uploadThemeLibraryAsset(id, slot, file);

    await sql`
      INSERT INTO design_theme_assets (
        kit_id, slot, name, storage_path, mime_type, bytes, is_active
      )
      VALUES (
        ${id}, ${slot}, ${name}, ${uploaded}, ${file.type}, ${file.size}, true
      )
      ON CONFLICT (kit_id, slot)
      DO UPDATE SET
        name = EXCLUDED.name,
        storage_path = EXCLUDED.storage_path,
        mime_type = EXCLUDED.mime_type,
        bytes = EXCLUDED.bytes,
        is_active = true,
        updated_at = now()
    `;

    const previous = current[0]?.storage_path ? String(current[0].storage_path) : null;
    if (previous && previous !== uploaded) await deleteStoredImage(previous);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (uploaded) await deleteStoredImage(uploaded);
    return NextResponse.json(
      { message: error?.message || "Não foi possível enviar a imagem." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!sameOriginStrict(request)) {
    return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  }
  const session = await getPlatformSession();
  if (!session) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const slot = String(body.slot || "");
  if (!validSlots.has(slot as any)) {
    return NextResponse.json({ message: "Posição inválida." }, { status: 400 });
  }

  const sql = db();
  const rows = await sql`
    DELETE FROM design_theme_assets
    WHERE kit_id = ${id} AND slot = ${slot}
    RETURNING storage_path
  `;

  if (rows[0]?.storage_path) await deleteStoredImage(String(rows[0].storage_path));
  return NextResponse.json({ ok: true });
}
