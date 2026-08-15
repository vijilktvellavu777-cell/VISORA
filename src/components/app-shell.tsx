"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Megaphone,
  GitBranch,
  FileText,
  KeyRound,
  PanelsTopLeft,
  BarChart3,
  KanbanSquare,
  Sparkles,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/audience", label: "Audience", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/canvas", label: "Canvas", icon: GitBranch },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/developer", label: "Developer", icon: KeyRound },
  { href: "/content", label: "Content", icon: PanelsTopLeft },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/planly", label: "Planly", icon: KanbanSquare },
  { href: "/bubu", label: "Bubu", icon: Sparkles },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-background">
      <aside className="border-r border-border bg-surface px-4 py-6 flex flex-col gap-8">
        <Link href="/" className="px-2">
          <div className="text-[11px] tracking-[0.28em] text-accent font-semibold">VISORA</div>
          <div className="text-lg font-semibold leading-tight text-foreground">Engagement</div>
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
                    : "text-foreground hover:bg-background"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-border bg-background p-3 text-xs text-muted">
          Workspace
          <div className="mt-1 text-sm text-foreground font-medium">VISORA</div>
        </div>
      </aside>
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
