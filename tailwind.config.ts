import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // dense ops-console palette (SYNAPSE-style dark reference)
        panel: "#0e0f11",
        surface: "#151719",
        edge: "#26292d",
        accent: "#f97316",
      },
    },
  },
  plugins: [],
};

export default config;
