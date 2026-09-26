"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Calculator, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type Props = {
  segmentId: string;
  segmentName: string;
  onCounts: (segmentId: string, count: number) => void;
};

export function SegmentRowMenu({ segmentId, segmentName, onCounts }: Props) {
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
    setOpen(false);
    setBusy(true);
    const response = await fetch(`/api/segments/${segmentId}/copy`, { method: "POST" });
    setBusy(false);
    if (!response.ok) return;
    router.refresh();
  }

  async function handleDelete() {
    setOpen(false);
    const confirmed = window.confirm(`Delete "${segmentName}"? This cannot be undone.`);
    if (!confirmed) return;

    setBusy(true);
    const response = await fetch(`/api/segments/${segmentId}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) return;
    router.refresh();
  }

  async function handleRunCounts() {
    setOpen(false);
    setBusy(true);
    const response = await fetch(`/api/segments?segmentId=${encodeURIComponent(segmentId)}`);
    setBusy(false);
    if (!response.ok) return;
    const data = await response.json();
    if (typeof data.count === "number") onCounts(segmentId, data.count);
  }

  return (
    <div ref={ref} className="relative inline-flex" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-label={`Actions for ${segmentName}`}
        aria-expanded={open}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground disabled:opacity-50"
      >
        <MoreHorizontal size={16} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-surface py-1 shadow-lg">
          <Link
            href={`/audience/segments/${segmentId}/edit`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
          >
            <Pencil size={14} className="text-muted" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-background"
          >
            <Copy size={14} className="text-muted" />
            Copy
          </button>
          <button
            type="button"
            onClick={() => void handleRunCounts()}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-background"
          >
            <Calculator size={14} className="text-muted" />
            Run counts
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-background"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
