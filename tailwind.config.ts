import type { Config } from "tailwindcss";
import { designTokens } from "./src/config/design-tokens";

const { colors, layout, motion, palettes, radii, shadows, typography } = designTokens;

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        institutional: colors.institutional,
        brand: colors.brand,
        forest: colors.forest,
        background: colors.background,
        surface: colors.surface,
        foreground: colors.foreground,
        muted: {
          DEFAULT: colors.muted,
          foreground: colors.mutedForeground,
        },
        border: colors.border,
        gold: {
          DEFAULT: colors.gold,
          strong: colors.goldStrong,
          subtle: colors.goldSubtle,
          foreground: colors.onGold,
        },
        success: { DEFAULT: colors.success, subtle: colors.successSubtle },
        warning: { DEFAULT: colors.warning, subtle: colors.warningSubtle },
        error: { DEFAULT: colors.error, subtle: colors.errorSubtle },
        primary: {
          DEFAULT: colors.brand,
          ...palettes.primary,
        },
        accent: {
          DEFAULT: colors.gold,
          ...palettes.accent,
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-lexend)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: Object.fromEntries(
        Object.entries(typography).map(([name, value]) => [
          name,
          [value.size, { lineHeight: value.lineHeight, letterSpacing: value.letterSpacing, fontWeight: value.weight }],
        ]),
      ),
      maxWidth: { content: layout.container, reading: layout.reading },
      spacing: {
        gutter: layout.gutter,
        section: layout.section,
        "section-sm": layout.sectionSm,
        "section-lg": layout.sectionLg,
        card: layout.cardPadding,
      },
      borderRadius: {
        control: radii.control,
        card: radii.card,
        panel: radii.panel,
        pill: radii.pill,
      },
      boxShadow: { card: shadows.card, raised: shadows.raised, focus: shadows.focus },
      transitionDuration: { fast: motion.fast, base: motion.base, slow: motion.slow },
      transitionTimingFunction: { standard: motion.standard, emphasized: motion.emphasized },
    },
  },
  plugins: [],
};

export default config;
