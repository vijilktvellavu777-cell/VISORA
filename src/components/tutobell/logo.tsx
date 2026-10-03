import { BookOpen } from "lucide-react";

export function TutoBellLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-sm">
        <BookOpen size={18} strokeWidth={2.4} />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-[#0f172a]">TutoBell</span>
    </div>
  );
}
