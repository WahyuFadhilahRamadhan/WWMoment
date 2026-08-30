"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { getFilterClassName } from "@/lib/filters";
import type { FilterStyle, GuestbookPhoto } from "@/lib/types";

interface SlideshowProps {
  photos: GuestbookPhoto[];
  globalFilter: FilterStyle | "per-photo";
  intervalMs?: number;
}

export default function Slideshow({
  photos,
  globalFilter,
  intervalMs = 6000,
}: SlideshowProps) {
  const [index, setIndex] = useState(0);
  const safeIndex = photos.length === 0 ? 0 : index % photos.length;

  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [photos.length, intervalMs]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-cream/70 gap-3">
        <Heart className="h-10 w-10" />
        <p className="text-sm">Waiting for the first photo…</p>
      </div>
    );
  }

  const current = photos[safeIndex];
  const filterClass =
    globalFilter === "per-photo"
      ? getFilterClassName(current.filter_style)
      : getFilterClassName(globalFilter);

  return (
    <div className="relative flex-1 overflow-hidden bg-ink">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.photo_url}
            alt={`Photo from ${current.guest_name}`}
            className={`h-full w-full object-contain ${filterClass}`}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent px-8 pb-10 pt-24 text-center">
            <p className="font-serif text-2xl text-cream mb-2">
              {current.guest_name}
            </p>
            {current.message && (
              <p className="mx-auto max-w-2xl text-sm text-cream/85 leading-relaxed">
                &ldquo;{current.message}&rdquo;
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {photos.map((p, i) => (
          <span
            key={p.id}
            className={`h-1 rounded-full transition-all ${
              i === safeIndex ? "w-6 bg-gold" : "w-1.5 bg-cream/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
