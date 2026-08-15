"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { inputClass } from "@/components/ui";

const dateInputClass =
  `${inputClass} w-[9.5rem] shrink-0 border-0 bg-transparent px-1 py-0 shadow-none [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none`;

export function DateRangePicker({ from, to, grain }: { from: string; to: string; grain: string }) {
  const router = useRouter();

  function update(next: { from?: string; to?: string; grain?: string }) {
    const params = new URLSearchParams({ from, to, grain });
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    if (next.grain) params.set("grain", next.grain);
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-sm">
      <Calendar size={20} strokeWidth={1.75} className="h-5 w-5 shrink-0 text-muted" aria-hidden />
      <input
        type="date"
        className={dateInputClass}
        value={from}
        onChange={(e) => update({ from: e.target.value })}
        aria-label="Start date"
      />
      <span className="text-muted">-</span>
      <input
        type="date"
        className={dateInputClass}
        value={to}
        onChange={(e) => update({ to: e.target.value })}
        aria-label="End date"
      />
    </div>
  );
}

export function GrainSelect({ from, to, grain }: { from: string; to: string; grain: string }) {
  const router = useRouter();
  return (
    <select
      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
      value={grain}
      onChange={(e) => {
        const params = new URLSearchParams({ from, to, grain: e.target.value });
        router.push(`/?${params.toString()}`);
      }}
    >
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
    </select>
  );
}
