import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPlatformSession } from "@/lib/sessions";
import { sameOriginStrict } from "@/lib/security";

const STATUSES=["draft","briefing","design","review","approved","delivered"] as const;

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOriginStrict(request))return NextResponse.json({message:"Origem inválida."},{status:403});
 const session=await getPlatformSession(); if(!session)return NextResponse.json({message:"Não autorizado."},{status:401});
 const {id}=await params; const body=await request.json().catch(()=>null);
 const status=String(body?.production_status||"");
 if(!STATUSES.includes(status as any))return NextResponse.json({message:"Status de produção inválido."},{status:400});
 const deadline=body?.delivery_deadline?String(body.delivery_deadline):null;
 const notes=String(body?.internal_notes||"").slice(0,5000);
 const sql=db();
 const rows=await sql`UPDATE events SET production_status=${status},delivery_deadline=${deadline}::timestamptz,internal_notes=${notes||null},updated_at=now() WHERE id=${id} RETURNING id`;
 if(!rows.length)return NextResponse.json({message:"Evento não encontrado."},{status:404});
 await sql`INSERT INTO audit_logs(event_id,admin_id,action,entity_type,entity_id,metadata) VALUES(${id},${session.admin_id},'production_updated','event',${id},${JSON.stringify({production_status:status,delivery_deadline:deadline})}::jsonb)`;
 return NextResponse.json({ok:true});
}
