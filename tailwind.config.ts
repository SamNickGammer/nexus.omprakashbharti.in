import type { Config } from "tailwindcss";

// Colors resolve to the CSS variables in app/globals.css — that file is the
// single source of truth for the theme (dark-only, Nexus-logo palette).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        surface: "var(--surface)",
        edge: "var(--edge)",
        "edge-bright": "var(--edge-bright)",
        text: "var(--text)",
        muted: "var(--muted)",
        dim: "var(--dim)",
        cyan: "var(--cyan)",
        blue: "var(--blue)",
        indigo: "var(--indigo)",
        violet: "var(--violet)",
        magenta: "var(--magenta)",
        ok: "var(--ok)",
        warn: "var(--warn)",
        hot: "var(--hot)",
        down: "var(--down)",
      },
      fontFamily: {
        mono: "var(--font-mono)",
      },
    },
  },
  plugins: [],
};

export default config;
