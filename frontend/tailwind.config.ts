import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2E7D32", // Agriculture Green
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#1976D2", // Agriculture Blue
          foreground: "hsl(var(--secondary-foreground))",
        },
        // 2026 Modern Design System
        agriculture: {
          green: "#2E7D32",
          blue: "#1976D2",
          lightGreen: "#4CAF50",
          darkGreen: "#1B5E20",
          lightBlue: "#2196F3",
          darkBlue: "#0D47A1",
        },
        // Hero Gradients (2026 Trending)
        hero: {
          from: "#667eea",
          to: "#764ba2",
        },
        success: {
          from: "#11998e",
          to: "#38ef7d",
        },
        water: {
          from: "#00c6ff",
          to: "#0072ff",
        },
        warning: {
          from: "#ffecd2",
          to: "#fcb69f",
        },
        critical: {
          from: "#ff9a9e",
          to: "#fecfef",
        },
        // Background System
        space: "#0f0f23",
        cloud: "#f8fbff",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        water: {
          DEFAULT: "hsl(var(--water))",
          foreground: "hsl(var(--water-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
      },
      // 2026 Modern Shadows & Effects
      boxShadow: {
        'glass': '0px 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0px 8px 32px rgba(31, 38, 135, 0.37)',
        'glow': '0px 0px 20px rgba(102, 126, 234, 0.5)',
        'glow-green': '0px 0px 20px rgba(17, 153, 142, 0.5)',
        'glow-critical': '0px 0px 20px rgba(255, 154, 158, 0.5)',
        'neumo-light': '4px 4px 8px rgba(0,0,0,0.25), -4px -4px 8px rgba(255,255,255,0.8)',
        'neumo-inset': 'inset 4px 4px 8px rgba(0,0,0,0.25), inset -4px -4px 8px rgba(255,255,255,0.8)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        '2xl': '32px',
        '3xl': '64px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0px 0px 20px rgba(102, 126, 234, 0.5)',
            transform: 'scale(1)' 
          },
          '50%': { 
            boxShadow: '0px 0px 40px rgba(102, 126, 234, 0.8)',
            transform: 'scale(1.02)' 
          },
        },
        wave: {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(5deg)' },
          '75%': { transform: 'rotate(-5deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
