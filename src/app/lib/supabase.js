import { createClient } from "@supabase/supabase-js";



export const supabase = createClient(
import.meta.env.VITE_SUPABASE_URL,
import.meta.env.VITE_SUPABASE_ANON_KEY
);


export function publicImageUrl(bucket, path) {
if (!path) return null;
const { data } = supabase.storage.from(bucket).getPublicUrl(path);
return data?.publicUrl ?? null;
}