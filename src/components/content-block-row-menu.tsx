"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";

type Props = {
  blockId: string;
  blockName: string;
};

export function ContentBlockRowMenu({ blockId, blockName }: Props) {
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
    const response = await fetch(`/api/content/${blockId}/copy`, { method: "POST" });
    setBusy(false);
    if (!response.ok) return;
    router.refresh();
  }

  async function handleDelete() {
    setOpen(false);
    const confirmed = window.confirm(`Delete "${blockName}"? This cannot be undone.`);
    if (!confirmed) return;

    setBusy(true);
    const response = await fetch(`/api/content/${blockId}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) return;
    router.refresh();
  }

  function handleEdit() {
    setOpen(false);
    router.push(`/content/templates/content-blocks/${blockId}/edit`);
  }

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Actions for ${blockName}`}
        aria-expanded={open}
        disabled={busy}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground disabled:opacity-50"
      >
        <MoreVertical size={16} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-lg border border-border bg-surface py-1 shadow-lg">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleCopy();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
          >
            <Copy size={14} className="text-muted" />
            Copy the content
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-background"
          >
            <Trash2 size={14} />
            Delete the content
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleEdit();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
          >
            <Pencil size={14} className="text-muted" />
            Edit the content
          </button>
        </div>
      ) : null}
    </div>
  );
}
