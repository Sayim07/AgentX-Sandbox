/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#090D16",
          dark: "#05070D",
          card: "#0F172A",
          border: "#1E293B",
        },
        neon: {
          cyan: "#00F0FF",
          emerald: "#00FF9D",
          blue: "#3B82F6",
          pink: "#FF007A",
          purple: "#A855F7",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.25)',
        'neon-emerald': '0 0 15px rgba(0, 255, 157, 0.25)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.25)',
      },
    },
  },
  plugins: [],
};
