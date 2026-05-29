import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Gradient classes are generated dynamically (lib/colors.ts) — safelist them.
  safelist: [
    "from-green-900", "to-green-700",
    "from-blue-900", "to-blue-700",
    "from-purple-900", "to-purple-700",
    "from-red-900", "to-red-700",
    "from-orange-900", "to-orange-700",
    "from-teal-900", "to-teal-700",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
