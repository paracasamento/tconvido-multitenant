import { signedIntakeReferenceUrl } from "@/lib/supabase-storage";

type Media={id:string;storage_key:string;original_name:string;mime_type:string;byte_size:number};

export async function IntakeReferenceGallery({media}:{media:Media[]}) {
 if(!media.length)return <p className="muted">Nenhuma referência visual enviada.</p>;
 const items=await Promise.all(media.map(async item=>({...item,url:await signedIntakeReferenceUrl(item.storage_key)})));
 return <div className="intake-reference-grid">{items.map(item=><a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="intake-reference-card"><img src={item.url} alt={item.original_name || "Referência visual"} /><span>{item.original_name}</span></a>)}</div>;
}
