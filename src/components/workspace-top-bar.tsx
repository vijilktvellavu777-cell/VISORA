"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Globe,
  MessageSquareWarning,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sidebar-muted transition hover:bg-white/5 hover:text-sidebar-foreground"
    >
      {children}
    </button>
  );
}

export function WorkspaceTopBar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("workspace-search")?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <label className="relative block w-full max-w-md">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sidebar-muted" />
          <input
            id="workspace-search"
            type="search"
            placeholder="Search workspace"
            className="w-full rounded-full border border-transparent bg-white/5 py-2.5 pl-11 pr-16 text-sm text-sidebar-foreground outline-none transition placeholder:text-sidebar-muted focus:border-primary/40 focus:bg-white/10 focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-sidebar-border bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-sidebar-muted sm:inline-block">
            ⌘+K
          </kbd>
        </label>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton label="Feedback">
            <MessageSquareWarning size={18} strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Team">
            <Users size={18} strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Language">
            <Globe size={18} strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Notifications">
            <Bell size={18} strokeWidth={1.75} />
          </IconButton>

          <div ref={profileRef} className="relative ml-1">
            <button
              type="button"
              aria-label="Profile menu"
              onClick={() => setProfileOpen((open) => !open)}
              className="inline-flex items-center gap-1 rounded-full py-1 pl-1 pr-2 transition hover:bg-white/5"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm">
                🙂
              </span>
              <ChevronDown size={14} className="text-sidebar-muted" />
            </button>
            {profileOpen ? (
              <div className="absolute right-0 top-full z-20 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg">
                <div className="border-b border-border px-4 py-3">
                  <div className="text-sm font-medium text-foreground">VISORA User</div>
                  <div className="text-xs text-muted">user@visora.app</div>
                </div>
                <button type="button" className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background">
                  Account settings
                </button>
                <button type="button" className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background">
                  Sign out
                </button>
              </div>
            ) : null}
          </div>

          <Link
            href="/bubu"
            aria-label="Open AI assistant"
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[#38bdf8] text-white shadow-sm transition hover:opacity-90"
          >
            <Sparkles size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
