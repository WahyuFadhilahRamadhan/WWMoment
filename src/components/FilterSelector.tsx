"use client";

import { FILTER_PRESETS } from "@/lib/filters";
import type { FilterStyle } from "@/lib/types";

interface FilterSelectorProps {
  previewSrc: string;
  value: FilterStyle;
  onChange: (filter: FilterStyle) => void;
}

export default function FilterSelector({
  previewSrc,
  value,
  onChange,
}: FilterSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 px-0.5">
      {FILTER_PRESETS.map((preset) => {
        const isActive = value === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.id)}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <span
              className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${
                isActive
                  ? "border-emerald ring-2 ring-emerald/30 scale-105"
                  : "border-cream-deep"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt={preset.label}
                className={`h-full w-full object-cover ${preset.className}`}
              />
            </span>
            <span
              className={`text-[11px] font-medium leading-tight ${
                isActive ? "text-emerald" : "text-ink/60"
              }`}
            >
              {preset.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
