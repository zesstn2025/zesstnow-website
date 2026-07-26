import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#04050D",
        ink2: "#080A18",
        ink3: "#0D1026",
        violet: {
          DEFAULT: "#6D3BF5",
          light: "#A78BFA",
          deep: "#3B1D9E",
        },
        electric: {
          DEFAULT: "#22D3EE",
          light: "#67E8F9",
          deep: "#0E7490",
        },
        paper: "#E9EBFA",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        shell: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;
