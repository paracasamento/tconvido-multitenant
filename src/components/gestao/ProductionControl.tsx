"use client";
import { useState } from "react";

const statuses=[["draft","Rascunho"],["briefing","Briefing"],["design","Em criação"],["review","Em revisão"],["approved","Aprovado"],["delivered","Entregue"]] as const;

export function ProductionControl({eventId,initialStatus,initialDeadline,initialNotes}:{eventId:string;initialStatus:string;initialDeadline:string;initialNotes:string}){
 const [status,setStatus]=useState(initialStatus||"draft"),[deadline,setDeadline]=useState(initialDeadline||""),[notes,setNotes]=useState(initialNotes||""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function save(){setBusy(true);setMessage("");try{const r=await fetch("/api/gestao/events/"+eventId+"/production",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({production_status:status,delivery_deadline:deadline?new Date(deadline+"T12:00:00").toISOString():null,internal_notes:notes})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||"Não foi possível salvar.");setMessage("Produção atualizada.");}catch(e){setMessage(e instanceof Error?e.message:"Erro ao salvar.")}finally{setBusy(false)}}
 return <div className="production-control"><label><span>Status de produção</span><select value={status} onChange={e=>setStatus(e.target.value)}>{statuses.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label><span>Prazo de entrega</span><input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></label><label><span>Notas internas</span><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Observações visíveis somente para a Gestão."/></label><button type="button" className="gestao-primary-action" onClick={save} disabled={busy}>{busy?"Salvando...":"Salvar produção"}</button>{message&&<small>{message}</small>}</div>;
}
