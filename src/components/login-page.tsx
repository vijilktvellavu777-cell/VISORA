"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Libre_Baskerville } from "next/font/google";
import { inputClass } from "@/components/ui";
import { PasswordInputField } from "@/components/password-input-field";
import { isValidLoginIdentifier } from "@/lib/login-identifier";

const tagline = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["700"],
});

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetComplete = searchParams.get("reset") === "1";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    if (!isValidLoginIdentifier(username)) {
      setBusy(false);
      setError("Enter a valid email address or username.");
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    setBusy(false);
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(typeof json.error === "string" ? json.error : "Sign in failed");
      return;
    }

    router.push(searchParams.get("next") || "/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <section className="relative hidden w-[42%] overflow-hidden bg-[#2f064f] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#5b21b6]/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#7c3aed]/30 blur-3xl" />
          <div className="absolute bottom-24 left-12 h-64 w-[120%] -rotate-6 rounded-[40%] bg-[#4c1d95]/50" />
          <div className="absolute bottom-8 left-0 h-48 w-[130%] rotate-3 rounded-[45%] bg-[#6d28d9]/35" />
        </div>

        <div className="relative z-10 p-10">
          <div className="text-3xl font-semibold tracking-tight text-white">visora</div>
        </div>

        <div className="relative z-10 px-10 pb-16">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-sm">
            <div className="aspect-[4/3] bg-gradient-to-br from-[#ddd6fe] via-[#c4b5fd] to-[#a78bfa]" />
          </div>
          <h1 className={`${tagline.className} mt-10 text-5xl leading-tight text-white`}>
            Be Absolutely Engaging.<sup className="text-lg">™</sup>
          </h1>
        </div>
      </section>

      <section className="flex min-h-screen flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[420px]">
          <h2 className="text-center text-2xl font-semibold text-foreground">Sign In to VISORA</h2>
          {resetComplete ? (
            <p className="mt-3 text-center text-sm text-success">Your password was updated. Sign in with your new password.</p>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Username</span>
              <input
                className={inputClass}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="Enter your username or email"
                required
              />
              <span className="mt-1 block text-xs text-muted">Email address or unique username</span>
            </label>

            <PasswordInputField
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            {error ? <p className="text-sm text-error">{error}</p> : null}

            <div className="text-center">
              <Link href="/login/forgot" className="text-sm font-medium text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
