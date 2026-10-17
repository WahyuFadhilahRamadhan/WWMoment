import type { GuestbookPhoto } from "./types";

function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function exportMetadataCsv(photos: GuestbookPhoto[]) {
  const header = ["id", "guest_name", "message", "photo_url", "filter_style", "created_at"];
  const rows = photos.map((p) =>
    [p.id, p.guest_name, p.message ?? "", p.photo_url, p.filter_style, p.created_at]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wedding-guestbook-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadSinglePhoto(photo: GuestbookPhoto) {
  const response = await fetch(photo.photo_url);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ext = blob.type.split("/")[1] || "jpg";
  a.download = `${photo.guest_name.replace(/\s+/g, "_")}-${photo.id.slice(0, 8)}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvForPhotos(photos: GuestbookPhoto[]): string {
  const header = ["file", "guest_name", "message", "filter_style", "created_at"];
  const rows = photos.map((p, i) =>
    [zipEntryName(p, i), p.guest_name, p.message ?? "", p.filter_style, p.created_at]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

function zipEntryName(photo: GuestbookPhoto, index: number): string {
  const name = photo.guest_name.replace(/[^\w-]+/g, "_").slice(0, 30) || "guest";
  const ext = photo.photo_url.split(".").pop()?.split("?")[0] || "jpg";
  return `photos/${String(index + 1).padStart(3, "0")}-${name}-${photo.id.slice(0, 8)}.${ext}`;
}

/**
 * Bundles every original photo plus a metadata CSV into one ZIP, built in the
 * browser. Photos are fetched a few at a time and streamed into the archive
 * to keep memory use down.
 */
export async function downloadAllAsZip(
  photos: GuestbookPhoto[],
  onProgress: (done: number, total: number) => void
): Promise<void> {
  const { Zip, ZipPassThrough, strToU8 } = await import("fflate");

  const chunks: BlobPart[] = [];
  let finished: () => void = () => {};
  let failed: (err: Error) => void = () => {};
  const done = new Promise<void>((resolve, reject) => {
    finished = resolve;
    failed = reject;
  });

  const zip = new Zip((err, chunk, final) => {
    if (err) return failed(err);
    chunks.push(chunk as BlobPart);
    if (final) finished();
  });

  const csv = new ZipPassThrough("guestbook.csv");
  zip.add(csv);
  csv.push(strToU8(csvForPhotos(photos)), true);

  let completed = 0;
  let next = 0;
  onProgress(0, photos.length);

  async function worker() {
    while (next < photos.length) {
      const index = next++;
      const photo = photos[index];
      const res = await fetch(photo.photo_url);
      if (!res.ok) throw new Error(`Failed to fetch photo ${photo.id}`);
      const data = new Uint8Array(await res.arrayBuffer());
      const entry = new ZipPassThrough(zipEntryName(photo, index));
      zip.add(entry);
      entry.push(data, true);
      completed++;
      onProgress(completed, photos.length);
    }
  }

  await Promise.all(Array.from({ length: 4 }, worker));
  zip.end();
  await done;

  const blob = new Blob(chunks, { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wedding-photos-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
