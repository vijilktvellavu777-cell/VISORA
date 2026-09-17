"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { SUBNAV_WIDTH_PX } from "@/lib/subnav";
import {
  SETTINGS_CHANNELS_GROUP,
  SETTINGS_SIDEBAR_ORDER,
  sectionHref,
  type SettingsAccordionGroup,
} from "@/lib/settings-accordion-nav";
import { SETTINGS_AREAS } from "@/lib/settings-area-sections";

function isSectionActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, group: SettingsAccordionGroup) {
  return pathname === group.basePath || pathname.startsWith(`${group.basePath}/`);
}

function AccordionGroup({
  group,
  expanded,
  onToggle,
  pathname,
  nested,
}: {
  group: SettingsAccordionGroup;
  expanded: boolean;
  onToggle: () => void;
  pathname: string;
  nested?: boolean;
}) {
  const Icon = group.icon;
  const groupActive = isGroupActive(pathname, group);

  return (
    <div className={nested ? "ml-2 border-l border-border pl-2" : ""}>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold transition hover:bg-background ${
          groupActive && group.sections.length === 0 ? "text-foreground" : "text-foreground"
        }`}
        aria-expanded={expanded}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icon size={16} strokeWidth={1.75} className="shrink-0 text-foreground" />
          <span className="truncate">{group.title}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && group.sections.length > 0 ? (
        <ul className="mt-1 space-y-0.5 pb-2">
          {group.sections.map((section) => {
            const href = sectionHref(group.basePath, section.slug);
            const active = isSectionActive(pathname, href);
            return (
              <li key={section.slug}>
                <Link
                  href={href}
                  className={`block rounded-r-lg py-2 pl-3 pr-2 text-sm transition ${
                    active
                      ? "border-l-[3px] border-l-primary bg-primary/[0.08] font-medium text-foreground"
                      : "border-l-[3px] border-l-transparent text-foreground hover:bg-background"
                  } ${section.slug === "danger-zone" ? "text-foreground" : ""}`}
                >
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function ChannelsAccordion({
  pathname,
  openGroups,
  setOpenGroups,
}: {
  pathname: string;
  openGroups: Record<string, boolean>;
  setOpenGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const expanded = openGroups.channels ?? false;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpenGroups((prev) => ({ ...prev, channels: !expanded }))}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold text-foreground hover:bg-background"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <SETTINGS_CHANNELS_GROUP.icon size={16} strokeWidth={1.75} />
          Channels
        </span>
        <ChevronDown size={16} className={`text-muted transition ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded ? (
        <div className="mt-1 space-y-2 pb-2 pl-1">
          {SETTINGS_CHANNELS_GROUP.channelAreas.map((channel) => {
            const channelExpanded = openGroups[`channel-${channel.id}`] ?? isGroupActive(pathname, channel);
            const onChannel = isGroupActive(pathname, channel);
            return (
              <div key={channel.id}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [`channel-${channel.id}`]: !channelExpanded,
                    }))
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide ${
                    onChannel ? "text-primary" : "text-muted"
                  }`}
                >
                  {channel.title}
                  <ChevronDown size={14} className={`transition ${channelExpanded ? "rotate-180" : ""}`} />
                </button>
                {channelExpanded ? (
                  <ul className="mt-0.5 space-y-0.5">
                    {channel.sections.map((section) => {
                      const href = sectionHref(channel.basePath, section.slug);
                      const active = isSectionActive(pathname, href);
                      return (
                        <li key={section.slug}>
                          <Link
                            href={href}
                            className={`block rounded-r-lg py-2 pl-3 pr-2 text-sm ${
                              active
                                ? "border-l-[3px] border-l-primary bg-primary/[0.08] font-medium"
                                : "border-l-[3px] border-l-transparent hover:bg-background"
                            }`}
                          >
                            {section.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function SettingsAccordionSubnav() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const activeGroupId = useMemo(() => {
    if (pathname.startsWith("/settings/channels/")) return "channels";
    for (const entry of SETTINGS_SIDEBAR_ORDER) {
      if (entry.type !== "area") continue;
      const area = SETTINGS_AREAS[entry.id];
      if (area && isGroupActive(pathname, { ...area, sections: area.sections } as SettingsAccordionGroup)) {
        return entry.id;
      }
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    if (!activeGroupId) return;
    setOpenGroups((prev) => {
      const next = { ...prev, [activeGroupId]: true };
      if (activeGroupId === "channels") {
        for (const ch of SETTINGS_CHANNELS_GROUP.channelAreas) {
          if (isGroupActive(pathname, ch)) next[`channel-${ch.id}`] = true;
        }
      }
      return next;
    });
  }, [activeGroupId, pathname]);

  return (
    <aside
      className="flex shrink-0 flex-col border-r border-border bg-surface"
      style={{ width: `${SUBNAV_WIDTH_PX}px` }}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <Link
          href="/"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground"
          aria-label="Close Settings"
        >
          <X size={18} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {SETTINGS_SIDEBAR_ORDER.map((entry) => {
            if (entry.type === "channels") {
              return (
                <ChannelsAccordion
                  key="channels"
                  pathname={pathname}
                  openGroups={openGroups}
                  setOpenGroups={setOpenGroups}
                />
              );
            }
            const area = SETTINGS_AREAS[entry.id];
            if (!area) return null;
            const group: SettingsAccordionGroup = {
              id: area.id,
              title: area.title,
              icon: area.icon,
              basePath: area.basePath,
              sections: area.sections,
            };
            return (
              <AccordionGroup
                key={group.id}
                group={group}
                pathname={pathname}
                expanded={openGroups[group.id] ?? false}
                onToggle={() => setOpenGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
              />
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
