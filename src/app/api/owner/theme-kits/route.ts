import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sameOriginStrict } from "@/lib/security";
import { getPlatformSession } from "@/lib/sessions";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  if (!sameOriginStrict(request)) {
    return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  }

  const session = await getPlatformSession();
  if (!session) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const description = String(body.description || "").trim() || null;

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ message: "Informe um nome válido para o kit." }, { status: 400 });
  }

  const baseSlug = slugify(name) || "kit";
  const sql = db();

  let slug = baseSlug;
  for (let attempt = 0; attempt < 20; attempt++) {
    const exists = await sql`SELECT 1 FROM design_theme_kits WHERE slug = ${slug} LIMIT 1`;
    if (!exists.length) break;
    slug = `${baseSlug}-${attempt + 2}`;
  }

  const rows = await sql`
    INSERT INTO design_theme_kits (name, slug, category, description, created_by)
    VALUES (${name}, ${slug}, ${category}, ${description}, ${session.admin_id})
    RETURNING id, slug
  `;

  return NextResponse.json({ ok: true, id: rows[0].id, slug: rows[0].slug });
}
