"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Copy, MoreVertical, Trash2 } from "lucide-react";

type Props = {
  linkId: string;
  linkName: string;
  linkUrl: string;
  status: string;
};

export function LinkTableRowMenu({ linkId, linkName, linkUrl, status }: Props) {
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

  async function handleCopy() {
    setBusy(true);
    setOpen(false);
    await fetch("/api/content/link-table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${linkName} copy`,
        url: linkUrl,
        status,
      }),
    });
    setBusy(false);
    router.refresh();
  }

  async function handleDelete() {
    setOpen(false);
    const confirmed = window.confirm(`Delete "${linkName}"? This cannot be undone.`);
    if (!confirmed) return;

    setBusy(true);
    const response = await fetch(`/api/content/link-table/${linkId}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) return;
    router.refresh();
  }

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Actions for ${linkName}`}
        aria-expanded={open}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground disabled:opacity-50"
      >
        <MoreVertical size={16} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-surface py-1 shadow-lg">
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
