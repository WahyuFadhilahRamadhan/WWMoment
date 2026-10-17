import type { FilterStyle } from "./types";

export interface FilterPreset {
  id: FilterStyle;
  label: string;
  description: string;
  className: string;
  /** Same value as the matching .filter-* rule in globals.css; used to bake the filter into saved images. */
  css: string;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "original",
    label: "Original",
    description: "No filter",
    className: "filter-original",
    css: "none",
  },
  {
    id: "warm",
    label: "Warm Romance",
    description: "Warm, sepia-tinted glow",
    className: "filter-warm",
    css: "sepia(0.35) saturate(1.35) contrast(1.05) brightness(1.05) hue-rotate(-6deg)",
  },
  {
    id: "soft",
    label: "Soft Minimalist",
    description: "Bright, airy & soft contrast",
    className: "filter-soft",
    css: "brightness(1.12) contrast(0.92) saturate(0.95) blur(0.2px)",
  },
  {
    id: "bw",
    label: "Classic Monochrome",
    description: "Timeless black & white",
    className: "filter-bw",
    css: "grayscale(1) contrast(1.15) brightness(1.02)",
  },
  {
    id: "vivid",
    label: "Vivid Glow",
    description: "Boosted color & clarity",
    className: "filter-vivid",
    css: "saturate(1.6) contrast(1.15) brightness(1.03)",
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

export function getFilterCss(filter: FilterStyle | string): string {
  const preset = FILTER_PRESETS.find((f) => f.id === filter);
  return preset ? preset.css : "none";
}
