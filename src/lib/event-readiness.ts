import type { EventCapability, EventType } from "@/lib/event-types";

export type EventValidationIssue={key:string;label:string;severity:"required"|"recommended"};

export function validateEventReadiness(event:any):EventValidationIssue[]{
 const issues:EventValidationIssue[]=[];
 const caps:Array<EventCapability>=Array.isArray(event.enabled_capabilities)?event.enabled_capabilities:[];
 const required=(key:string,label:string,ok:boolean)=>{if(!ok)issues.push({key,label,severity:"required"})};
 const recommended=(key:string,label:string,ok:boolean)=>{if(!ok)issues.push({key,label,severity:"recommended"})};
 required("identity","Identidade principal do evento",Boolean(event.event_name||event.couple_names||event.celebrant_name||event.baby_name||event.hosts_names));
 required("date","Data do evento",Boolean(event.event_date));
 required("location","Local do evento",Boolean(event.venue||event.city));
 recommended("time","Horário do evento",Boolean(event.event_time));
 recommended("delivery_deadline","Prazo interno de entrega",Boolean(event.delivery_deadline));
 if(caps.includes("rsvp"))recommended("rsvp_deadline","Prazo de confirmação",Boolean(event.rsvp_deadline));
 if(caps.includes("gifts"))recommended("gift_deadline","Prazo da lista de presentes",Boolean(event.gift_deadline));
 return issues;
}
