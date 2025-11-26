import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: ".5625rem",
        md: ".375rem",
        sm: ".1875rem",
      },
      colors: {
        // Velvet Play Brand Colors
        velvet: {
          red: "#B00F2F",
          dark: "#8A0B24",
          light: "#D41243",
        },
        noir: {
          black: "#050509",
          deep: "#0A0A12",
          soft: "#12121E",
        },
        plum: {
          deep: "#3B0F5C",
          mid: "#5A1A8C",
          light: "#7B2CB3",
        },
        ember: {
          orange: "#FF5E33",
          glow: "#FF7E5A",
          dark: "#CC4A28",
        },
        neon: {
          magenta: "#FF008A",
          pink: "#FF2E6D",
          hot: "#FF4D8D",
        },
        champagne: {
          gold: "#E3C089",
          light: "#F0D4A8",
          dark: "#C9A66B",
        },
        heat: {
          pink: "#FF2E6D",
          warm: "#FF6B4A",
          hot: "#FF3333",
        },
        // Base theme colors
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)",
        },
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        display: ["var(--font-display)"],
      },
      boxShadow: {
        velvet: "0 4px 30px rgba(176, 15, 47, 0.3)",
        ember: "0 4px 30px rgba(255, 94, 51, 0.3)",
        neon: "0 4px 30px rgba(255, 0, 138, 0.4)",
        gold: "0 4px 20px rgba(227, 192, 137, 0.3)",
        "glow-sm": "0 0 10px currentColor",
        "glow-md": "0 0 20px currentColor",
        "glow-lg": "0 0 40px currentColor",
        "inner-glow": "inset 0 0 20px rgba(255, 0, 138, 0.2)",
      },
      backgroundImage: {
        "velvet-gradient": "linear-gradient(135deg, #3B0F5C 0%, #050509 50%, #B00F2F 100%)",
        "ember-gradient": "linear-gradient(180deg, #FF5E33 0%, #B00F2F 100%)",
        "neon-gradient": "linear-gradient(90deg, #FF008A 0%, #FF2E6D 50%, #FF5E33 100%)",
        "noir-gradient": "linear-gradient(180deg, #12121E 0%, #050509 100%)",
        "heat-gradient": "linear-gradient(90deg, #FF2E6D 0%, #FF5E33 50%, #FF008A 100%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
        "glass-overlay": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "ember-rise": "ember-rise 4s ease-out infinite",
        "heat-pulse": "heat-pulse 1.5s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(255, 0, 138, 0.4), 0 0 40px rgba(255, 0, 138, 0.2)",
            transform: "scale(1)",
          },
          "50%": { 
            boxShadow: "0 0 40px rgba(255, 0, 138, 0.6), 0 0 80px rgba(255, 0, 138, 0.3)",
            transform: "scale(1.02)",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "ember-rise": {
          "0%": { 
            transform: "translateY(100%) scale(0)",
            opacity: "0",
          },
          "10%": { 
            opacity: "1",
          },
          "90%": { 
            opacity: "1",
          },
          "100%": { 
            transform: "translateY(-100vh) scale(1)",
            opacity: "0",
          },
        },
        "heat-pulse": {
          "0%, 100%": { 
            opacity: "0.8",
            transform: "scale(1)",
          },
          "50%": { 
            opacity: "1",
            transform: "scale(1.05)",
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
