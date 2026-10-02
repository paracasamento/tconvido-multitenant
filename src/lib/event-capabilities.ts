import {db} from "@/lib/db";
export async function eventHasCapability(eventId:string,capability:string){
 const rows=await db()`SELECT enabled_capabilities FROM events WHERE id=${eventId} LIMIT 1`;
 if(!rows.length)return false;const caps=rows[0].enabled_capabilities;
 return Array.isArray(caps)?caps.includes(capability):false;
}