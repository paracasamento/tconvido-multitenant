import {getAdminSession} from "@/lib/sessions";
import {db} from "@/lib/db";
import {AdminBottomNavClient} from "@/components/admin/AdminBottomNavClient";

export async function AdminBottomNav(){
 const session=await getAdminSession();
 const rows=session?await db()`SELECT enabled_capabilities FROM events WHERE id=${session.event_id} LIMIT 1`:[];
 const caps=Array.isArray(rows[0]?.enabled_capabilities)?rows[0].enabled_capabilities:[];
 const items=[{href:"/admin",label:"Início",icon:"home",exact:true},{href:"/admin/convidados",label:"Convidados",icon:"users"},...(caps.length===0||caps.includes("gifts")?[{href:"/admin/presentes",label:"Presentes",icon:"gift"}]:[]),{href:"/admin/convite",label:"Convite",icon:"mail"},{href:"/admin/configuracoes",label:"Conta",icon:"user"}];
 return <AdminBottomNavClient items={items}/>;
}