import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08070F",
        surface: "#110F1E",
        accent: "#A020F0",
        glow: "#7C3AED",
        "text-primary": "#F4F0FF",
        "text-muted": "#8B80A8",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #CC44FF, #6B21F5)",
      },
      animation: {
        "marquee-left": "marquee-left 30s linear infinite",
        "marquee-right": "marquee-right 30s linear infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
      },
      keyframes: {
        "marquee-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}

export default config
