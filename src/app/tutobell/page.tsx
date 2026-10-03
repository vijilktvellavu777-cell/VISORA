import Link from "next/link";
import { TutoBellLogo } from "@/components/tutobell/logo";

export default function TutoBellHomePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f9ff_0%,#ffffff_42%)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <TutoBellLogo />
        <div className="flex items-center gap-3">
          <Link
            href="/tutobell/login"
            className="rounded-lg border border-[#2563eb] px-4 py-2 text-sm font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            Log in
          </Link>
          <Link
            href="/tutobell/register"
            className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2563eb]">Education</p>
          <h1 className="mt-3 text-5xl font-extrabold leading-tight text-[#0f172a]">
            Join <span className="text-[#2563eb]">TutoBell</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[#64748b]">
            Share your knowledge or start learning. Register to continue as a student or as a teacher.
          </p>
          <Link
            href="/tutobell/register"
            className="mt-8 inline-flex rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            Register
          </Link>
        </div>
        <div className="rounded-3xl border border-[#dbe7f7] bg-white p-8 shadow-[0_20px_50px_rgba(37,99,235,0.08)]">
          <h2 className="text-xl font-bold">How registration works</h2>
          <ol className="mt-6 space-y-4 text-sm text-[#475569]">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-xs font-bold text-white">1</span>
              Click Register.
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-bold text-[#2563eb]">2</span>
              Continue as a student or as a teacher.
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-bold text-[#2563eb]">3</span>
              Teachers start with basic information. The next steps come after that.
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
