import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        cream: {
          50: "#FFF9F1",
          100: "#FDF4E7",
          200: "#F0E3D2",
          300: "#E6D5B8",
          400: "#D6BE93",
        },
        brand: {
          orange: {
            DEFAULT: "#FF6500",
            light: "#FF8A00",
            dark: "#E04800",
            soft: "#FFF2EA",
          },
          red: {
            DEFAULT: "#B91C1C",
            dark: "#881337",
            soft: "#FEE2E2",
          },
          dark: "#35251D",
          charcoal: "#35251D",
          muted: "#81746A",
          border: "#F0E3D2",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-calistoga)", "Georgia", "serif"],
      },
      boxShadow: {
        snack: "0 10px 30px -5px rgba(255, 92, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px -2px rgba(41, 37, 36, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        elevated: "0 20px 40px -10px rgba(41, 37, 36, 0.15)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

