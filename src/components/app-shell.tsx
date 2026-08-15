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
  Settings,
  ChevronDown,
} from "lucide-react";
import { WorkspaceTopBar } from "@/components/workspace-top-bar";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/audience", label: "Audience", icon: Users },
  { href: "/canvas", label: "Canvas", icon: GitBranch },
  { href: "/content", label: "Content", icon: PanelsTopLeft },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/developer", label: "Developer", icon: KeyRound },
  { href: "/planly", label: "Planny", icon: KanbanSquare },
  { href: "/bubu", label: "Bubu", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-background">
      <aside className="sticky top-0 flex h-screen flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-6 text-white">
        <Link href="/" className="shrink-0 px-2">
          <div className="text-[11px] font-semibold tracking-[0.28em] text-accent">VISORA</div>
          <div className="text-lg font-semibold leading-tight text-white">Engagement</div>
        </Link>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                  active
                    ? "bg-primary text-white"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 rounded-xl border border-white/15 bg-white/10 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                V
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-medium uppercase tracking-wide text-white/80">Workspace</div>
                <div className="truncate text-sm font-semibold text-white">VISORA</div>
              </div>
            </div>
            <ChevronDown size={14} className="shrink-0 text-white/80" />
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
