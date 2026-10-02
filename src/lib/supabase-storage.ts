import { createClient } from "@supabase/supabase-js";

export const INTAKE_REFERENCE_BUCKET = "intake-references";

export function supabaseStorageAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase Storage não configurado.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function signedIntakeReferenceUrl(path:string, expiresIn=900) {
  const client=supabaseStorageAdmin();
  const {data,error}=await client.storage.from(INTAKE_REFERENCE_BUCKET).createSignedUrl(path,expiresIn);
  if(error) throw error;
  return data.signedUrl;
}
