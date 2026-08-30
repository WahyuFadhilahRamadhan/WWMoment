"use client";

import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";

interface AdminGateProps {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE;

export default function AdminGate({ open, onClose, onUnlock }: AdminGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ADMIN_PASSCODE) {
      setError("Admin passcode is not configured for this deployment.");
      return;
    }
    if (code === ADMIN_PASSCODE) {
      setError("");
      setCode("");
      onUnlock();
    } else {
      setError("Incorrect passcode.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xs rounded-2xl bg-cream border border-cream-deep shadow-2xl px-6 py-7"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-ink/40 hover:text-ink/70"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-soft">
          <ShieldCheck className="h-6 w-6 text-emerald" />
        </div>
        <h3 className="text-center font-serif text-lg text-emerald mb-1">
          Admin Access
        </h3>
        <p className="text-center text-xs text-ink/60 mb-4">
          Enter the passcode to download photos and export guestbook data.
        </p>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Passcode"
          autoFocus
          className="w-full rounded-xl border border-cream-deep bg-white/70 px-4 py-2.5 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
        />
        {error && (
          <p className="mt-2 text-center text-xs text-red-600">{error}</p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-emerald text-cream py-2.5 text-sm font-medium hover:bg-emerald-light transition-colors"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
