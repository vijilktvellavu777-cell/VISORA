"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FolderOpen,
  GitBranch,
  LayoutGrid,
  Link2,
  Mail,
  Smartphone,
} from "lucide-react";
import { isHubSectionPath, subnavPanelClassName, subnavPanelStyle } from "@/lib/subnav";

const SECTIONS = [
  {
    title: "Templates",
    items: [
      { href: "/content/templates/canvas", label: "Canvas", icon: GitBranch },
      { href: "/content/templates/content-blocks", label: "Content blocks", icon: LayoutGrid },
      { href: "/content/templates/in-app-messages", label: "In-app messages", icon: Smartphone },
      { href: "/content/templates/email", label: "Email", icon: Mail },
      { href: "/content/templates/push", label: "Push", icon: Bell },
    ],
  },
  {
    title: "Files",
    items: [
      { href: "/content/files/media-library", label: "Media Library", icon: FolderOpen },
      { href: "/content/files/link-table", label: "Link Table", icon: Link2 },
    ],
  },
] as const;

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ContentSubnav() {
  const pathname = usePathname();
  if (!isHubSectionPath(pathname, "/content")) return null;

  return (
    <aside className={subnavPanelClassName} style={subnavPanelStyle}>
      <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">Content</div>
      <div className="mt-3 flex flex-col gap-5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wide text-white/50">
              {section.title}
            </div>
            <nav className="mt-2 flex flex-col gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 ${
                      active ? "bg-white/10" : ""
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
