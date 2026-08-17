"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Mail, Bell, Smartphone } from "lucide-react";

const OPTIONS = [
  { channel: "email", label: "Email", icon: Mail },
  { channel: "push", label: "Push", icon: Bell },
  { channel: "in_app", label: "In-app", icon: Smartphone },
] as const;

export function CreateCampaignDropdown({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Create campaign
        <ChevronDown size={16} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.channel}
                href={`/campaigns/new?type=${option.channel}&fresh=1`}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-background"
                onClick={() => setOpen(false)}
              >
                <Icon size={16} className="text-primary" />
                {option.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
