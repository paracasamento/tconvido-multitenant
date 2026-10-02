import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOwnerSession } from "@/lib/sessions";
import { sameOriginStrict } from "@/lib/security";

export async function POST(request:Request){
 if(!sameOriginStrict(request))return NextResponse.json({message:"Origem inválida."},{status:403});
 const session=await getOwnerSession();if(!session)return NextResponse.json({message:"Não autorizado."},{status:401});
 const body=await request.json().catch(()=>null);const action=String(body?.action||"");const note=String(body?.note||"").trim().slice(0,3000);const sql=db();
 if(action==="approve"){
  await sql`INSERT INTO event_approvals(event_id,admin_id,status,note) VALUES(${session.event_id},${session.admin_id},\'approved\',${note||null})`;
  await sql`UPDATE events SET production_status=\'approved\',updated_at=now() WHERE id=${session.event_id}`;
  return NextResponse.json({ok:true});
 }
 if(action==="request_changes"){
  if(note.length<3)return NextResponse.json({message:"Descreva o que precisa ser alterado."},{status:400});
  await sql`INSERT INTO event_change_requests(event_id,admin_id,source,message,status) VALUES(${session.event_id},${session.admin_id},\'client\',${note},\'open\')`;
  await sql`INSERT INTO event_approvals(event_id,admin_id,status,note) VALUES(${session.event_id},${session.admin_id},\'changes_requested\',${note})`;
  await sql`UPDATE events SET production_status=\'review\',updated_at=now() WHERE id=${session.event_id}`;
  return NextResponse.json({ok:true});
 }
 return NextResponse.json({message:"Ação inválida."},{status:400});
}