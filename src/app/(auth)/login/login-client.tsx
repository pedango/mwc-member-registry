"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Welcome back");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#1a1c5c_0%,#2E3192_50%,#12143f_100%)]" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-mwc-gold/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel rounded-2xl p-8 text-white">
          <div className="mb-8 flex flex-col items-start text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/mwc-logo.png"
              alt="Mamprobi Worship Center"
              className="mb-5 h-20 w-20 rounded-xl object-cover shadow-lg ring-1 ring-white/20"
            />
            <h1 className="type-title text-white">
              Mamprobi Worship Center
            </h1>
            <p className="type-body mt-2 text-white/75">
              Sign in to manage church member records
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/30 bg-white text-mwc-ink"
                placeholder="admin@mwc.org"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/30 bg-white text-mwc-ink"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-left type-caption text-white/55">
            Seeded administrators only. No public registration.
          </p>
        </div>
      </div>
    </div>
  );
}
