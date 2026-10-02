import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminLog } from "@/lib/admin-log";
import { hashPassword, sameOriginStrict } from "@/lib/security";
import { getPlatformSession } from "@/lib/sessions";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(12).max(200),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!sameOriginStrict(request)) {
    return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  }

  const platform = await getPlatformSession();
  if (!platform) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Informe nome, e-mail válido e uma senha com pelo menos 12 caracteres." },
      { status: 400 }
    );
  }

  const { id: eventId } = await context.params;
  const sql = db();

  const eventRows = await sql`
    SELECT
      e.id,
      EXISTS (
        SELECT 1
        FROM event_admins ea
        WHERE ea.event_id = e.id
          AND ea.role = 'owner'
      ) AS has_owner
    FROM events e
    WHERE e.id = ${eventId}
    LIMIT 1
  `;

  if (!eventRows.length) {
    return NextResponse.json({ message: "Evento não encontrado." }, { status: 404 });
  }

  if (Boolean(eventRows[0].has_owner)) {
    return NextResponse.json(
      { message: "Este evento já possui uma conta de cliente." },
      { status: 409 }
    );
  }

  const duplicateRows = await sql`
    SELECT id
    FROM admins
    WHERE lower(email) = lower(${parsed.data.email})
    LIMIT 1
  `;

  if (duplicateRows.length) {
    return NextResponse.json(
      { message: "Já existe uma conta com este e-mail. Use outro e-mail para este evento." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);

  try {
    const rows = await sql`
      WITH created_admin AS (
        INSERT INTO admins (name, email, password_hash, is_active)
        VALUES (
          ${parsed.data.name},
          ${parsed.data.email.toLowerCase()},
          ${passwordHash},
          true
        )
        RETURNING id, name, email
      ),
      linked_owner AS (
        INSERT INTO event_admins (event_id, admin_id, role)
        SELECT ${eventId}, id, 'owner'
        FROM created_admin
        RETURNING admin_id
      )
      SELECT id, name, email
      FROM created_admin
      WHERE id IN (SELECT admin_id FROM linked_owner)
    `;

    if (!rows.length) {
      return NextResponse.json(
        { message: "Não foi possível criar o acesso do cliente." },
        { status: 500 }
      );
    }

    const owner = rows[0] as any;

    await adminLog({
      eventId,
      adminId: platform.admin_id,
      action: "client_access_created",
      entityType: "admin",
      entityId: String(owner.id),
      metadata: { email: String(owner.email) },
    });

    return NextResponse.json({
      ok: true,
      owner: {
        id: String(owner.id),
        name: String(owner.name),
        email: String(owner.email),
      },
    });
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { message: "O e-mail já está em uso ou este evento já possui uma conta de cliente." },
        { status: 409 }
      );
    }

    console.error("[CLIENT_ACCESS_CREATE_ERROR]", error);
    return NextResponse.json(
      { message: "Não foi possível criar o acesso do cliente agora." },
      { status: 500 }
    );
  }
}
