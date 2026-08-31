import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type SocialPlatform = "facebook" | "twitter" | "linkedin" | "youtube";

const platformLabels: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

const sizeClasses: Record<"sm" | "md" | "lg", { button: string; icon: string }> = {
  sm: { button: "w-8 h-8", icon: "h-3.5 w-3.5" },
  md: { button: "w-10 h-10", icon: "h-5 w-5" },
  lg: { button: "w-12 h-12", icon: "h-6 w-6" },
};

// lucide-react ships no brand/logo icons (Facebook included), so the "f"
// mark is a plain inline SVG rather than a lucide import.
export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
    </svg>
  );
}

export function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 576 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
    </svg>
  );
}

interface SocialIconProps {
  platform: SocialPlatform;
  href: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Circular social icon button used in the Footer (and anywhere else a
// compact icon-only social link is needed). Facebook and YouTube render
// their actual glyphs; Twitter/LinkedIn have no real destination yet, so
// they fall back to a generic ExternalLink glyph as a "coming soon" cue —
// swap in a brand SVG (matching FacebookIcon's shape) once those links exist.
export function SocialIcon({ platform, href, size = "md", className }: SocialIconProps) {
  const { button, icon } = sizeClasses[size];
  const isPlaceholder = href === "#";

  return (
    <a
      href={href}
      target={isPlaceholder ? undefined : "_blank"}
      rel={isPlaceholder ? undefined : "noopener noreferrer"}
      aria-label={`Visit CamCCUL on ${platformLabels[platform]}`}
      className={cn(
        button,
        "bg-primary-800 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors text-white",
        className
      )}
    >
      {platform === "facebook" ? (
        <FacebookIcon className={icon} />
      ) : platform === "youtube" ? (
        <YoutubeIcon className={icon} />
      ) : (
        <ExternalLink className={icon} />
      )}
    </a>
  );
}
