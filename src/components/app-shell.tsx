"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Filter,
  Megaphone,
  GitBranch,
  FileText,
  KeyRound,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/audience", label: "Audience", icon: Users },
  { href: "/segments", label: "Segments", icon: Filter },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/canvas", label: "Canvas", icon: GitBranch },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/developer", label: "Developer", icon: KeyRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r border-[#262c3a] bg-[#0e1118] px-4 py-6 flex flex-col gap-8">
        <Link href="/" className="px-2">
          <div className="text-[11px] tracking-[0.28em] text-[#8b7dff] font-semibold">VISORA</div>
          <div className="text-lg font-semibold leading-tight">Engagement</div>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                  active ? "bg-[#6d5efc] text-white" : "text-[#c5cbd8] hover:bg-[#181c26]"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-[#262c3a] bg-[#12151c] p-3 text-xs text-[#8b95a8]">
          Workspace
          <div className="mt-1 text-sm text-[#e8ecf4] font-medium">VISORA</div>
        </div>
      </aside>
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
