"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Images, ImagePlus, Loader2, X } from "lucide-react";
import FilterSelector from "./FilterSelector";
import SuccessModal from "./SuccessModal";
import { useGuestName } from "./GuestNameGate";
import { compressPhoto } from "@/lib/compressImage";
import { buildPhotoPath, uploadPhotoWithProgress } from "@/lib/uploadPhoto";
import { supabase, PHOTOS_TABLE } from "@/lib/supabase";
import type { FilterStyle } from "@/lib/types";

type Stage = "idle" | "compressing" | "uploading" | "saving";

export default function UploadForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { guestName, changeName } = useGuestName();
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filterStyle, setFilterStyle] = useState<FilterStyle>("original");

  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isSubmitting = stage !== "idle";

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    setFilterStyle("original");

    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }

  function resetPhoto() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFilterStyle("original");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetForm() {
    setMessage("");
    resetPhoto();
    setStage("idle");
    setProgress(0);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please choose or capture a photo first.");
      return;
    }

    setError(null);

    try {
      setStage("compressing");
      setProgress(0);
      const compressed = await compressPhoto(selectedFile);

      setStage("uploading");
      const path = buildPhotoPath(selectedFile.name);
      const photoUrl = await uploadPhotoWithProgress(
        compressed,
        path,
        setProgress
      );

      setStage("saving");
      const { error: insertError } = await supabase
        .from(PHOTOS_TABLE)
        .insert({
          guest_name: guestName,
          message: message.trim() || null,
          photo_url: photoUrl,
          filter_style: filterStyle,
        });

      if (insertError) throw insertError;

      setShowSuccess(true);
      setStage("idle");
      setProgress(0);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading. Please try again."
      );
      setStage("idle");
      setProgress(0);
    }
  }

  const stageLabel: Record<Exclude<Stage, "idle">, string> = {
    compressing: "Optimizing your photo…",
    uploading: `Uploading… ${progress}%`,
    saving: "Almost there…",
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 pt-10 pb-16">
      <header className="text-center mb-8">
        <p className="uppercase tracking-[0.3em] text-[11px] text-gold font-medium mb-3">
          Our Wedding Day
        </p>
        <h1 className="font-serif text-4xl text-emerald leading-tight mb-3">
          Share Your Moment
        </h1>
        <p className="text-sm text-ink/60 leading-relaxed">
          Snap a photo, leave a wish, and become part of our story.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo picker / preview */}
        <div>
          {!previewUrl ? (
            <div className="grid grid-cols-2 gap-3">
              <PickerButton
                icon={<Camera className="h-6 w-6" />}
                label="Take Photo"
                onClick={() => {
                  fileInputRef.current?.setAttribute("capture", "environment");
                  fileInputRef.current?.click();
                }}
              />
              <PickerButton
                icon={<ImagePlus className="h-6 w-6" />}
                label="Choose from Gallery"
                onClick={() => {
                  fileInputRef.current?.removeAttribute("capture");
                  fileInputRef.current?.click();
                }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-cream-deep shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className={`w-full aspect-[4/5] object-cover ${
                    filterStyleToClass(filterStyle)
                  }`}
                />
                <button
                  type="button"
                  onClick={resetPhoto}
                  disabled={isSubmitting}
                  className="absolute top-3 right-3 rounded-full bg-ink/50 backdrop-blur-sm p-1.5 text-cream hover:bg-ink/70 disabled:opacity-50"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <p className="text-xs font-medium text-ink/60 mb-2 px-0.5">
                  Choose a filter
                </p>
                <FilterSelector
                  previewSrc={previewUrl}
                  value={filterStyle}
                  onChange={setFilterStyle}
                />
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFilePicked}
          />
        </div>

        {/* Guest name (set once on first visit) */}
        <p className="px-0.5 text-center text-xs text-ink/60">
          Sharing as{" "}
          <span className="font-semibold text-emerald">{guestName}</span>
          {" · "}
          <button
            type="button"
            onClick={changeName}
            disabled={isSubmitting}
            className="underline underline-offset-2 hover:text-emerald disabled:opacity-50"
          >
            Not you?
          </button>
        </p>

        {/* Message */}
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1.5 px-0.5">
            Your Wishes
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Wishing you a lifetime of love and happiness…"
            rows={4}
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border border-cream-deep bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald disabled:opacity-60"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {isSubmitting && (
          <div>
            <div className="h-2 w-full rounded-full bg-cream-deep overflow-hidden">
              <motion.div
                className="h-full bg-emerald"
                initial={{ width: 0 }}
                animate={{
                  width:
                    stage === "uploading" ? `${progress}%` : "100%",
                }}
                transition={{ ease: "easeOut", duration: 0.25 }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-ink/60">
              {stageLabel[stage as Exclude<Stage, "idle">]}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedFile}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald text-cream py-3.5 text-sm font-medium tracking-wide shadow-md hover:bg-emerald-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Sharing…" : "Share Your Moment"}
        </button>

        <div className="flex items-center gap-3 pt-2" aria-hidden="true">
          <span className="h-px flex-1 bg-cream-deep" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-ink/40">
            or
          </span>
          <span className="h-px flex-1 bg-cream-deep" />
        </div>

        <Link
          href="/gallery"
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-emerald py-3.5 text-sm font-medium tracking-wide text-emerald transition-colors hover:bg-emerald-soft"
        >
          <Images className="h-4 w-4" />
          View Wedding Gallery
        </Link>
      </form>

      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        onUploadAnother={() => {
          setShowSuccess(false);
          resetForm();
        }}
      />
    </div>
  );
}

function filterStyleToClass(filter: FilterStyle) {
  switch (filter) {
    case "warm":
      return "filter-warm";
    case "soft":
      return "filter-soft";
    case "bw":
      return "filter-bw";
    case "vivid":
      return "filter-vivid";
    default:
      return "filter-original";
  }
}

function PickerButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald/25 bg-emerald-soft/50 py-8 text-emerald hover:bg-emerald-soft transition-colors"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
