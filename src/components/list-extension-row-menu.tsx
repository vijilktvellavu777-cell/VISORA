"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Calculator, List, MoreVertical, Trash2, Upload } from "lucide-react";

type Props = {
  extensionId: string;
  extensionName: string;
};

export function ListExtensionRowMenu({ extensionId, extensionName }: Props) {
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

  async function handleDelete() {
    setOpen(false);
    const confirmed = window.confirm(`Delete "${extensionName}"? This cannot be undone.`);
    if (!confirmed) return;

    setBusy(true);
    const response = await fetch(`/api/audience/list-extensions/${extensionId}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) return;
    router.refresh();
  }

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Actions for ${extensionName}`}
        aria-expanded={open}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground disabled:opacity-50"
      >
        <MoreVertical size={16} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-surface py-1 shadow-lg">
          <Link
            href={`/audience/list-extensions/${extensionId}`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
          >
            <List size={14} className="text-muted" />
            Open list
          </Link>
          <Link
            href={`/audience/list-extensions/${extensionId}/counts`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
          >
            <Calculator size={14} className="text-muted" />
            Record counts
          </Link>
          <Link
            href={`/audience/list-extensions/${extensionId}/import`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
          >
            <Upload size={14} className="text-muted" />
            Import
          </Link>
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
