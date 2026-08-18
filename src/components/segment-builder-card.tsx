"use client";

import { useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  GripVertical,
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
  type TargetingFilterGroup,
} from "@/lib/campaign-targeting";

type BuilderState = {
  filterGroups: TargetingFilterGroup[];
  exclusionGroups: TargetingFilterGroup[];
};

function SearchDropdown({
  placeholder,
  options,
  onSelect,
}: {
  placeholder: string;
  options: { id: string; label: string; description?: string }[];
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

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
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
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted">No matches found</p>
            ) : (
              filtered.map((item) => (
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
                  {item.description ? <span className="text-xs text-muted">{item.description}</span> : null}
                </button>
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
            onChange={(event) => onChange({ ...group, logic: event.target.value as "and" | "or" })}
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

export function SegmentBuilderCard({
  value,
  onChange,
}: {
  value: BuilderState;
  onChange: (value: BuilderState) => void;
}) {
  const [showMore, setShowMore] = useState(false);

  return (
    <Card className="space-y-5 p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Segment Builder</h2>
        <p className="mt-2 text-sm text-muted">
          Users will be included in this segment if they match your filter groups, and omitted if they match
          your exclusion groups.{" "}
          <button
            type="button"
            onClick={() => setShowMore((current) => !current)}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Show {showMore ? "less" : "more"}
            <ChevronDown size={14} className={showMore ? "rotate-180" : ""} />
          </button>
        </p>
        {showMore ? (
          <p className="mt-2 text-sm text-muted">
            Combine multiple filter groups with AND/OR logic. Exclusion groups remove users who match those
            criteria even if they match a filter group.
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        {value.filterGroups.map((group, index) => (
          <FilterGroupCard
            key={group.id}
            title={`Filter group ${index + 1}`}
            group={group}
            onChange={(nextGroup) =>
              onChange({
                ...value,
                filterGroups: value.filterGroups.map((item) => (item.id === group.id ? nextGroup : item)),
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

      <div className="flex flex-wrap gap-4">
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
    </Card>
  );
}

export function emptySegmentBuilder(): BuilderState {
  return {
    filterGroups: [createFilterGroup("or")],
    exclusionGroups: [],
  };
}

export type { BuilderState };
