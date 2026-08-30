import type { FilterStyle } from "./types";

export interface FilterPreset {
  id: FilterStyle;
  label: string;
  description: string;
  className: string;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "original",
    label: "Original",
    description: "No filter",
    className: "filter-original",
  },
  {
    id: "warm",
    label: "Warm Romance",
    description: "Warm, sepia-tinted glow",
    className: "filter-warm",
  },
  {
    id: "soft",
    label: "Soft Minimalist",
    description: "Bright, airy & soft contrast",
    className: "filter-soft",
  },
  {
    id: "bw",
    label: "Classic Monochrome",
    description: "Timeless black & white",
    className: "filter-bw",
  },
  {
    id: "vivid",
    label: "Vivid Glow",
    description: "Boosted color & clarity",
    className: "filter-vivid",
  },
];

export function getFilterClassName(filter: FilterStyle | string): string {
  const preset = FILTER_PRESETS.find((f) => f.id === filter);
  return preset ? preset.className : "filter-original";
}

export function getFilterLabel(filter: FilterStyle | string): string {
  const preset = FILTER_PRESETS.find((f) => f.id === filter);
  return preset ? preset.label : "Original";
}
