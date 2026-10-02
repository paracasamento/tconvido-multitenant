"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

type RequestItem={id:string;message:string;status:string;created_at:string;source:string};

export function ChangeRequestManager({eventId,items}:{eventId:string;items:RequestItem[]}){
 const router=useRouter();const [busy,setBusy]=useState<string|null>(null);const [message,setMessage]=useState("");
 async function resolve(id:string,status:"resolved"|"dismissed"){setBusy(id);setMessage("");const r=await fetch("/api/gestao/events/"+eventId+"/changes/"+id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status})});const d=await r.json().catch(()=>({}));setBusy(null);if(!r.ok){setMessage(d.message||"Não foi possível atualizar.");return}router.refresh()}
 if(!items.length)return <p>Nenhum pedido de alteração recebido.</p>;
 return <div className="change-request-list">{items.map(item=><article key={item.id} className="change-request-card"><div><strong>{item.status==="open"?"Pendente":item.status==="resolved"?"Resolvido":"Dispensado"}</strong><small>{new Date(item.created_at).toLocaleString("pt-BR")}</small></div><p>{item.message}</p>{item.status==="open"&&<div className="card-actions"><button type="button" disabled={busy===item.id} onClick={()=>resolve(item.id,"resolved")}>Marcar resolvido</button><button type="button" disabled={busy===item.id} onClick={()=>resolve(item.id,"dismissed")}>Dispensar</button></div>}</article>)}{message&&<p>{message}</p>}</div>
}