"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Heart } from "lucide-react";

const STORAGE_KEY = "wwmoment_guest_name";

interface GuestNameContextValue {
  guestName: string;
  changeName: () => void;
}

const GuestNameContext = createContext<GuestNameContextValue | null>(null);

export function useGuestName(): GuestNameContextValue {
  const ctx = useContext(GuestNameContext);
  if (!ctx) {
    throw new Error("useGuestName must be used inside <GuestNameGate>");
  }
  return ctx;
}

function readStoredName(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

function storeName(name: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // Storage unavailable (private mode): the name just won't persist.
  }
}

function clearStoredName() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

export default function GuestNameGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a client-only localStorage value after mount
    setGuestName(readStoredName());
    setReady(true);
  }, []);

  const changeName = useCallback(() => {
    clearStoredName();
    setDraft(guestName);
    setGuestName("");
  }, [guestName]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return;
    storeName(name);
    setGuestName(name);
  }

  if (!ready) {
    return <div className="flex-1" aria-busy="true" />;
  }

  if (!guestName) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-soft">
          <Heart className="h-7 w-7 fill-emerald text-emerald" />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
            Welcome
          </p>
          <h1 className="font-serif text-3xl leading-tight text-emerald">
            The Wedding of Wahyu &amp; Wanda
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            Please tell us your name first, so your photos and wishes are
            shared under it.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            autoFocus
            className="w-full rounded-xl border border-cream-deep bg-white/70 px-4 py-3 text-center text-sm text-ink placeholder:text-ink/30 focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/30"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="w-full rounded-full bg-emerald py-3 text-sm font-medium tracking-wide text-cream transition-colors hover:bg-emerald-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <GuestNameContext.Provider value={{ guestName, changeName }}>
      {children}
    </GuestNameContext.Provider>
  );
}
