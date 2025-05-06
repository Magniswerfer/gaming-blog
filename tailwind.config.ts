import { type Config } from "tailwindcss";
import type { PluginAPI } from "tailwindcss/types/config";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#355C7D",
        secondary: "#1F4E5F",
        accent: {
          gold: "#F5D76E",
          earth: "#A07A3B",
        },
        black: "#1A1A1A",
        white: "#FAFAF8",
        background: {
          light: "#FAFAF8",
          dark: "#F0F0ED",
        },
      },
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        title: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        title: "0.2em",
      },
      textDecorationThickness: {
        DEFAULT: "0.5px",
      },
      textUnderlineOffset: {
        DEFAULT: "2px",
      },
    },
  },
  plugins: [
    function ({ addBase }: PluginAPI) {
      addBase({
        "a": {
          "@apply transition-colors": {},
        },
        "a:hover": {
          "@apply underline": {},
        },
      });
    },
  ],
} satisfies Config;
