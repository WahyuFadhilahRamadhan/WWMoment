"use client";

import { Download, Quote } from "lucide-react";
import { getFilterClassName } from "@/lib/filters";
import { downloadSinglePhoto } from "@/lib/downloadPhotos";
import type { FilterStyle, GuestbookPhoto } from "@/lib/types";

interface PhotoCardProps {
  photo: GuestbookPhoto;
  globalFilter: FilterStyle | "per-photo";
  isAdmin: boolean;
  onClick?: () => void;
}

export default function PhotoCard({
  photo,
  globalFilter,
  isAdmin,
  onClick,
}: PhotoCardProps) {
  const filterClass =
    globalFilter === "per-photo"
      ? getFilterClassName(photo.filter_style)
      : getFilterClassName(globalFilter);

  return (
    <div className="group overflow-hidden rounded-xl border border-cream-deep bg-white shadow-sm">
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          className="block w-full aspect-square"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.photo_url}
            alt={`Photo from ${photo.guest_name}`}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${filterClass}`}
          />
        </button>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent px-3 pt-6 pb-2.5 text-cream">
          <p className="text-xs font-semibold truncate">{photo.guest_name}</p>
          {photo.message && (
            <p className="text-[11px] text-cream/85 line-clamp-1 flex items-start gap-1">
              <Quote className="h-2.5 w-2.5 shrink-0 mt-0.5" />
              {photo.message}
            </p>
          )}
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadSinglePhoto(photo);
            }}
            className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-emerald shadow hover:bg-white"
            aria-label="Download photo"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <p className="py-1.5 text-center font-serif text-[11px] text-emerald/80 truncate px-1">
        The Wedding of Wahyu &amp; Wanda
      </p>
    </div>
  );
}
