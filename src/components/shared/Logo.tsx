"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /**
   * `auto` — dark logo in light theme, white in dark theme.
   * `on-dark` — always white (sidebar / photo overlays).
   * `on-light` — always dark (light panels).
   */
  variant?: "auto" | "on-dark" | "on-light";
  alt?: string;
};

/**
 * Theme-aware MWC mark. Uses the black PNG and CSS-inverts it on dark
 * surfaces (`invert(1) brightness(2)`). A pre-generated white asset also
 * lives at `public/logos/mwc-logo-white.png` for exports/favicons.
 */
export function Logo({
  className,
  variant = "auto",
  alt = "Mamprobi Worship Center",
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const useWhite =
    variant === "on-dark" ||
    (variant === "auto" && mounted && resolvedTheme === "dark");

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logos/mwc-logo.png"
      alt={alt}
      className={cn(
        "bg-transparent object-contain transition-[filter] duration-200",
        useWhite && "[filter:invert(1)_brightness(2)]",
        className
      )}
    />
  );
}
