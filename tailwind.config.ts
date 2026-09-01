import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EEF7F2",
          100: "#D7EBDF",
          200: "#ADD7C0",
          300: "#7CBA99",
          400: "#4A9871",
          500: "#267A57",
          600: "#185F43",
          700: "#124C37",
          800: "#0D3D2E",
          900: "#082D22",
        },
        accent: {
          50: "#FFF9EB",
          100: "#FCEEC7",
          200: "#F8DB8A",
          300: "#F0C351",
          400: "#DDA62F",
          500: "#C58B2A",
          600: "#A56920",
          700: "#83501E",
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
