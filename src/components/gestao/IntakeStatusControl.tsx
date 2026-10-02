"use client";
import { useState } from "react";

const labels:Record<string,string>={new:"Nova",contacted:"Contatada",negotiating:"Em negociação",accepted:"Aceita",discarded:"Descartada",converted:"Convertida"};

export function IntakeStatusControl({id,initialStatus}:{id:string;initialStatus:string}) {
 const [status,setStatus]=useState(initialStatus); const [busy,setBusy]=useState(false);
 async function change(next:string){setBusy(true); const previous=status; setStatus(next); const r=await fetch("/api/gestao/intakes/"+id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status:next})}); if(!r.ok)setStatus(previous); setBusy(false);}
 return <label className="intake-status-control"><span>Status comercial</span><select value={status} disabled={busy||status==="converted"} onChange={e=>change(e.target.value)}>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>;
}
