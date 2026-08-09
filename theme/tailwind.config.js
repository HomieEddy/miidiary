const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        primary: {
          DEFAULT: "rgb(var(--primary))",
          foreground: "rgb(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary))",
          foreground: "rgb(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent))",
          foreground: "rgb(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "rgb(var(--muted))",
          foreground: "rgb(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive))",
          foreground: "rgb(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "rgb(var(--card))",
          foreground: "rgb(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "rgb(var(--card))",
          foreground: "rgb(var(--card-foreground))",
        },
        border: "rgb(var(--border))",
        input: "rgb(var(--card))",
        ring: "rgb(var(--ring))",
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
        paper: "4px 4px 0px rgb(var(--shadow))",
        "paper-sm": "2px 2px 0px rgb(var(--shadow))",
      },
    },
  },
  plugins: [],
};
