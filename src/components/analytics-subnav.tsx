"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  DollarSign,
  Filter,
  Hammer,
  LayoutTemplate,
  LineChart,
  Megaphone,
  MousePointerClick,
  Target,
} from "lucide-react";

const SECTIONS = [
  {
    title: "Reports",
    items: [
      { href: "/analytics/reports/report-builder", label: "Report builder", icon: Hammer },
      { href: "/analytics/reports/custom-event-report", label: "Custom event report", icon: MousePointerClick },
      { href: "/analytics/reports/engagement-report", label: "Engagement report", icon: LineChart },
      { href: "/analytics/reports/revenue-report", label: "Revenue report", icon: DollarSign },
      { href: "/analytics/reports/segment-report", label: "Segment report", icon: Filter },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/analytics/performance/campaign-performance", label: "Campaign performance", icon: Megaphone },
      { href: "/analytics/performance/conversions", label: "Conversions", icon: Target },
    ],
  },
  {
    title: "Data build",
    items: [
      { href: "/analytics/data-build/custom-report", label: "Custom report", icon: BarChart3 },
      { href: "/analytics/data-build/designs", label: "Designs", icon: LayoutTemplate },
    ],
  },
] as const;

export function AnalyticsSubnav() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 border-r border-sidebar-border bg-sidebar px-3 py-6">
      <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-muted">Analytics</div>
      <div className="mt-3 flex flex-col gap-5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wide text-sidebar-muted/80">
              {section.title}
            </div>
            <nav className="mt-2 flex flex-col gap-1">
              {section.items.map((item) => {
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
          </div>
        ))}
      </div>
    </aside>
  );
}
