import Link from "next/link";
import { GraduationCap, UserRound } from "lucide-react";
import { TutoBellLogo } from "@/components/tutobell/logo";

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3f8ff_0%,#ffffff_55%)]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/tutobell">
          <TutoBellLogo />
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-[#64748b] sm:inline">Already have an account?</span>
          <Link
            href="/tutobell/login"
            className="rounded-lg border border-[#2563eb] px-4 py-2 font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            Log in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="text-center text-4xl font-extrabold">Register</h1>
        <p className="mx-auto mt-3 max-w-lg text-center text-[#64748b]">
          Choose how you want to continue. You can register as a student or as a teacher.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link
            href="/tutobell/register/student"
            className="rounded-2xl border border-[#dbe7f7] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563eb] hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#16a34a]">
              <UserRound size={22} />
            </span>
            <h2 className="mt-5 text-lg font-bold">Continue as Student</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">
              Find teachers, join classes, and start learning.
            </p>
          </Link>

          <Link
            href="/tutobell/register/teacher"
            className="rounded-2xl border border-[#dbe7f7] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563eb] hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dbeafe] text-[#2563eb]">
              <GraduationCap size={22} />
            </span>
            <h2 className="mt-5 text-lg font-bold">Continue as Teacher</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">
              Share your knowledge, inspire students, and earn from your expertise.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
