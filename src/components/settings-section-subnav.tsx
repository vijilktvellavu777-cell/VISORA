"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SettingsAreaSection } from "@/lib/settings-area-sections";

export const SETTINGS_SECTION_SUBNAV_WIDTH_PX = 240;

type SettingsSectionSubnavProps = {
  title: string;
  icon: LucideIcon;
  basePath: string;
  sections: SettingsAreaSection[];
};

export function SettingsSectionSubnav({ title, icon: Icon, basePath, sections }: SettingsSectionSubnavProps) {
  const pathname = usePathname();
  const onSectionRoute = pathname.startsWith(`${basePath}/`);
  const [expanded, setExpanded] = useState(onSectionRoute);

  useEffect(() => {
    if (onSectionRoute) setExpanded(true);
  }, [onSectionRoute]);

  return (
    <aside
      className="flex shrink-0 flex-col border-r border-border bg-surface"
      style={{ width: `${SETTINGS_SECTION_SUBNAV_WIDTH_PX}px` }}
    >
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center justify-between gap-2 border-b border-border px-5 py-4 text-left hover:bg-background"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <Icon size={18} className="text-foreground" strokeWidth={1.75} />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded ? (
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {sections.map((section) => {
              const href = `${basePath}/${section.slug}`;
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={section.slug}>
                  <Link
                    href={href}
                    className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                      active
                        ? "border border-primary/25 bg-primary/[0.04] font-medium text-foreground"
                        : "border border-transparent text-foreground hover:bg-background"
                    }`}
                  >
                    {section.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </aside>
  );
}
