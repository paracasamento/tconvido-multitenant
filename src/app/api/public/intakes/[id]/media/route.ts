import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { INTAKE_REFERENCE_BUCKET, supabaseStorageAdmin } from "@/lib/supabase-storage";
import { sameOriginStrict } from "@/lib/security";

const TYPES=new Set(["image/jpeg","image/png","image/webp"]);
const MAX_SIZE=12*1024*1024;
const MAX_FILES=8;

function tokenHash(token:string){return crypto.createHash("sha256").update(token).digest("hex");}
function ext(type:string){return type==="image/png"?"png":type==="image/webp"?"webp":"jpg";}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
  if(!sameOriginStrict(request)) return NextResponse.json({message:"Origem inválida."},{status:403});
  const {id}=await params;
  const form=await request.formData();
  const token=String(form.get("access_token")||"");
  const mediaKind=String(form.get("media_kind")||"reference");
  if(mediaKind!=="reference"&&mediaKind!=="invite_photo") return NextResponse.json({message:"Tipo de imagem inválido."},{status:400});
  if(!token) return NextResponse.json({message:"Acesso à ficha inválido."},{status:401});
  const files=form.getAll("files").filter((v):v is File=>v instanceof File && v.size>0);
  if(!files.length) return NextResponse.json({ok:true,files:[]});
  if(files.length>MAX_FILES) return NextResponse.json({message:"Envie no máximo 8 imagens."},{status:400});
  for(const file of files){if(!TYPES.has(file.type))return NextResponse.json({message:"Use apenas JPG, PNG ou WebP."},{status:400});if(file.size>MAX_SIZE)return NextResponse.json({message:"Cada imagem pode ter no máximo 12 MB."},{status:400});}

  const sql=db();
  const rows=await sql`SELECT id FROM invitation_intakes WHERE id=${id} AND public_token_hash=${tokenHash(token)} LIMIT 1`;
  if(!rows.length) return NextResponse.json({message:"Acesso à ficha inválido."},{status:403});
  const countRows=await sql`SELECT count(*)::int AS total FROM invitation_intake_media WHERE intake_id=${id} AND media_kind=${mediaKind}`;
  if(Number(countRows[0]?.total||0)+files.length>MAX_FILES)return NextResponse.json({message:"Envie no máximo 8 imagens deste tipo."},{status:400});

  const storage=supabaseStorageAdmin(); const saved:any[]=[];
  try{
    for(let i=0;i<files.length;i++){
      const file=files[i]; const mediaId=crypto.randomUUID(); const path=`${id}/${mediaId}.${ext(file.type)}`;
      const {error}=await storage.storage.from(INTAKE_REFERENCE_BUCKET).upload(path,Buffer.from(await file.arrayBuffer()),{contentType:file.type,upsert:false,cacheControl:"3600"});
      if(error) throw error;
      await sql`INSERT INTO invitation_intake_media(id,intake_id,storage_key,original_name,mime_type,byte_size,sort_order,media_kind) VALUES(${mediaId},${id},${path},${file.name},${file.type},${file.size},${i},${mediaKind})`;
      saved.push({id:mediaId,name:file.name,path});
    }
    return NextResponse.json({ok:true,files:saved});
  }catch(error){
    if(saved.length){await storage.storage.from(INTAKE_REFERENCE_BUCKET).remove(saved.map((x:any)=>x.path)).catch(()=>null);}
    console.error("intake media upload failed",error); return NextResponse.json({message:"Não foi possível enviar as imagens. Tente novamente."},{status:500});
  }
}
