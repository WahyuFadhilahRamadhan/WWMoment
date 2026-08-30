"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { loginAdmin, logoutAdmin } from "@/lib/adminApi";

export default function AdminUnlockForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "unlocked">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("checking");
    setError("");

    const ok = await loginAdmin(code);
    if (ok) {
      setStatus("unlocked");
      setCode("");
    } else {
      setStatus("idle");
      setError("Incorrect passcode.");
    }
  }

  if (status === "unlocked") {
    return (
      <div className="w-full max-w-xs rounded-2xl bg-white border border-cream-deep shadow-sm px-6 py-7 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-soft">
          <ShieldCheck className="h-6 w-6 text-emerald" />
        </div>
        <h1 className="font-serif text-lg text-emerald mb-1">
          Admin Mode Active
        </h1>
        <p className="text-xs text-ink/60 mb-5">
          Download, delete, and CSV export controls are now enabled on the
          gallery, on this device only, for the next 12 hours.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/gallery"
            className="w-full rounded-full bg-emerald text-cream py-2.5 text-sm font-medium hover:bg-emerald-light transition-colors"
          >
            Go to Gallery
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logoutAdmin();
              setStatus("idle");
            }}
            className="w-full rounded-full border border-cream-deep text-ink/60 py-2.5 text-sm font-medium hover:bg-cream-deep transition-colors"
          >
            Log Out of Admin Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xs rounded-2xl bg-white border border-cream-deep shadow-sm px-6 py-7"
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-soft">
        <ShieldCheck className="h-6 w-6 text-emerald" />
      </div>
      <h1 className="text-center font-serif text-lg text-emerald mb-1">
        Admin Access
      </h1>
      <p className="text-center text-xs text-ink/60 mb-4">
        Enter the passcode to enable download, delete &amp; export controls
        on the gallery.
      </p>
      <input
        type="password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Passcode"
        autoFocus
        disabled={status === "checking"}
        className="w-full rounded-xl border border-cream-deep bg-white/70 px-4 py-2.5 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald disabled:opacity-60"
      />
      {error && (
        <p className="mt-2 text-center text-xs text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "checking"}
        className="mt-4 w-full rounded-full bg-emerald text-cream py-2.5 text-sm font-medium hover:bg-emerald-light transition-colors disabled:opacity-60"
      >
        {status === "checking" ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}
