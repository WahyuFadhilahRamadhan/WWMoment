"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, X } from "lucide-react";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  onUploadAnother: () => void;
}

export default function SuccessModal({
  open,
  onClose,
  onUploadAnother,
}: SuccessModalProps) {
  useEffect(() => {
    if (!open) return;

    const duration = 1800;
    const end = Date.now() + duration;
    const colors = ["#1f4d3d", "#c9a45c", "#fdfbf6", "#2f6b52"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-sm rounded-3xl bg-cream border border-cream-deep shadow-2xl px-6 py-8 text-center"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-ink/40 hover:text-ink/70"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-soft">
              <Heart className="h-8 w-8 text-emerald fill-emerald" />
            </div>

            <h2 className="font-serif text-2xl text-emerald mb-2">
              Thank You!
            </h2>
            <p className="text-sm text-ink/70 leading-relaxed mb-6">
              Your photo and wishes have been added to the wedding
              guestbook. It will appear on the live gallery shortly.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onUploadAnother}
                className="w-full rounded-full bg-emerald text-cream py-3 text-sm font-medium tracking-wide hover:bg-emerald-light transition-colors"
              >
                Share Another Moment
              </button>
              <Link
                href="/gallery"
                className="w-full rounded-full border border-emerald/30 text-emerald py-3 text-sm font-medium tracking-wide hover:bg-emerald-soft transition-colors flex items-center justify-center"
              >
                View Live Gallery
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
