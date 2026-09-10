import { Suspense } from "react";
import { LoginPage } from "@/components/login-page";

export default function LoginRoutePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading…</div>}>
      <LoginPage />
    </Suspense>
  );
}
