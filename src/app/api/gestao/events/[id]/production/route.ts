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

 const eventRows=await sql`
   SELECT production_status
   FROM events
   WHERE id=${id}
   LIMIT 1
 `;
 if(!eventRows.length)return NextResponse.json({message:"Evento não encontrado."},{status:404});

 const currentStatus=String(eventRows[0].production_status||"draft");
 const openChangeRows=await sql`
   SELECT count(*)::int AS total
   FROM event_change_requests
   WHERE event_id=${id}
     AND status='open'
 `;
 const openChanges=Number(openChangeRows[0]?.total||0);

 if(status==="review"&&openChanges>0){
   return NextResponse.json({message:"Resolva os pedidos de alteração pendentes antes de enviar novamente para revisão."},{status:409});
 }

 if(status==="approved"){
   const approvalRows=await sql`
     SELECT id
     FROM event_approvals
     WHERE event_id=${id}
       AND status='approved'
     ORDER BY created_at DESC
     LIMIT 1
   `;
   if(!approvalRows.length){
     return NextResponse.json({message:"A aprovação precisa ser registrada pelo cliente antes de marcar o convite como aprovado."},{status:409});
   }
 }

 if(status==="delivered"&&currentStatus!=="approved"){
   return NextResponse.json({message:"O convite precisa estar aprovado antes de ser entregue."},{status:409});
 }

 const rows=await sql`UPDATE events SET production_status=${status},delivery_deadline=${deadline}::timestamptz,internal_notes=${notes||null},updated_at=now() WHERE id=${id} RETURNING id`;
 await sql`INSERT INTO audit_logs(event_id,admin_id,action,entity_type,entity_id,metadata) VALUES(${id},${session.admin_id},'production_updated','event',${id},${JSON.stringify({production_status:status,delivery_deadline:deadline})}::jsonb)`;
 return NextResponse.json({ok:true});
}
