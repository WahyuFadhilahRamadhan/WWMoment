import { getFilterCss } from "./filters";
import type { FilterStyle, GuestbookPhoto } from "./types";

const COLORS = {
  cream: "#FDFBF6",
  emerald: "#1F4D3D",
  gold: "#C9A45C",
  ink: "#2a2a26",
};

function fileNameFor(photo: GuestbookPhoto, framed: boolean): string {
  const name = photo.guest_name.replace(/[^\w-]+/g, "_").slice(0, 30) || "guest";
  return `wedding-${name}-${photo.id.slice(0, 8)}${framed ? "-framed" : ""}.jpg`;
}

// Safari does not apply ctx.filter, so detect support instead of assuming it.
function supportsCanvasFilter(ctx: CanvasRenderingContext2D): boolean {
  ctx.filter = "grayscale(1)";
  const supported = ctx.filter === "grayscale(1)";
  ctx.filter = "none";
  return supported;
}

function cssFontFamily(variable: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value ? `${value}, ${fallback}` : fallback;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = words[i];
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);

  const consumed = lines.join(" ").split(" ").length;
  if (consumed < words.length) {
    let last = lines[lines.length - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

async function loadLogo(): Promise<ImageBitmap | null> {
  try {
    const res = await fetch("/icon.png");
    if (!res.ok) return null;
    return await createImageBitmap(await res.blob());
  } catch {
    return null;
  }
}

function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 24;
  ctx.save();
  ctx.translate(cx - 12 * s, cy - 12 * s);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(12, 21);
  ctx.bezierCurveTo(12, 21, 4.5, 16.4, 2.4, 11.8);
  ctx.bezierCurveTo(1, 8.6, 2.9, 5, 6.3, 5);
  ctx.bezierCurveTo(8.3, 5, 9.9, 6.1, 10.7, 7.6);
  ctx.lineTo(13.3, 7.6);
  ctx.bezierCurveTo(14.1, 6.1, 15.7, 5, 17.7, 5);
  ctx.bezierCurveTo(21.1, 5, 23, 8.6, 21.6, 11.8);
  ctx.bezierCurveTo(19.5, 16.4, 12, 21, 12, 21);
  ctx.closePath();
  ctx.restore();
}

/**
 * Renders the photo to a JPEG with the chosen filter baked in, optionally
 * inside a polaroid-style frame carrying the couple's names and the guest's
 * name and wish.
 */
export async function renderPhotoBlob(
  source: Blob,
  filter: FilterStyle | string,
  options: { framed: boolean; guestName?: string; message?: string | null }
): Promise<Blob> {
  const css = getFilterCss(filter);
  if (css === "none" && !options.framed) return source;

  const bitmap = await createImageBitmap(source);
  const photoW = bitmap.width;
  const photoH = bitmap.height;

  const u = photoW / 1000; // layout unit: 1000 units = photo width
  const pad = options.framed ? 45 * u : 0;

  const serif = cssFontFamily("--font-playfair", "Georgia, serif");
  const sans = cssFontFamily("--font-sans-body", "system-ui, sans-serif");
  if (options.framed) {
    await Promise.all([
      document.fonts.load(`700 40px ${serif}`),
      document.fonts.load(`600 40px ${serif}`),
      document.fonts.load(`400 30px ${sans}`),
    ]).catch(() => undefined);
  }

  // Measure the caption first so the canvas is exactly tall enough.
  const measure = document.createElement("canvas").getContext("2d");
  const message = options.message?.trim();
  let messageLines: string[] = [];
  if (options.framed && measure && message) {
    measure.font = `400 ${29 * u}px ${sans}`;
    messageLines = wrapText(measure, `“${message}”`, photoW * 0.88, 3);
  }
  const lineH = 42 * u;
  const captionH = options.framed
    ? (44 + 66 + 22 + 44 + 24 + 30 + 18 + 40 + (messageLines.length ? 14 + messageLines.length * 42 : 0) + 56) * u
    : 0;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(photoW + pad * 2);
  canvas.height = Math.round(photoH + pad * 2 + captionH);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return source;
  }

  if (options.framed) {
    ctx.fillStyle = COLORS.cream;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 3 * u;
    ctx.strokeRect(pad - 1.5 * u, pad - 1.5 * u, photoW + 3 * u, photoH + 3 * u);
  }

  if (css !== "none" && supportsCanvasFilter(ctx)) ctx.filter = css;
  ctx.drawImage(bitmap, pad, pad);
  ctx.filter = "none";
  bitmap.close();

  if (options.framed) {
    const cx = canvas.width / 2;
    let y = pad + photoH + 44 * u;

    const logo = await loadLogo();
    if (logo) {
      ctx.drawImage(logo, cx - 33 * u, y, 66 * u, 66 * u);
      logo.close();
    }
    y += 66 * u + 22 * u;

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = COLORS.emerald;
    ctx.font = `700 ${40 * u}px ${serif}`;
    ctx.fillText("The Wedding of Wahyu & Wanda", cx, y);
    y += 44 * u + 24 * u;

    // gold divider with a small heart
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.moveTo(cx - 190 * u, y + 15 * u);
    ctx.lineTo(cx - 30 * u, y + 15 * u);
    ctx.moveTo(cx + 30 * u, y + 15 * u);
    ctx.lineTo(cx + 190 * u, y + 15 * u);
    ctx.stroke();
    ctx.fillStyle = COLORS.gold;
    heartPath(ctx, cx, y + 15 * u, 26 * u);
    ctx.fill();
    y += 30 * u + 18 * u;

    ctx.fillStyle = COLORS.emerald;
    ctx.font = `600 ${34 * u}px ${serif}`;
    ctx.fillText(options.guestName?.trim() || "Guest", cx, y);
    y += 40 * u;

    if (messageLines.length) {
      y += 14 * u;
      ctx.fillStyle = "rgba(42, 42, 38, 0.72)";
      ctx.font = `400 ${29 * u}px ${sans}`;
      for (const line of messageLines) {
        ctx.fillText(line, cx, y);
        y += lineH;
      }
    }
  }

  const out = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );
  return out ?? source;
}

/**
 * Saves a photo to the guest's device. On phones this opens the native share
 * sheet (so it can go to the Photos gallery); elsewhere it falls back to a
 * normal file download.
 */
export async function savePhotoToDevice(
  photo: GuestbookPhoto,
  filter: FilterStyle | string,
  options: { framed: boolean }
): Promise<void> {
  const response = await fetch(photo.photo_url);
  if (!response.ok) throw new Error("Could not load the photo.");
  const finalBlob = await renderPhotoBlob(await response.blob(), filter, {
    framed: options.framed,
    guestName: photo.guest_name,
    message: photo.message,
  });
  const file = new File([finalBlob], fileNameFor(photo, options.framed), {
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
