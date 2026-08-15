"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Megaphone,
  GitBranch,
  KeyRound,
  PanelsTopLeft,
  BarChart3,
  KanbanSquare,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { WorkspaceTopBar } from "@/components/workspace-top-bar";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/audience", label: "Audience", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/canvas", label: "Canvas", icon: GitBranch },
  { href: "/content", label: "Content", icon: PanelsTopLeft },
  { href: "/developer", label: "Developer", icon: KeyRound },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/planly", label: "Planly", icon: KanbanSquare },
  { href: "/bubu", label: "Bubu", icon: Sparkles },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-background">
      <aside className="flex flex-col gap-8 border-r border-sidebar-border bg-sidebar px-4 py-6 text-white">
        <Link href="/" className="px-2">
          <div className="text-[11px] font-semibold tracking-[0.28em] text-accent">VISORA</div>
          <div className="text-lg font-semibold leading-tight text-white">Engagement</div>
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
                  active
                    ? "bg-primary text-white"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon size={16} className={active ? "text-white" : "text-white"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-sidebar-border bg-white/5 p-3 text-xs text-white/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                V
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-white/60">Workspace</div>
                <div className="text-sm font-medium text-white">VISORA</div>
              </div>
            </div>
            <ChevronDown size={14} className="text-white/60" />
          </div>
        </div>
      </aside>
      <div className="flex min-h-screen min-w-0 flex-col">
        <WorkspaceTopBar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
