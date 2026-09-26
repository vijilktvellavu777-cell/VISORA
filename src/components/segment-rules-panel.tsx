"use client";

import { useMemo, useState } from "react";
import { ChevronDown, GripVertical, Search, X } from "lucide-react";
import { Card } from "@/components/ui";
import {
  SEGMENT_RULE_GROUPS,
  segmentRulesForGroup,
  type SegmentRuleEntry,
} from "@/lib/segment-rules-catalog";

type Props = {
  onSelect: (rule: SegmentRuleEntry) => void;
};

export function SegmentRulesPanel({ onSelect }: Props) {
  const [open, setOpen] = useState(true);
  const [groupId, setGroupId] = useState("all");
  const [query, setQuery] = useState("");

  const rules = useMemo(() => segmentRulesForGroup(groupId, query), [groupId, query]);
  const visibleGroups = useMemo(() => {
    const selected =
      groupId === "all" ? SEGMENT_RULE_GROUPS : SEGMENT_RULE_GROUPS.filter((group) => group.id === groupId);
    const normalized = query.trim().toLowerCase();
    return selected.filter((group) => {
      const hasMatch = group.rules.some(
        (rule) => !normalized || rule.label.toLowerCase().includes(normalized) || group.label.toLowerCase().includes(normalized),
      );
      if (groupId !== "all") return true;
      return hasMatch;
    });
  }, [groupId, query]);

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
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
            className="w-full appearance-none rounded-lg border border-border bg-surface py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="all">All rules</option>
            {SEGMENT_RULE_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
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
        {visibleGroups.map((group) => {
          const groupRules = rules.filter((rule) => rule.groupId === group.id);
          return (
            <div key={group.id} className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">{group.label}</h3>
              {groupRules.length > 0 ? (
                groupRules.map((rule) => <RuleRow key={rule.id} rule={rule} onSelect={onSelect} />)
              ) : (
                <p className="text-sm text-muted">
                  {query.trim() ? "No rules match your search." : group.emptyMessage ?? "No rules in this group yet."}
                </p>
              )}
            </div>
          );
        })}

        {visibleGroups.length === 0 ? <p className="text-sm text-muted">No rules match your search.</p> : null}
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
