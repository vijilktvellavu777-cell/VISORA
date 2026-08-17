"use client";

import { useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  GripVertical,
  Info,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Card } from "@/components/ui";
import {
  createFilterGroup,
  createFilterItem,
  PREBUILT_TARGETING_FILTERS,
  type CampaignTargeting,
  type TargetingFilterGroup,
} from "@/lib/campaign-targeting";

type SegmentOption = { id: string; name: string };

type Props = {
  segments: SegmentOption[];
  value: CampaignTargeting;
  onChange: (value: CampaignTargeting) => void;
};

function SearchDropdown({
  placeholder,
  options,
  onSelect,
}: {
  placeholder: string;
  options: { id: string; label: string; description?: string; group?: string }[];
  onSelect: (id: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.description?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const option of filtered) {
      const key = option.group ?? "Options";
      const list = groups.get(key) ?? [];
      list.push(option);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-3 pr-10 text-sm outline-none focus:border-primary"
        />
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
      </div>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close search results"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
            {grouped.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted">No matches found</p>
            ) : (
              grouped.map(([group, items]) => (
                <div key={group}>
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {group}
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect(item.id, item.label);
                        setQuery("");
                        setOpen(false);
                      }}
                      className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-background"
                    >
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      {item.description ? (
                        <span className="text-xs text-muted">{item.description}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function FilterGroupCard({
  title,
  group,
  onChange,
  onRemove,
  variant = "filter",
}: {
  title: string;
  group: TargetingFilterGroup;
  onChange: (group: TargetingFilterGroup) => void;
  onRemove?: () => void;
  variant?: "filter" | "exclusion";
}) {
  const filterOptions = PREBUILT_TARGETING_FILTERS.map((filter) => ({
    id: filter.id,
    label: filter.label,
    description: filter.description,
    group: "Pre-built filters",
  }));

  const isExclusion = variant === "exclusion";

  return (
    <div
      className={`rounded-lg border p-4 ${
        isExclusion ? "border-red-200 bg-red-50" : "border-border bg-background"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-muted" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <button type="button" className="text-muted hover:text-foreground" aria-label={`Edit ${title}`}>
            <Pencil size={14} />
          </button>
        </div>
        <div className="relative">
          <select
            value={group.logic}
            onChange={(e) => onChange({ ...group, logic: e.target.value as "and" | "or" })}
            className="appearance-none rounded-lg border border-primary/30 bg-primary/5 py-1.5 pl-3 pr-8 text-sm font-semibold uppercase text-primary outline-none"
          >
            <option value="or">OR</option>
            <option value="and">AND</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        {group.filters.map((filter) => (
          <div
            key={filter.id}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
              isExclusion ? "border-red-100 bg-white" : "border-border bg-surface"
            }`}
          >
            <Search size={14} className="shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{filter.label}</span>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...group,
                  filters: group.filters.filter((item) => item.id !== filter.id),
                })
              }
              className="shrink-0 text-muted hover:text-foreground"
              aria-label={`Remove ${filter.label}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <SearchDropdown
          placeholder="Search filter..."
          options={filterOptions}
          onSelect={(filterId, label) => {
            onChange({
              ...group,
              filters: [...group.filters, createFilterItem(filterId, label)],
            });
          }}
        />
      </div>

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className={`mt-3 text-xs font-medium hover:underline ${
            isExclusion ? "text-red-700 hover:text-red-800" : "text-muted hover:text-foreground"
          }`}
        >
          Remove group
        </button>
      ) : null}
    </div>
  );
}

export function CampaignTargetingStep({ segments, value, onChange }: Props) {
  const segmentOptions = useMemo(
    () =>
      segments.map((segment) => ({
        id: segment.id,
        label: segment.name,
        group: "Segments",
      })),
    [segments],
  );

  const selectedSegments = segments.filter((segment) => value.segmentIds.includes(segment.id));

  function toggleSegment(segmentId: string) {
    const exists = value.segmentIds.includes(segmentId);
    onChange({
      ...value,
      segmentIds: exists
        ? value.segmentIds.filter((id) => id !== segmentId)
        : [...value.segmentIds, segmentId],
    });
  }

  function handleSegmentSearchSelect(segmentId: string) {
    if (!value.segmentIds.includes(segmentId)) {
      onChange({ ...value, segmentIds: [...value.segmentIds, segmentId] });
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Targeting Options</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Target users by choosing multiple segments they must fall into. Further refine your audience
          by adding additional filters.
        </p>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
          Target Users By Segment
          <Info size={14} className="text-muted" />
        </label>

        <SearchDropdown
          placeholder="Search Segments..."
          options={segmentOptions}
          onSelect={(segmentId) => handleSegmentSearchSelect(segmentId)}
        />

        {selectedSegments.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedSegments.map((segment) => (
              <span
                key={segment.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {segment.name}
                <button
                  type="button"
                  onClick={() => toggleSegment(segment.id)}
                  className="hover:text-primary-dark"
                  aria-label={`Remove ${segment.name}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Additional Filters</h3>

        <div className="mt-4 space-y-4">
          {value.filterGroups.map((group, index) => (
            <FilterGroupCard
              key={group.id}
              title={`Filter group ${index + 1}`}
              group={group}
              onChange={(nextGroup) =>
                onChange({
                  ...value,
                  filterGroups: value.filterGroups.map((item) =>
                    item.id === group.id ? nextGroup : item,
                  ),
                })
              }
              onRemove={
                value.filterGroups.length > 1
                  ? () =>
                      onChange({
                        ...value,
                        filterGroups: value.filterGroups.filter((item) => item.id !== group.id),
                      })
                  : undefined
              }
            />
          ))}

          {value.exclusionGroups.map((group, index) => (
            <FilterGroupCard
              key={group.id}
              variant="exclusion"
              title={`Exclusion group ${index + 1}`}
              group={group}
              onChange={(nextGroup) =>
                onChange({
                  ...value,
                  exclusionGroups: value.exclusionGroups.map((item) =>
                    item.id === group.id ? nextGroup : item,
                  ),
                })
              }
              onRemove={() =>
                onChange({
                  ...value,
                  exclusionGroups: value.exclusionGroups.filter((item) => item.id !== group.id),
                })
              }
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() =>
              onChange({
                ...value,
                filterGroups: [...value.filterGroups, createFilterGroup("or")],
              })
            }
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Plus size={14} />
            Add filter group
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...value,
                exclusionGroups: [...value.exclusionGroups, createFilterGroup("or")],
              })
            }
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Plus size={14} />
            Add exclusion group
          </button>
        </div>
      </div>
    </Card>
  );
}
