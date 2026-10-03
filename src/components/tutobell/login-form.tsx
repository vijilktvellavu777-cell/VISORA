"use client";

import Link from "next/link";
import { useState } from "react";
import { TutoBellLogo } from "@/components/tutobell/logo";

export function TutoBellLoginForm() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f3f8ff_0%,#ffffff_55%)] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#dbe7f7] bg-white p-8 shadow-sm">
        <TutoBellLogo />
        <h1 className="mt-8 text-2xl font-extrabold">Log in</h1>
        <p className="mt-2 text-sm text-[#64748b]">Use the account you already created on TutoBell.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("Account log in will be connected when you send those details.");
          }}
        >
          <label className="block text-sm font-medium">
            Email address
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email address"
              className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] px-3 py-2.5 text-sm outline-none focus:border-[#2563eb]"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              name="password"
              required
              placeholder="Enter your password"
              className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] px-3 py-2.5 text-sm outline-none focus:border-[#2563eb]"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#2563eb] py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            Log in
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-[#475569]">{message}</p> : null}
        <p className="mt-5 text-center text-sm text-[#64748b]">
          New to TutoBell?{" "}
          <Link href="/tutobell/register" className="font-semibold text-[#2563eb]">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
