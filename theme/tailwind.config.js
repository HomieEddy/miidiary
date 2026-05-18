const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FDF8F0",
        foreground: "#2A2631",
        primary: {
          DEFAULT: "#FF6B9E",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFD166",
          foreground: "#2A2631",
        },
        accent: {
          DEFAULT: "#06D6A0",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F0E9DF",
          foreground: "#8A828F",
        },
        destructive: "#EF476F",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2A2631",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#2A2631",
        },
        border: "#2A2631",
        input: "#FFFFFF",
        ring: "#FF6B9E",
        chart: {
          1: "#FF6B9E",
          2: "#FFD166",
          3: "#06D6A0",
          4: "#118AB2",
          5: "#F77F00",
        },
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
        heading: ["Fredoka", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xs: "16px",
        sm: "20px",
        md: "22px",
        lg: "24px",
        xl: "28px",
        "2xl": "32px",
        "3xl": "40px",
        "4xl": "48px",
      },
      boxShadow: {
        paper: "4px 4px 0px #2A2631",
        "paper-sm": "2px 2px 0px #2A2631",
      },
    },
  },
  plugins: [],
};
