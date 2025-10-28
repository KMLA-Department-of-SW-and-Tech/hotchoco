// src/app/lib/storage-url.js
import { supabase } from "./supabase";

/**
 * image_path는 "executive-council/uuid.jpg" 처럼
 * 버킷 내부 경로만 저장한다고 가정.
 */
export function publicImageUrl(bucket, rawPath) {
  if (!rawPath) return null;

  // 1) 맨 앞 슬래시 제거
  let path = String(rawPath).replace(/^\/+/, "");

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
}
