import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#3B82F6",
          400: "#2563EB",
          500: "#003D82",
          600: "#003472",
          700: "#2D3E5F",
          800: "#1F2E47",
          900: "#0A0E27",
        },
        status: {
          open: "#3B82F6",
          pending: "#F59E0B",
          approved: "#10B981",
          declined: "#EF4444",
          completed: "#6B7280",
        },
        priority: {
          high: "#DC2626",
          medium: "#F59E0B",
          low: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Roboto", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "elevation-1": "0 1px 3px rgba(0, 0, 0, 0.1)",
        "elevation-2": "0 4px 6px rgba(0, 0, 0, 0.1)",
        "elevation-3": "0 10px 15px rgba(0, 0, 0, 0.1)",
        "elevation-4": "0 20px 25px rgba(0, 0, 0, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
