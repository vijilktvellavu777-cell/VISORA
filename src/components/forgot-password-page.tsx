"use client";

import Link from "next/link";
import { useState } from "react";
import { inputClass } from "@/components/ui";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    setBusy(false);
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(typeof json.error === "string" ? json.error : "Could not send reset email.");
      return;
    }

    setMessage(
      typeof json.message === "string"
        ? json.message
        : "If an account with a verified email exists, we sent a password reset link to that address.",
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-[420px]">
        <h1 className="text-center text-2xl font-semibold text-foreground">Reset your password</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Enter the verified email on your account. We&apos;ll send a reset link to that address.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">Email address</span>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
          </label>

          {error ? <p className="text-sm text-error">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
