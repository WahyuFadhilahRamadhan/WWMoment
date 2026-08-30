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
