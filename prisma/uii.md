# Cursor AI Prompt — Typography / Font Implementation for MWC Church Management System

## Goal

Implement a consistent, professional typography system across the entire MWC (Mamprobi Worship Center) Church Management System using **Inter** as the primary typeface. The app is an admin-only data-management tool, so the priorities are legibility at small sizes, clean number rendering in tables and stat cards, and a neutral, professional feel. Do not add new features — this is a typography/styling pass only.

## Font Choice

- **Primary (and only) typeface:** Inter — used across the whole app for both headings and body/data.
- Load it via `next/font/google` for optimal performance (self-hosted, no layout shift, `display: swap`).
- Fallback stack: `system-ui, -apple-system, sans-serif`.

## Implementation Steps

### 1. Load Inter in the root layout

In `src/app/layout.tsx`:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

### 2. Set Inter as the default sans font in Tailwind

In `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
};

export default config;
```

Ensure `antialiased` is applied globally (on `body`) for crisper rendering.

### 3. Define a consistent type scale

Standardize typography so no more than ~4 active text sizes/roles are used. Apply these consistently across all pages via reusable classes or component styles:

- **Page title (h1):** ~24–30px, font-semibold/bold, tight leading
- **Section heading (h2):** ~18–20px, font-semibold
- **Body / data:** ~14–16px, font-normal, leading-relaxed (~1.5)
- **Label / caption:** ~12–13px, font-medium, muted gray (`text-gray-500`), often uppercase with slight letter-spacing for form field labels

Use **weight and size** to signal hierarchy — not color alone. Keep body text at a comfortable line-height (~1.5) and ensure WCAG AA contrast throughout.

### 4. Tabular numbers for aligned data (important)

Enable tabular (monospaced) figures wherever numbers appear in columns or need to align — member tables, stat cards, counts, pagination, logs. This keeps digits vertically aligned and improves scannability.

- Add the Tailwind `tabular-nums` utility class to:
  - Table cells containing numbers
  - Dashboard stat-card numbers
  - Assembly counts and member counts
  - Any numeric/date columns in logs
- Equivalent CSS: `font-variant-numeric: tabular-nums;`

Optionally create a small utility or component (e.g. a `<Stat>` or `<NumericCell>` wrapper) that applies `tabular-nums` so it stays consistent.

### 5. Apply consistently everywhere

Roll the type scale and font across **every existing page**: login, dashboard, members list, member profile, add/edit member form, assemblies, bulk upload, users, and logs. Refactor existing components to use the standardized classes rather than one-off inline font sizes. Centralize where possible so the system stays consistent.

## Constraints

- Use **Inter only** — do not introduce a second font family.
- Do not add new features, pages, or colors.
- Keep changes to typography, font loading, and number rendering.
- Produce clean, production-ready TypeScript/React.

## Deliverable

Inter loaded via `next/font`, set as the Tailwind default sans, a consistent type scale applied app-wide, and `tabular-nums` applied to all numeric/tabular data. Note any reusable helpers created (e.g. a numeric cell or stat component).