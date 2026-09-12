"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { DEFAULT_SETTINGS_PATH, isSettingsNavActive, SETTINGS_NAV_SECTIONS } from "@/lib/settings-nav";

export function SettingsSubnav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <Link
          href="/"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground"
          aria-label="Close settings"
        >
          <X size={18} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        {SETTINGS_NAV_SECTIONS.map((section, sectionIndex) => {
          const SectionIcon = section.icon;
          return (
            <div key={section.id} className={sectionIndex > 0 ? "mt-6 border-t border-border pt-6" : ""}>
              <div className="mb-3 flex items-center gap-2 px-2">
                <SectionIcon size={16} className="text-foreground" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-foreground">{section.title}</span>
              </div>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isSettingsNavActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                          active
                            ? "border border-primary/25 bg-primary/[0.04] font-medium text-foreground"
                            : "border border-transparent text-foreground hover:bg-background"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.badge ? (
                          <span className="shrink-0 rounded-full bg-gradient-to-r from-[#f97316] to-[#a855f7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
