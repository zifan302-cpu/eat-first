import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f0f8f1",
          100: "#d8ecd8",
          500: "#1f7a4f",
          700: "#155d3b"
        },
        tomato: "#d94d2b",
        amberline: "#f1a73a",
        butter: "#f7d35d",
        freezer: "#2776c9"
      },
      boxShadow: {
        soft: "0 10px 28px rgba(31, 45, 35, 0.09)"
      }
    }
  },
  plugins: []
} satisfies Config;
