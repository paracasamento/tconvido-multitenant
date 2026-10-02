import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sameOriginStrict } from "@/lib/security";
import { getPlatformSession } from "@/lib/sessions";
import { deleteStoredImage } from "@/lib/storage";

function cleanList(input: unknown) {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map(item => String(item).trim()).filter(Boolean))].slice(0, 30);
}

export async function PATCH(
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
  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const description = String(body.description || "").trim() || null;
  const tags = cleanList(body.tags);
  const palette = cleanList(body.palette)
    .filter(value => /^#[0-9a-f]{6}$/i.test(value))
    .slice(0, 8);
  const isActive = body.isActive !== false;

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ message: "Informe um nome válido." }, { status: 400 });
  }

  const sql = db();
  const rows = await sql`
    UPDATE design_theme_kits
    SET
      name = ${name},
      category = ${category},
      description = ${description},
      tags = ${tags},
      palette = ${JSON.stringify(palette)}::jsonb,
      is_active = ${isActive}
    WHERE id = ${id}
    RETURNING id
  `;

  if (!rows.length) return NextResponse.json({ message: "Kit não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
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
  const sql = db();
  const assets = await sql`
    SELECT storage_path FROM design_theme_assets WHERE kit_id = ${id}
  `;

  const rows = await sql`
    DELETE FROM design_theme_kits
    WHERE id = ${id}
    RETURNING id
  `;

  if (!rows.length) return NextResponse.json({ message: "Kit não encontrado." }, { status: 404 });

  await Promise.allSettled(
    (assets as any[]).map(asset => deleteStoredImage(String(asset.storage_path || "")))
  );

  return NextResponse.json({ ok: true });
}
