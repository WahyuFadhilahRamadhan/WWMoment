"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Quote, Trash2, X } from "lucide-react";
import { getFilterClassName } from "@/lib/filters";
import { downloadSinglePhoto } from "@/lib/downloadPhotos";
import type { FilterStyle, GuestbookPhoto } from "@/lib/types";

interface PhotoLightboxProps {
  photo: GuestbookPhoto | null;
  globalFilter: FilterStyle | "per-photo";
  isAdmin: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export default function PhotoLightbox({
  photo,
  globalFilter,
  isAdmin,
  onClose,
  onDelete,
}: PhotoLightboxProps) {
  const filterClass = photo
    ? globalFilter === "per-photo"
      ? getFilterClassName(photo.filter_style)
      : getFilterClassName(globalFilter)
    : "";

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-cream shadow-2xl"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 rounded-full bg-ink/50 backdrop-blur-sm p-1.5 text-cream hover:bg-ink/70"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {isAdmin && (
              <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => downloadSinglePhoto(photo)}
                  className="rounded-full bg-white/90 p-1.5 text-emerald shadow hover:bg-white"
                  aria-label="Download photo"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-full bg-white/90 p-1.5 text-red-600 shadow hover:bg-white"
                  aria-label="Delete photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.photo_url}
              alt={`Photo from ${photo.guest_name}`}
              className={`w-full max-h-[70vh] object-contain bg-ink ${filterClass}`}
            />

            <div className="px-5 py-4 text-center">
              <p className="font-serif text-lg text-emerald">
                {photo.guest_name}
              </p>
              {photo.message && (
                <p className="mt-1 flex items-start justify-center gap-1.5 text-sm text-ink/70 leading-relaxed">
                  <Quote className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gold" />
                  {photo.message}
                </p>
              )}
              <p className="mt-3 font-serif text-xs text-emerald/70">
                The Wedding of Wahyu &amp; Wanda
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
