/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0D10",
        surface: "#111419",
        "surface-elevated": "#171B21",
        border: "#262C35",
        foreground: "#F5F7FA",
        muted: "#9AA3AF",
        primary: {
          DEFAULT: "#6D5DFB",
          foreground: "#FFFFFF",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#38BDF8",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, 0.18)",
      },
    },
  },
  plugins: [],
};