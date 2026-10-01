import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isRateLimited, recordFailure } from "@/lib/rate-limit";
import { sameOrigin, verifyPassword } from "@/lib/security";
import { createAdminSession } from "@/lib/sessions";

const schema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(8).max(200),
  requiredRole: z.enum(["owner", "admin"]).optional()
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  }

  if (await isRateLimited(request, null, "admin_login_failed", 5, 15)) {
    return NextResponse.json(
      { message: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Credenciais inválidas." }, { status: 400 });
  }

  const sql = db();
  const accountEmail = parsed.data.email.trim();

  const rows = await sql`
    SELECT
      a.id,
      a.password_hash,
      ea.role,
      ea.event_id
    FROM admins a
    JOIN event_admins ea ON ea.admin_id = a.id
    WHERE
      lower(a.email) = lower(${accountEmail})
      AND a.is_active = true
    ORDER BY ea.created_at ASC
  `;

  if (rows.length !== 1) {
    await recordFailure(request, null, "admin_login_failed");
    return NextResponse.json(
      {
        code: rows.length > 1 ? "ambiguous_event_access" : "invalid_credentials",
        message: rows.length > 1
          ? "Esta conta está vinculada a mais de um evento. Ajuste o acesso pela Gestão."
          : "Login ou senha incorretos."
      },
      { status: rows.length > 1 ? 409 : 401 }
    );
  }

  const admin = rows[0] as any;

  if (!admin || !admin.password_hash || !(await verifyPassword(parsed.data.password, admin.password_hash))) {
    await recordFailure(request, null, "admin_login_failed");
    return NextResponse.json(
      { message: "Login ou senha incorretos." },
      { status: 401 }
    );
  }

  if (parsed.data.requiredRole && admin.role !== parsed.data.requiredRole) {
    await recordFailure(request, null, "admin_login_failed");

    return NextResponse.json(
      {
        code: "role_not_allowed",
        message:
          parsed.data.requiredRole === "owner"
            ? "Esta conta não possui acesso à área de gestão."
            : "Esta conta não possui acesso a este painel."
      },
      { status: 403 }
    );
  }

  await createAdminSession(admin.id, admin.event_id);

  return NextResponse.json({
    ok: true,
    role: admin.role,
    event_id: admin.event_id
  });
}
