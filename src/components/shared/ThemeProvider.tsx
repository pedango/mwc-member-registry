"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

/**
 * Defaults to light. Ignores OS preference so sign-in / first visit never
 * land in dark. Manual choice is stored under `mwc-theme`.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      {children}
      <ThemedToaster />
    </NextThemesProvider>
  );
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      position="top-center"
      closeButton
      offset={16}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
