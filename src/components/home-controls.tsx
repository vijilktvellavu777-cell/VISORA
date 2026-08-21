"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { normalizeDateRange } from "@/lib/dates";

const dateFieldClass =
  "h-8 min-w-[9.5rem] cursor-pointer border-0 bg-transparent p-0 text-sm text-foreground outline-none [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer";

export function DateRangePicker({ from, to, grain }: { from: string; to: string; grain: string }) {
  const router = useRouter();
  const range = normalizeDateRange(from, to);

  function update(next: { from?: string; to?: string; grain?: string }) {
    const normalized = normalizeDateRange(next.from ?? range.from, next.to ?? range.to);
    const params = new URLSearchParams({
      from: normalized.from,
      to: normalized.to,
      grain: next.grain ?? grain,
    });
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="inline-flex shrink-0 flex-nowrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-sm">
      <Calendar size={18} strokeWidth={1.75} className="h-[18px] w-[18px] shrink-0 text-muted" aria-hidden />
      <div className="relative">
        <input
          type="date"
          className={dateFieldClass}
          value={range.from}
          max={range.to}
          onChange={(event) => update({ from: event.target.value })}
          aria-label="Start date"
        />
      </div>
      <span className="shrink-0 text-sm text-muted">-</span>
      <div className="relative">
        <input
          type="date"
          className={dateFieldClass}
          value={range.to}
          min={range.from}
          onChange={(event) => update({ to: event.target.value })}
          aria-label="End date"
        />
      </div>
    </div>
  );
}

export function GrainSelect({ from, to, grain }: { from: string; to: string; grain: string }) {
  const router = useRouter();
  const range = normalizeDateRange(from, to);

  return (
    <select
      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
      value={grain}
      onChange={(event) => {
        const params = new URLSearchParams({ from: range.from, to: range.to, grain: event.target.value });
        router.push(`/?${params.toString()}`);
      }}
    >
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
    </select>
  );
}
