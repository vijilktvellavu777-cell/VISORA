"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <aside
      className="flex shrink-0 flex-col border-r border-border bg-surface"
      style={{ width: `${SETTINGS_SECTION_SUBNAV_WIDTH_PX}px` }}
    >
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Icon size={18} className="text-foreground" strokeWidth={1.75} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
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
    </aside>
  );
}
