import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#3b82f6",
          light: "#93c5fd",
          dark: "#1e40af",
        },
        background: "#e0f2fe",
        foreground: "#1e3a8a",
        accent: "#22d3ee",
      },
    },
  },
  plugins: [],
};

export default config;
