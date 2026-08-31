import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CamCCUL's official brand color is blue, not the logo file's
        // rendered purple — confirmed by the user, who owns the brand.
        primary: {
          50: "#E8F0FE",
          100: "#D0E1FD",
          200: "#A1C3FB",
          300: "#72A5F9",
          400: "#4387F7",
          500: "#205295",
          600: "#1A4282",
          700: "#144272",
          800: "#0E3162",
          900: "#0A2647",
        },
        accent: {
          50: "#CCFBF1",
          100: "#99F6E4",
          200: "#5EEAD4",
          300: "#2DD4BF",
          400: "#14B8A6",
          500: "#0D9488",
          600: "#0F766E",
          700: "#115E59",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Lexend", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
