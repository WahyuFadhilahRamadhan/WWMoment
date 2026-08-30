import imageCompression from "browser-image-compression";

/**
 * Compresses a guest-picked photo before upload: caps it at ~1.5MB and
 * 2560px on the long edge at 85% JPEG quality, which keeps it crisp at
 * projector/2K resolution while keeping mobile upload times low.
 */
export async function compressPhoto(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 2560,
    initialQuality: 0.85,
    useWebWorker: true,
    fileType: "image/jpeg",
  });
}
