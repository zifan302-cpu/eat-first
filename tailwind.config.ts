import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#EEF1E8",
          100: "#DCE3CE",
          500: "#526B45",
          700: "#344F3A"
        },
        tomato: "#D94A2F",
        carrot: "#D9771F",
        aubergine: "#57445F",
        mushroom: "#9A6555",
        butter: "#E7B84B",
        freezer: "#54758A",
        paper: {
          DEFAULT: "#F7EEDC",
          soft: "#FCF8ED",
          line: "#D8CBB5"
        },
        cream: "#F7EEDC",
        mint: "#DCE3CE",
        ink: {
          DEFAULT: "#203D2E",
          muted: "#6D746B"
        },
        berry: "#B95355"
      },
      boxShadow: {
        card: "4px 5px 0 rgba(32, 61, 46, 0.07)",
        lift: "6px 8px 0 rgba(32, 61, 46, 0.12)",
        inset: "inset 0 0 0 1px rgba(255, 255, 255, 0.55)"
      },
      fontFamily: {
        editorial: [
          "Aptos Display",
          "Segoe UI Variable Display",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
} satisfies Config;
