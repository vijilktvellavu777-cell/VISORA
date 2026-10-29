"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PasswordInputField } from "@/components/password-input-field";
import { PasswordRequirementsList } from "@/components/password-requirements-list";
import { passwordRequirementStatus } from "@/lib/password-policy";

export function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requirementsMet = passwordRequirementStatus(password).every((item) => item.ok);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset link is invalid or expired.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!requirementsMet) {
      setError("Password does not meet the requirements.");
      return;
    }

    setBusy(true);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setBusy(false);

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(typeof json.error === "string" ? json.error : "Could not reset password.");
      return;
    }

    router.push("/login?reset=1");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-[420px]">
        <h1 className="text-center text-2xl font-semibold text-foreground">Choose a new password</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Your new password must meet all of the requirements below.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <PasswordInputField
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />

          <PasswordRequirementsList password={password} />

          <PasswordInputField
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Confirm password"
          />

          {error ? <p className="text-sm text-error">{error}</p> : null}

          <button
            type="submit"
            disabled={busy || !token}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {busy ? "Saving…" : "Update password"}
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
