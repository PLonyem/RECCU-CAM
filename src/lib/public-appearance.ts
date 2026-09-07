import type { CSSProperties } from "react";

export const RECCUCAM_GREEN_APPEARANCE = {
  primaryColor: "#0D3D2E",
  secondaryColor: "#267A57",
  accentColor: "#C58B2A",
  surfaceColor: "#FFFFFF",
  buttonColor: "#0D3D2E",
  buttonHoverColor: "#082D22",
  footerBackgroundColor: "#082D22",
  overlayColor: "#0D3D2E",
  overlayOpacity: 68,
  backgroundColor: "#124C37",
} as const;

export interface PublicAppearance {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  surfaceColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  footerBackgroundColor: string;
}

export type PublicAppearanceStyle = CSSProperties & Record<`--brand-${string}`, string>;

export function publicAppearanceStyle(appearance?: Partial<PublicAppearance> | null): PublicAppearanceStyle {
  return {
    "--brand-primary": appearance?.primaryColor ?? RECCUCAM_GREEN_APPEARANCE.primaryColor,
    "--brand-secondary": appearance?.secondaryColor ?? RECCUCAM_GREEN_APPEARANCE.secondaryColor,
    "--brand-accent": appearance?.accentColor ?? RECCUCAM_GREEN_APPEARANCE.accentColor,
    "--brand-surface": appearance?.surfaceColor ?? RECCUCAM_GREEN_APPEARANCE.surfaceColor,
    "--brand-button": appearance?.buttonColor ?? RECCUCAM_GREEN_APPEARANCE.buttonColor,
    "--brand-button-hover": appearance?.buttonHoverColor ?? RECCUCAM_GREEN_APPEARANCE.buttonHoverColor,
    "--brand-footer": appearance?.footerBackgroundColor ?? RECCUCAM_GREEN_APPEARANCE.footerBackgroundColor,
  };
}
