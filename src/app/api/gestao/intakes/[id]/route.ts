import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/sessions";

const allowed = ["new","contacted","negotiating","accepted","discarded","converted"] as const;

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  await requirePlatformAdmin("/gestao/fichas");
  const {id}=await params;
  const body=await request.json().catch(()=>null);
  const status=body?.status;
  if(!allowed.includes(status)) return NextResponse.json({message:"Status inválido."},{status:400});
  const sql=db();
  const rows=await sql`UPDATE invitation_intakes SET status=${status}, updated_at=now() WHERE id=${id} RETURNING id,status`;
  if(!rows.length) return NextResponse.json({message:"Ficha não encontrada."},{status:404});
  return NextResponse.json({ok:true,...rows[0]});
}
