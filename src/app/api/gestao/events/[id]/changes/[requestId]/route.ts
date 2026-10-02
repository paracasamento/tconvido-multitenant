import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {getPlatformSession} from "@/lib/sessions";
import {sameOriginStrict} from "@/lib/security";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string;requestId:string}>}){
 if(!sameOriginStrict(request))return NextResponse.json({message:"Origem inválida."},{status:403});
 const session=await getPlatformSession();if(!session)return NextResponse.json({message:"Não autorizado."},{status:401});
 const {id,requestId}=await params;const body=await request.json().catch(()=>null);const status=String(body?.status||"");
 if(!["resolved","dismissed"].includes(status))return NextResponse.json({message:"Status inválido."},{status:400});
 const sql=db();const rows=await sql`UPDATE event_change_requests SET status=${status},resolved_at=now() WHERE id=${requestId} AND event_id=${id} AND status='open' RETURNING id`;
 if(!rows.length)return NextResponse.json({message:"Pedido não encontrado ou já tratado."},{status:404});
 await sql`INSERT INTO audit_logs(event_id,admin_id,action,entity_type,entity_id,metadata) VALUES(${id},${session.admin_id},'change_request_' || ${status},'event_change_request',${requestId},jsonb_build_object('status',${status}::text))`;
 return NextResponse.json({ok:true});
}