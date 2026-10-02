import Link from "next/link";
import {Gift,Home,Mail,UserRound,UsersRound} from "lucide-react";
import {getAdminSetupState} from "@/lib/admin-setup";
import {requireAdmin} from "@/lib/sessions";
import {AdminBottomNavClient} from "@/components/admin/AdminBottomNavClient";

export async function AdminBottomNav(){
 const session=await requireAdmin("/admin");const state=await getAdminSetupState(session.event_id);
 const caps=Array.isArray((state.event as any).enabled_capabilities)?(state.event as any).enabled_capabilities:[];
 const items=[{href:"/admin",label:"Início",icon:"home",exact:true},{href:"/admin/convidados",label:"Convidados",icon:"users"},...(caps.length===0||caps.includes("gifts")?[{href:"/admin/presentes",label:"Presentes",icon:"gift"}]:[]),{href:"/admin/convite",label:"Convite",icon:"mail"},{href:"/admin/configuracoes",label:"Conta",icon:"user"}];
 return <AdminBottomNavClient items={items}/>;
}