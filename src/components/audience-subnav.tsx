"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Filter, Blocks, Ban, Search, ArrowLeftRight } from "lucide-react";

const ITEMS = [
  { href: "/audience/segments", label: "Segments", icon: Filter },
  { href: "/audience/list-extensions", label: "List Extensions", icon: Blocks },
  { href: "/audience/suppression", label: "Suppression lists", icon: Ban },
  { href: "/audience/find", label: "Find Users", icon: Search },
  { href: "/audience/import-export", label: "Import and export users", icon: ArrowLeftRight },
];

export function AudienceSubnav() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 border-r border-sidebar-border bg-sidebar px-3 py-6">
      <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-muted">Audience</div>
      <nav className="mt-3 flex flex-col gap-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                active ? "bg-primary text-white" : "text-sidebar-foreground hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
