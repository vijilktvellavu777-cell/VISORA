"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, MoreHorizontal, ScanEye } from "lucide-react";

type Props = {
  campaignId: string;
  campaignName: string;
};

export function RenderlyRowMenu({ campaignId, campaignName }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-label={`Actions for ${campaignName}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-background hover:text-foreground"
      >
        <MoreHorizontal size={18} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-border bg-surface py-1 shadow-lg">
          <Link
            href={`/renderly/${campaignId}`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
            onClick={() => setOpen(false)}
          >
            <ScanEye size={16} />
            Open rendering report
          </Link>
          <Link
            href={`/campaigns/${campaignId}`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
            onClick={() => setOpen(false)}
          >
            <ExternalLink size={16} />
            View campaign
          </Link>
        </div>
      ) : null}
    </div>
  );
}
