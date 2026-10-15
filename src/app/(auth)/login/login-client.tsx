"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      toast.success("Welcome back");
      window.location.assign(callbackUrl);
    } catch {
      setError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-background lg:flex-row">
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 sm:right-8 sm:top-8 lg:right-10">
        <ThemeToggle
          aria-label="Toggle dark mode"
          className="rounded-xl border border-border bg-card/80 shadow-sm backdrop-blur"
        />
      </div>

      {/* Left panel — leave structure as-is */}
      <aside className="relative h-36 w-full shrink-0 overflow-hidden xs:h-40 sm:h-52 md:h-64 lg:h-auto lg:min-h-dvh lg:w-[42%] xl:w-[46%] 3xl:w-[40%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/mwc-building.jpg"
          alt="Mamprobi Worship Center church building"
          className="absolute inset-0 h-full w-full object-cover object-[center_30%] lg:object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar/90 via-sidebar/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-8 xl:p-10">
          <div className="max-w-sm">
            <span
              className="mb-3 block h-1 w-10 rounded-full bg-gold sm:mb-4 sm:w-12"
              aria-hidden="true"
            />
            <p className="text-lg font-bold leading-snug tracking-tight text-white sm:text-xl lg:text-2xl xl:text-[1.75rem]">
              Mamprobi Worship Center
            </p>
            <p className="mt-1 text-sm font-normal text-white/80 sm:mt-1.5 lg:text-[0.9375rem]">
              A Citadel of Divine Glory
            </p>
          </div>
        </div>
      </aside>

      {/* Right panel — content block vertically + horizontally centered */}
      <main className="flex flex-1 flex-col justify-center bg-gradient-to-b from-background to-muted/40 px-4 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] xs:px-5 sm:px-10 lg:px-14 xl:px-20 3xl:px-28">
        <div className="mx-auto w-full max-w-[440px]">
          {/* Intro block: logo + heading grouped tightly */}
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo
              alt="Mamprobi Worship Center"
              className="mb-3 h-auto w-[42%] max-w-[152px]"
            />
            <h1 className="text-title font-bold tracking-tight text-primary">
              Sign in
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Manage church member records
            </p>
          </div>

          {/* Form: left-aligned labels/inputs inside the centered column */}
          <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className="h-11 w-full"
                placeholder="admin@mwc.org"
                aria-invalid={!!error}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <div className="relative w-full">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="h-11 w-full pr-11"
                  placeholder="••••••••"
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-ui hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div
              className="flex min-h-5 items-center gap-2"
              role="alert"
              aria-live="polite"
            >
              {error ? (
                <>
                  <AlertCircle
                    className="h-4 w-4 shrink-0 text-destructive"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-destructive">{error}</p>
                </>
              ) : null}
            </div>

            <Button
              type="submit"
              className="h-11 w-full text-[0.9375rem]"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center type-caption text-muted-foreground">
            Seeded administrators only. No public registration.
          </p>
        </div>
      </main>
    </div>
  );
}
