import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "390px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        15: "3.75rem",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          700: "hsl(var(--primary-700))",
          900: "hsl(var(--primary-900))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          soft: "hsl(var(--success-soft))",
          "soft-fg": "hsl(var(--success-soft-fg))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          soft: "hsl(var(--warning-soft))",
          "soft-fg": "hsl(var(--warning-soft-fg))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          soft: "hsl(var(--info-soft))",
          "soft-fg": "hsl(var(--info-soft-fg))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold) / <alpha-value>)",
          foreground: "hsl(var(--gold-foreground))",
          soft: "hsl(var(--gold-soft))",
          "soft-fg": "hsl(var(--gold-soft-fg))",
          bright: "hsl(var(--gold-bright) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          overlay: "hsl(var(--sidebar-overlay) / <alpha-value>)",
        },
        mwc: {
          blue: "hsl(var(--mwc-blue) / <alpha-value>)",
          gold: "hsl(var(--mwc-gold) / <alpha-value>)",
          goldBright: "hsl(var(--mwc-gold-bright) / <alpha-value>)",
          ink: "hsl(var(--mwc-ink) / <alpha-value>)",
          surface: "hsl(var(--mwc-surface) / <alpha-value>)",
          border: "hsl(var(--mwc-border) / <alpha-value>)",
          muted: "hsl(var(--mwc-muted) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 2px)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      fontSize: {
        /* Type scale (~4 roles): caption → body → section → title */
        caption: ["0.8125rem", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["0.9375rem", { lineHeight: "1.55", fontWeight: "400" }],
        section: ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }],
        title: ["1.875rem", { lineHeight: "1.2", fontWeight: "700" }],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        card: "var(--shadow-sm)",
        cardHover: "var(--shadow-md)",
        glass: "var(--shadow-lg)",
      },
      transitionDuration: {
        ui: "200ms",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
