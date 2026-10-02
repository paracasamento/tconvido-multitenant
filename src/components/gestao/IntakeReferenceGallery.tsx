import { signedIntakeReferenceUrl } from "@/lib/supabase-storage";

type Media={id:string;storage_key:string;original_name:string;mime_type:string;byte_size:number;media_kind:"reference"|"invite_photo"};

async function MediaGrid({items,empty}:{items:Media[];empty:string}) {
 if(!items.length)return <p className="muted">{empty}</p>;
 const signed=await Promise.all(items.map(async item=>({...item,url:await signedIntakeReferenceUrl(item.storage_key)})));
 return <div className="intake-reference-grid">{signed.map(item=><a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="intake-reference-card"><img src={item.url} alt={item.original_name || "Imagem da ficha"} /><span>{item.original_name}</span></a>)}</div>;
}

export async function IntakeReferenceGallery({media}:{media:Media[]}) {
 const photos=media.filter(item=>item.media_kind==="invite_photo");
 const references=media.filter(item=>item.media_kind!=="invite_photo");
 return <div className="intake-media-groups"><section><h3>Fotos para possível uso no convite</h3><MediaGrid items={photos} empty="Nenhuma foto própria enviada." /></section><section><h3>Referências visuais</h3><MediaGrid items={references} empty="Nenhuma referência visual enviada." /></section></div>;
}
