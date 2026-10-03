import Link from "next/link";
import { TutoBellLogo } from "@/components/tutobell/logo";

export default function StudentRegisterPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3f8ff_0%,#ffffff_50%)]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/tutobell">
          <TutoBellLogo />
        </Link>
        <Link
          href="/tutobell/login"
          className="rounded-lg border border-[#2563eb] px-4 py-2 text-sm font-semibold text-[#2563eb]"
        >
          Log in
        </Link>
      </header>
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="text-3xl font-extrabold">Continue as Student</h1>
        <p className="mt-4 text-[#64748b]">
          The student registration form is next. Send those details and this page will be built to match.
        </p>
        <Link
          href="/tutobell/register"
          className="mt-8 inline-flex rounded-lg border border-[#cbd5e1] px-5 py-2.5 text-sm font-semibold text-[#334155] hover:bg-white"
        >
          Back to Register
        </Link>
      </main>
    </div>
  );
}
