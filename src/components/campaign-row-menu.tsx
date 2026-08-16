"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";

type Props = {
  campaignId: string;
  campaignName: string;
};

export function CampaignRowMenu({ campaignId, campaignName }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const editHref = `/campaigns/${campaignId}`;

  async function handleCopy() {
    setBusy(true);
    setOpen(false);
    const response = await fetch(`/api/campaigns/${campaignId}/copy`, { method: "POST" });
    setBusy(false);
    if (!response.ok) return;
    router.refresh();
  }

  async function handleDelete() {
    setOpen(false);
    const confirmed = window.confirm(`Delete "${campaignName}"? This cannot be undone.`);
    if (!confirmed) return;

    setBusy(true);
    const response = await fetch(`/api/campaigns/${campaignId}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) return;
    router.refresh();
  }

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Actions for ${campaignName}`}
        aria-expanded={open}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground disabled:opacity-50"
      >
        <MoreVertical size={16} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-surface py-1 shadow-lg">
          <Link
            href={editHref}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
          >
            <Pencil size={14} className="text-muted" />
            Edit
          </Link>
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
          >
            <Copy size={14} className="text-muted" />
            Copy
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-background"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
