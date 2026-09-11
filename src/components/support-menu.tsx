"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  ExternalLink,
  GraduationCap,
  MessageSquareWarning,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { HeaderIconTooltip } from "@/components/header-icon-tooltip";

const SUPPORT_LINKS = {
  status: "https://status.visora.app",
  documentation: "https://docs.visora.app",
  learning: "https://learn.visora.app",
  feedback: "mailto:feedback@visora.app?subject=VISORA%20Feedback",
} as const;

function SupportMenuItem({
  href,
  external,
  icon,
  title,
  description,
  badge,
  onNavigate,
}: {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  title: React.ReactNode;
  description: string;
  badge?: React.ReactNode;
  onNavigate?: () => void;
}) {
  const className =
    "flex w-full gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-background";

  const content = (
    <>
      <span className="mt-0.5 shrink-0 text-muted">{icon}</span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
          {title}
          {external ? <ExternalLink size={14} className="text-muted" aria-hidden /> : null}
          {badge}
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

export function SupportMenu() {
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
      <HeaderIconTooltip label="Support">
        <button
          type="button"
          aria-label="Support"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
        >
          <MessageSquareWarning size={18} strokeWidth={1.75} />
        </button>
      </HeaderIconTooltip>

      {open ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Check size={12} strokeWidth={3} />
              </span>
              <span className="truncate text-sm text-muted">All systems operational</span>
            </div>
            <a
              href={SUPPORT_LINKS.status}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-sm font-semibold text-primary underline underline-offset-2 hover:text-primary-dark"
              onClick={closeMenu}
            >
              View details
            </a>
          </div>

          <div className="p-2">
            <SupportMenuItem
              href="/bubu"
              icon={<Sparkles size={18} strokeWidth={1.75} />}
              title="Get help with Operator"
              badge={
                <span className="rounded-full bg-gradient-to-r from-[#f97316] to-[#ec4899] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  New
                </span>
              }
              description="Operator knows your workspace and can help solve most issues, or if you prefer, file a ticket directly from here."
              onNavigate={closeMenu}
            />

            <SupportMenuItem
              href={SUPPORT_LINKS.documentation}
              external
              icon={<BookOpen size={18} strokeWidth={1.75} />}
              title="Visora Documentation"
              description="Learn with comprehensive guides and resources"
              onNavigate={closeMenu}
            />

            <SupportMenuItem
              href={SUPPORT_LINKS.learning}
              external
              icon={<GraduationCap size={18} strokeWidth={1.75} />}
              title="Visora Learning"
              description="Get videos, lessons, and interactive exercises"
              onNavigate={closeMenu}
            />

            <SupportMenuItem
              href={SUPPORT_LINKS.feedback}
              external
              icon={<MessagesSquare size={18} strokeWidth={1.75} />}
              title="Share feedback"
              description="Help make Visora better for everyone"
              onNavigate={closeMenu}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
