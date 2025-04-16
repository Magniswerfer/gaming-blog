import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#355C7D",
          dark: "#1F4E5F",
        },
        accent: {
          gold: "#F5D76E",
          earth: "#A07A3B",
        },
        background: {
          light: "#2E2E2E",
          dark: "#1E1E1E",
        },
      },
      fontFamily: {
        serif: ["Merriweather", "Playfair Display", "serif"],
        sans: ["Lato", "Inter", "sans-serif"],
      },
    },
  },
} satisfies Config;
