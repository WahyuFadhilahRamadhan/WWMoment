"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { distanceMeters, formatDistance, getVenueConfig } from "@/lib/geofence";

type Status =
  | "checking"
  | "allowed"
  | "denied"
  | "unsupported"
  | "out-of-range"
  | "error";

const venue = getVenueConfig();

export default function LocationGate({
  children,
  bypass = false,
}: {
  children: React.ReactNode;
  /** Skip the location check entirely, e.g. for admins. */
  bypass?: boolean;
}) {
  const [status, setStatus] = useState<Status>(
    bypass || !venue ? "allowed" : "checking"
  );
  const [distance, setDistance] = useState<number | null>(null);

  const checkLocation = useCallback(() => {
    if (bypass || !venue) {
      setStatus("allowed");
      return;
    }
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("checking");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const d = distanceMeters(
          position.coords.latitude,
          position.coords.longitude,
          venue.lat,
          venue.lng
        );
        setDistance(d);
        setStatus(d <= venue.radiusMeters ? "allowed" : "out-of-range");
      },
      (err) => {
        setStatus(
          err.code === err.PERMISSION_DENIED ? "denied" : "error"
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [bypass]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial permission/location check on mount
    checkLocation();
  }, [checkLocation]);

  if (status === "allowed") return <>{children}</>;

  if (status === "checking") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <MapPin className="h-8 w-8 text-emerald animate-pulse" />
        <p className="text-sm text-ink/60">Checking your location…</p>
      </div>
    );
  }

  const messages: Record<
    Exclude<Status, "allowed" | "checking">,
    { title: string; body: string }
  > = {
    "out-of-range": {
      title: "You're a bit far from the venue",
      body: `Photo uploads only work near the wedding venue${
        distance ? ` (you're about ${formatDistance(distance)} away)` : ""
      }. Come back once you're at the event to share your moment!`,
    },
    denied: {
      title: "Location access needed",
      body: "Please allow location access in your browser settings so we can confirm you're at the venue, then try again.",
    },
    unsupported: {
      title: "Location not supported",
      body: "Your browser doesn't support location checks. Please try a different browser or device.",
    },
    error: {
      title: "Couldn't get your location",
      body: "Something went wrong while checking your location. Please try again.",
    },
  };

  const msg = messages[status];

  return (
    <div className="mx-auto flex max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-soft">
        <MapPin className="h-7 w-7 text-emerald" />
      </div>
      <h1 className="font-serif text-xl text-emerald">{msg.title}</h1>
      <p className="text-sm text-ink/60 leading-relaxed">{msg.body}</p>
      <button
        type="button"
        onClick={checkLocation}
        className="flex items-center gap-2 rounded-full bg-emerald text-cream px-5 py-2.5 text-sm font-medium hover:bg-emerald-light transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
