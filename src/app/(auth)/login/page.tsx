import { Suspense } from "react";
import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-background">
          <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
