import { PHOTOS_BUCKET } from "./supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Uploads a file straight to the Supabase Storage REST endpoint via XHR so
 * we can surface real upload progress (the supabase-js client wraps fetch,
 * which does not expose upload progress events).
 */
export function uploadPhotoWithProgress(
  file: File,
  path: string,
  onProgress: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      reject(new Error("Supabase is not configured."));
      return;
    }

    const xhr = new XMLHttpRequest();
    const endpoint = `${supabaseUrl}/storage/v1/object/${PHOTOS_BUCKET}/${path}`;

    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("apikey", supabaseAnonKey);
    xhr.setRequestHeader("Authorization", `Bearer ${supabaseAnonKey}`);
    xhr.setRequestHeader("Content-Type", file.type || "image/jpeg");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "3600");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${PHOTOS_BUCKET}/${path}`;
        resolve(publicUrl);
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
}

export function buildPhotoPath(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const random = crypto.randomUUID();
  return `guests/${random}.${ext}`;
}
