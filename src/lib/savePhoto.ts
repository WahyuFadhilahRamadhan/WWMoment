import { getFilterCss } from "./filters";
import type { FilterStyle, GuestbookPhoto } from "./types";

function fileNameFor(photo: GuestbookPhoto): string {
  const name = photo.guest_name.replace(/[^\w-]+/g, "_").slice(0, 30) || "guest";
  return `wedding-${name}-${photo.id.slice(0, 8)}.jpg`;
}

// Safari does not apply ctx.filter, so detect support instead of assuming it.
function supportsCanvasFilter(ctx: CanvasRenderingContext2D): boolean {
  ctx.filter = "grayscale(1)";
  const supported = ctx.filter === "grayscale(1)";
  ctx.filter = "none";
  return supported;
}

async function renderWithFilter(
  blob: Blob,
  filter: FilterStyle | string
): Promise<Blob> {
  const css = getFilterCss(filter);
  if (css === "none") return blob;

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx || !supportsCanvasFilter(ctx)) {
    bitmap.close();
    return blob;
  }

  ctx.filter = css;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const filtered = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );
  return filtered ?? blob;
}

/**
 * Saves a photo to the guest's device with the filter they see on screen.
 * On phones this opens the native share sheet (so it can go to the Photos
 * gallery); elsewhere it falls back to a normal file download.
 */
export async function savePhotoToDevice(
  photo: GuestbookPhoto,
  filter: FilterStyle | string
): Promise<void> {
  const response = await fetch(photo.photo_url);
  if (!response.ok) throw new Error("Could not load the photo.");
  const finalBlob = await renderWithFilter(await response.blob(), filter);
  const file = new File([finalBlob], fileNameFor(photo), {
    type: finalBlob.type || "image/jpeg",
  });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Share failed for another reason: fall through to a plain download.
    }
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
