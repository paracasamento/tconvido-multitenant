import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPlatformSession } from "@/lib/sessions";
import { getDefaultCapabilities, isEventType } from "@/lib/event-types";
import { defaultInviteVisualConfig } from "@/lib/invite-builder";
import { sameOriginStrict } from "@/lib/security";

function slugify(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,140);}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOriginStrict(request))return NextResponse.json({message:"Origem inválida."},{status:403});
 const platform=await getPlatformSession(); if(!platform)return NextResponse.json({message:"Não autorizado."},{status:401});
 const {id}=await params; const sql=db();
 const rows=await sql`SELECT * FROM invitation_intakes WHERE id=${id} LIMIT 1`; const intake:any=rows[0];
 if(!intake)return NextResponse.json({message:"Ficha não encontrada."},{status:404});
 if(intake.converted_event_id)return NextResponse.json({ok:true,event_id:intake.converted_event_id,already_converted:true});
 if(!["accepted","negotiating","contacted","new"].includes(intake.status))return NextResponse.json({message:"Esta ficha não pode ser convertida neste estado."},{status:409});
 if(!isEventType(intake.event_type))return NextResponse.json({message:"Tipo de evento inválido."},{status:400});
 const a=intake.answers||{}; const identity=String(a.identity||intake.contact_name||"Evento").trim();
 let slug=slugify(identity)||"evento"; const exists=await sql`SELECT 1 FROM events WHERE slug=${slug} LIMIT 1`; if(exists.length)slug=`${slug}-${id.slice(0,6)}`;
 const eventId=crypto.randomUUID(); const caps=new Set(getDefaultCapabilities(intake.event_type));
 if(a.rsvp_wanted)caps.add("rsvp");else caps.delete("rsvp"); if(a.gifts_wanted)caps.add("gifts");else caps.delete("gifts"); if(a.dress_code_wanted)caps.add("dress_code");else caps.delete("dress_code"); if(a.schedule_wanted)caps.add("schedule");else caps.delete("schedule");
 const semantic:any={}; if(intake.event_type==="wedding")semantic.couple_names=identity; if(["kids_birthday","quinceanera"].includes(intake.event_type)){semantic.celebrant_name=identity;semantic.celebrant_age=a.age||null;} if(intake.event_type==="baby_shower")semantic.baby_name=identity; if(intake.event_type==="housewarming")semantic.hosts_names=identity;
 const cfg=structuredClone(defaultInviteVisualConfig); const coverNames=cfg.screens.cover.elements.find((e:any)=>e.id==="cover-names"); if(coverNames)coverNames.text=identity.toUpperCase();
 const configJson=JSON.stringify(cfg); const capsJson=JSON.stringify([...caps]); const auditJson=JSON.stringify({source_intake_id:id});
 const locationName=a.location_defined?(a.venue||null):null; const locationAddress=a.location_defined?(a.address||null):null; const locationCity=a.location_defined?(a.city||null):null; const locationMaps=a.location_defined?(a.maps_url||null):null;
 await sql`WITH created_event AS (
  INSERT INTO events(id,slug,title,couple_names,public_intro,message,event_date,event_time,venue,city,maps_url,status,event_type,event_name,celebrant_name,celebrant_age,baby_name,hosts_names,production_status,enabled_capabilities)
  VALUES(${eventId},${slug},${identity},${semantic.couple_names||identity},'',${a.required_message||null},${intake.event_date||null}::date,${intake.event_time||null}::time,${a.venue||null},${a.city||null},${a.maps_url||null},'draft',${intake.event_type},${identity},${semantic.celebrant_name||null},${semantic.celebrant_age||null},${semantic.baby_name||null},${semantic.hosts_names||null},'draft',${capsJson}::jsonb) RETURNING id
 ), created_location AS (
  INSERT INTO event_locations(event_id,kind,label,name,address,city,maps_url,event_time,sort_order)
  SELECT ${eventId},'main','Local principal',${locationName},${locationAddress},${locationCity},${locationMaps},${intake.event_time||null}::time,0 FROM created_event WHERE ${Boolean(a.location_defined&&(a.venue||a.address||a.city))} RETURNING id
 ), created_design AS (
  INSERT INTO invite_visual_designs(event_id,config,updated_at) SELECT ${eventId},${configJson}::jsonb,now() FROM created_event RETURNING event_id
 ), converted AS (
  UPDATE invitation_intakes SET status='converted',converted_event_id=${eventId},updated_at=now() WHERE id=${id} AND EXISTS(SELECT 1 FROM created_design) RETURNING id
 )
 INSERT INTO audit_logs(event_id,admin_id,action,entity_type,entity_id,metadata) SELECT ${eventId},${platform.admin_id},'intake_converted','invitation_intake',${id},${auditJson}::jsonb FROM converted`;
 return NextResponse.json({ok:true,event_id:eventId,slug});
}