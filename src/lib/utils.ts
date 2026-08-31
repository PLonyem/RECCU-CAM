import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCategory(category: string): string {
  return category.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#000000";
  return {
    r: parseInt(clean.slice(1, 3), 16),
    g: parseInt(clean.slice(3, 5), 16),
    b: parseInt(clean.slice(5, 7), 16),
  };
}

// The Homepage Editor's Overlay Color/Opacity controls render as a gradient
// anchored on the side the hero text sits on — matching the shape of the
// hero's fixed legibility scrim — rather than a flat wash across the whole
// photo. Shared by the live homepage and the admin editor's own live
// preview so the two stay pixel-identical.
export function heroOverlayGradient(
  hex: string,
  opacityPercent: number,
  angleDeg: number,
  fadeStartPercent: number,
  fadeEndPercent: number
): string {
  const { r, g, b } = hexToRgb(hex);
  const a = opacityPercent / 100;
  return `linear-gradient(${angleDeg}deg, rgba(${r},${g},${b},${a}) 0%, rgba(${r},${g},${b},${a}) ${fadeStartPercent}%, rgba(${r},${g},${b},0) ${fadeEndPercent}%)`;
}

// Detects seed/mock content that hasn't been replaced with real CamCCUL
// copy yet — bracket-wrapped filler (e.g. "[City Name]") or text that
// describes itself as a placeholder — so callers can hide it instead of
// ever showing it to site visitors.
export function isPlaceholder(value: string | null | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return true;
  if (trimmed.toLowerCase().includes("placeholder")) return true;
  return false;
}
