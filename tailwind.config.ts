import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        stoic: {
          canvas: "#090A0F",
          surface: "#13141C",
          elevated: "#1C1E2B",
          border: "#232636",
          active: "#3B4261",
          gold: "#F59E0B",
          violet: "#6366F1",
          emerald: "#10B981",
          crimson: "#EF4444",
          cyan: "#06B6D4",
        },
      },
    },
  },
  plugins: [],
};

export default config;
