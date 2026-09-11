"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  Flame,
  Library,
  NotebookPen,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { HeaderIconTooltip } from "@/components/header-icon-tooltip";

const COMMUNITY_LINKS = {
  bonfire: "https://community.visora.app",
  blog: "https://visora.app/blog",
  caseStudies: "https://visora.app/customers",
  roadmap: "https://visora.app/roadmap",
} as const;

function CommunityMenuItem({
  href,
  external,
  showExternalIcon = true,
  icon,
  title,
  description,
  onNavigate,
}: {
  href: string;
  external?: boolean;
  showExternalIcon?: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onNavigate?: () => void;
}) {
  const className =
    "flex w-full gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-background";

  const content = (
    <>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
          {title}
          {external && showExternalIcon ? <ExternalLink size={14} className="text-muted" aria-hidden /> : null}
        </span>
        <span className="mt-1 block text-sm leading-snug text-muted">{description}</span>
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {content}
    </Link>
  );
}

export function CommunityMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id="visora-flame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>

      <HeaderIconTooltip label="Community">
        <button
          type="button"
          aria-label="Community"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
        >
          <Users size={18} strokeWidth={1.75} />
        </button>
      </HeaderIconTooltip>

      {open ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-lg">
          <CommunityMenuItem
            href={COMMUNITY_LINKS.bonfire}
            external
            icon={
              <Flame
                size={18}
                strokeWidth={1.75}
                className="text-transparent"
                fill="url(#visora-flame-gradient)"
                stroke="url(#visora-flame-gradient)"
              />
            }
            title="Visora Bonfire Community"
            description="Get quick answers and how-tos from fellow Visora users and experts."
            onNavigate={closeMenu}
          />

          <CommunityMenuItem
            href={COMMUNITY_LINKS.blog}
            external
            icon={<NotebookPen size={18} strokeWidth={1.75} className="text-muted" />}
            title="Blog"
            description="Get tips and tricks for world-class customer engagement."
            onNavigate={closeMenu}
          />

          <CommunityMenuItem
            href={COMMUNITY_LINKS.caseStudies}
            external
            icon={<Library size={18} strokeWidth={1.75} className="text-muted" />}
            title="Case studies"
            description="See how leading brands worldwide use Visora to drive results."
            onNavigate={closeMenu}
          />

          <CommunityMenuItem
            href={COMMUNITY_LINKS.roadmap}
            external
            showExternalIcon={false}
            icon={<SlidersHorizontal size={18} strokeWidth={1.75} className="text-muted" />}
            title="Product roadmap"
            description="Check out what's new and upcoming, or submit your ideas to the team."
            onNavigate={closeMenu}
          />
        </div>
      ) : null}
    </div>
  );
}
