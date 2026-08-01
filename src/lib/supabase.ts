import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ymmugdaybszzxuzeqdgk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fYVsKVsSKAuYJFo2dJoo7w_fDqNbaO9';
export const BUCKET_NAME = import.meta.env.VITE_SUPABASE_BUCKET || 'LMS Bahasa Arab';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Uploads a File or Blob directly to Supabase Storage bucket 'LMS Bahasa Arab'
 * Returns the public URL and path. Fallbacks to Data URL if Supabase storage RLS policy or network fails.
 */
export async function uploadToSupabaseStorage(
  file: File | Blob,
  fileName: string,
  folder: string = 'modul-pdf'
): Promise<{ publicUrl: string; path: string }> {
  const cleanFileName = (fileName || 'document.pdf').replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload error, falling back to local Data URL:', error.message);
      const dataUrl = await fileToDataUrl(file);
      return {
        publicUrl: dataUrl,
        path: filePath,
      };
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      publicUrl: urlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.warn('Error uploading file to Supabase, falling back to local Data URL:', err);
    const dataUrl = await fileToDataUrl(file);
    return {
      publicUrl: dataUrl,
      path: filePath,
    };
  }
}

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Utility to convert Base64 string to Blob if needed
 */
export function base64ToBlob(base64: string, mimeType: string = 'application/pdf'): Blob {
  const byteCharacters = atob(base64.includes(',') ? base64.split(',')[1] : base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
