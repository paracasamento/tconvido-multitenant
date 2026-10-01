import { NextResponse } from "next/server";
import { getOwnerSession, getPlatformSession } from "@/lib/sessions";

export async function GET() {
  const platform = await getPlatformSession();

  if (!platform) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const selected = await getOwnerSession();

  return NextResponse.json({
    authenticated: true,
    owner: {
      id: platform.admin_id,
      name: platform.admin_name,
      role: "platform_admin",
      event_id: selected?.event_id || null
    }
  });
}
