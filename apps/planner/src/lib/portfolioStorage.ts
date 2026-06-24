import { supabase } from './supabase';

const BUCKET = 'planner-portfolios';

/** Uploads to {user_id}/{folder/}{timestamp}-{rand}.{ext} and returns the public URL, or null on failure. */
export async function uploadPortfolioImage(userId: string, file: File, folder = ''): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${folder ? `${folder}/` : ''}${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Best-effort delete — failures (e.g. already gone) are ignored since this never blocks the UI. */
export async function deletePortfolioImage(publicUrl: string) {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  await supabase.storage.from(BUCKET).remove([publicUrl.slice(idx + marker.length)]);
}
