"use client";

import { useMemo, useState } from "react";
import { ChevronDown, GripVertical, Search, X } from "lucide-react";
import { Card } from "@/components/ui";
import {
  visibleSegmentRules,
  type SegmentRuleCategory,
  type SegmentRuleEntry,
} from "@/lib/segment-rules-catalog";

type Props = {
  onSelect: (rule: SegmentRuleEntry) => void;
};

export function SegmentRulesPanel({ onSelect }: Props) {
  const [open, setOpen] = useState(true);
  const [category, setCategory] = useState<SegmentRuleCategory>("all");
  const [query, setQuery] = useState("");

  const rules = useMemo(() => visibleSegmentRules(category, query), [category, query]);
  const showChannels = category !== "email" && rules.some((rule) => rule.section !== "general");
  const showEmail = rules.some((rule) => rule.section === "email");
  const generalRules = rules.filter((rule) => rule.section === "general");
  const emailRules = rules.filter((rule) => rule.section === "email");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-xl border border-border bg-surface px-5 py-3 text-left text-sm font-semibold text-foreground shadow-sm hover:bg-background"
      >
        Rules
      </button>
    );
  }

  return (
    <Card className="mt-4 overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold text-foreground">Rules</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
          aria-label="Close rules"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 px-5 py-4">
        <div className="relative">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as SegmentRuleCategory)}
            className="w-full appearance-none rounded-lg border border-border bg-surface py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="all">All rules</option>
            <option value="channels">Channels</option>
            <option value="email">Email</option>
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>

        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="max-h-[420px] space-y-4 overflow-y-auto px-5 pb-5">
        {generalRules.map((rule) => (
          <RuleRow key={rule.id} rule={rule} onSelect={onSelect} />
        ))}

        {showChannels ? <h3 className="text-base font-semibold text-foreground">Channels</h3> : null}
        {showEmail ? <h3 className="text-base font-semibold text-foreground">Email</h3> : null}
        {emailRules.map((rule) => (
          <RuleRow key={rule.id} rule={rule} onSelect={onSelect} />
        ))}

        {rules.length === 0 ? <p className="text-sm text-muted">No rules match your search.</p> : null}
      </div>
    </Card>
  );
}

function RuleRow({
  rule,
  onSelect,
}: {
  rule: SegmentRuleEntry;
  onSelect: (rule: SegmentRuleEntry) => void;
}) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("application/x-visora-rule", JSON.stringify(rule));
        event.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => onSelect(rule)}
      className="flex w-full items-center gap-3 text-left text-sm text-foreground hover:text-primary"
    >
      <GripVertical size={16} className="shrink-0 text-muted" />
      <span>{rule.label}</span>
    </button>
  );
}
