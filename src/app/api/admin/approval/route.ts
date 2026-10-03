import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/sessions";
import { adminLog } from "@/lib/admin-log";
import { sameOriginStrict } from "@/lib/security";

export async function POST(request:Request){
 if(!sameOriginStrict(request))return NextResponse.json({message:"Origem inválida."},{status:403});
 const session=await getAdminSession();if(!session)return NextResponse.json({message:"Não autorizado."},{status:401});
 const body=await request.json().catch(()=>null);const action=String(body?.action||"");const note=String(body?.note||"").trim().slice(0,3000);const sql=db();
 const eventRows=await sql`SELECT production_status FROM events WHERE id=${session.event_id} LIMIT 1`;
 const productionStatus=String(eventRows[0]?.production_status||"draft");
 if(!eventRows.length)return NextResponse.json({message:"Evento não encontrado."},{status:404});
 if(productionStatus==="delivered")return NextResponse.json({message:"Este convite já foi entregue e não aceita novas decisões de aprovação."},{status:409});
 if(action==="approve"){
  if(productionStatus!=="review")return NextResponse.json({message:"O convite ainda não está em revisão para aprovação."},{status:409});
  await sql`INSERT INTO event_approvals(event_id,admin_id,status,note) VALUES(${session.event_id},${session.admin_id},\'approved\',${note||null})`;
  await sql`UPDATE events SET production_status=\'approved\',updated_at=now() WHERE id=${session.event_id}`;
  await adminLog({eventId:session.event_id,adminId:session.admin_id,action:"invitation_approved",entityType:"event",entityId:session.event_id,metadata:{note:note||null}});
  return NextResponse.json({ok:true});
 }
 if(action==="request_changes"){
  if(!["review","approved"].includes(productionStatus))return NextResponse.json({message:"O convite ainda não está disponível para solicitar alterações."},{status:409});
  if(note.length<3)return NextResponse.json({message:"Descreva o que precisa ser alterado."},{status:400});
  await sql`INSERT INTO event_change_requests(event_id,admin_id,source,message,status) VALUES(${session.event_id},${session.admin_id},\'client\',${note},\'open\')`;
  await sql`INSERT INTO event_approvals(event_id,admin_id,status,note) VALUES(${session.event_id},${session.admin_id},\'changes_requested\',${note})`;
  await sql`UPDATE events SET production_status=\'review\',updated_at=now() WHERE id=${session.event_id}`;
  await adminLog({eventId:session.event_id,adminId:session.admin_id,action:"invitation_changes_requested",entityType:"event",entityId:session.event_id,metadata:{note}});
  return NextResponse.json({ok:true});
 }
 return NextResponse.json({message:"Ação inválida."},{status:400});
}