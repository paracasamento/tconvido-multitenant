import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { safeInternalPath } from "@/lib/access-routing";
import { sameOriginStrict } from "@/lib/security";
import { getPlatformSession, selectOwnerEvent } from "@/lib/sessions";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!sameOriginStrict(request)) {
    return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  }

  const platform = await getPlatformSession();
  if (!platform) {
    return NextResponse.redirect(new URL("/gestao/login", request.url), 303);
  }

  const { id } = await context.params;
  const sql = db();
  const rows = await sql`SELECT id FROM events WHERE id = ${id} LIMIT 1`;
  if (!rows.length) {
    return NextResponse.json({ message: "Evento não encontrado." }, { status: 404 });
  }

  await selectOwnerEvent(id);

  const next = safeInternalPath(
    new URL(request.url).searchParams.get("next") || undefined,
    "/gestao",
    ["/gestao", "/admin"]
  );

  return NextResponse.redirect(new URL(next, request.url), 303);
}
