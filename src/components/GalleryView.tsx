"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Download, FolderArchive, Grid3x3, Loader2, Play } from "lucide-react";
import PhotoCard from "./PhotoCard";
import PhotoLightbox from "./PhotoLightbox";
import Slideshow from "./Slideshow";
import { supabase, PHOTOS_TABLE } from "@/lib/supabase";
import { downloadAllAsZip, exportMetadataCsv } from "@/lib/downloadPhotos";
import { deletePhotoAsAdmin } from "@/lib/adminApi";
import { FILTER_PRESETS } from "@/lib/filters";
import type { FilterStyle, GuestbookPhoto } from "@/lib/types";

type ViewMode = "grid" | "slideshow";
type GlobalFilter = FilterStyle | "per-photo";

interface GalleryViewProps {
  initialIsAdmin: boolean;
}

export default function GalleryView({ initialIsAdmin }: GalleryViewProps) {
  const [photos, setPhotos] = useState<GuestbookPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [globalFilter, setGlobalFilter] = useState<GlobalFilter>("per-photo");
  const [isAdmin] = useState(initialIsAdmin);
  const [zipProgress, setZipProgress] = useState<{ done: number; total: number } | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GuestbookPhoto | null>(
    null
  );

  const fetchPhotos = useCallback(async () => {
    const { data, error } = await supabase
      .from(PHOTOS_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPhotos(data as GuestbookPhoto[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount, not a render-time cascade
    fetchPhotos();

    const channel = supabase
      .channel("guestbook_photos_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: PHOTOS_TABLE },
        (payload) => {
          setPhotos((prev) => [payload.new as GuestbookPhoto, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPhotos]);

  async function handleDownloadZip() {
    if (zipProgress || photos.length === 0) return;
    setZipProgress({ done: 0, total: photos.length });
    try {
      await downloadAllAsZip(photos, (done, total) =>
        setZipProgress({ done, total })
      );
    } catch {
      window.alert("Failed to build the ZIP. Please try again.");
    } finally {
      setZipProgress(null);
    }
  }

  async function handleDeletePhoto(photo: GuestbookPhoto) {
    if (!isAdmin) return;
    const confirmed = window.confirm(
      `Delete this photo from ${photo.guest_name}? This cannot be undone.`
    );
    if (!confirmed) return;

    const ok = await deletePhotoAsAdmin(photo.id);
    if (ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setSelectedPhoto((current) =>
        current?.id === photo.id ? null : current
      );
    } else {
      window.alert("Failed to delete photo. Please try again.");
    }
  }

  const slideshowPhotos = [...photos].reverse();

  return (
    <div className="flex flex-1 flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-cream-deep px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1 rounded-full border border-cream-deep p-2 text-emerald hover:bg-emerald-soft"
              aria-label="Back to upload page"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="uppercase tracking-[0.25em] text-[10px] text-gold font-medium">
                Live Gallery
              </p>
              <h1 className="font-serif text-xl text-emerald leading-tight">
                Our Wedding Moments
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value as GlobalFilter)}
              className="rounded-full border border-cream-deep bg-white/70 px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald/30"
              aria-label="Global filter toggle"
            >
              <option value="per-photo">Per-photo filter</option>
              {FILTER_PRESETS.map((f) => (
                <option key={f.id} value={f.id}>
                  Force: {f.label}
                </option>
              ))}
            </select>

            <div className="flex rounded-full border border-cream-deep overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-emerald text-cream"
                    : "bg-white/70 text-emerald"
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("slideshow")}
                className={`p-2 ${
                  viewMode === "slideshow"
                    ? "bg-emerald text-cream"
                    : "bg-white/70 text-emerald"
                }`}
                aria-label="Slideshow view"
              >
                <Play className="h-4 w-4" />
              </button>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => exportMetadataCsv(photos)}
                className="flex items-center gap-1.5 rounded-full bg-emerald text-cream px-3 py-1.5 text-xs font-medium hover:bg-emerald-light"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={!!zipProgress || photos.length === 0}
                className="flex items-center gap-1.5 rounded-full border border-emerald px-3 py-1.5 text-xs font-medium text-emerald hover:bg-emerald-soft disabled:opacity-60"
              >
                {zipProgress ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FolderArchive className="h-3.5 w-3.5" />
                )}
                {zipProgress
                  ? `${zipProgress.done}/${zipProgress.total}`
                  : "Download ZIP"}
              </button>
            )}
          </div>
        </div>
      </header>

      {viewMode === "grid" ? (
        <div className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
          {loading ? (
            <p className="text-center text-sm text-ink/50 py-16">
              Loading photos…
            </p>
          ) : photos.length === 0 ? (
            <p className="text-center text-sm text-ink/50 py-16">
              No photos yet — be the first to share a moment!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  globalFilter={globalFilter}
                  isAdmin={isAdmin}
                  onClick={() => setSelectedPhoto(photo)}
                  onDelete={() => handleDeletePhoto(photo)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Slideshow photos={slideshowPhotos} globalFilter={globalFilter} />
      )}

      <PhotoLightbox
        photo={selectedPhoto}
        globalFilter={globalFilter}
        isAdmin={isAdmin}
        onClose={() => setSelectedPhoto(null)}
        onDelete={() => selectedPhoto && handleDeletePhoto(selectedPhoto)}
      />
    </div>
  );
}
