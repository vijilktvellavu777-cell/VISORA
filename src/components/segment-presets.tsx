"use client";

import { useRouter } from "next/navigation";
import type { SegmentRules } from "@/lib/types";

const PRESETS: { name: string; description: string; rules: SegmentRules }[] = [
  {
    name: "Added to cart",
    description: "Performed added_to_cart",
    rules: { op: "and", filters: [{ kind: "event", name: "added_to_cart", op: "performed" }] },
  },
  {
    name: "Campaign sent",
    description: "Received a campaign_sent event",
    rules: { op: "and", filters: [{ kind: "event", name: "campaign_sent", op: "performed" }] },
  },
  {
    name: "Purchased",
    description: "Performed purchase",
    rules: { op: "and", filters: [{ kind: "event", name: "purchase", op: "performed" }] },
  },
  {
    name: "Abandoned cart",
    description: "Added to cart but has not purchased",
    rules: {
      op: "and",
      filters: [
        { kind: "event", name: "added_to_cart", op: "performed" },
        { kind: "event", name: "purchase", op: "not_performed" },
      ],
    },
  },
];

export function SegmentPresets() {
  const router = useRouter();

  async function create(preset: (typeof PRESETS)[number]) {
    await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preset),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.name}
          type="button"
          onClick={() => create(preset)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm hover:bg-background"
        >
          + {preset.name}
        </button>
      ))}
    </div>
  );
}
