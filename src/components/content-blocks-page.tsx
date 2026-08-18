"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  LayoutGrid,
  List,
  Lock,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { ContentBlockPreviewModal } from "@/components/content-block-preview-modal";
import { ContentBlockRowMenu } from "@/components/content-block-row-menu";
import { contentBlockTypeLabel, parseContentTags } from "@/lib/content-blocks";

export type ContentBlockRow = {
  id: string;
  name: string;
  status: string;
  blockType: string;
  tags: string | string[];
  inclusionCount: number;
  updatedAt: string;
  imageUrl: string | null;
  body: string;
};

function statusTone(status: string) {
  if (status === "active") return "ok" as const;
  if (status === "draft") return "neutral" as const;
  return "warn" as const;
}

function isActiveStatus(status: string) {
  return status !== "archived";
}

function BlockPreview({
  imageUrl,
  name,
  onClick,
}: {
  imageUrl: string | null;
  name: string;
  onClick?: () => void;
}) {
  const content = imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt="" className="h-10 w-14 rounded border border-border object-cover" />
  ) : (
    <div
      className="flex h-10 w-14 items-center justify-center rounded border border-dashed border-border bg-background text-[10px] font-medium text-muted"
      aria-hidden
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );

  if (!onClick) return content;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="rounded transition hover:opacity-80"
      aria-label={`Preview ${name}`}
    >
      {content}
    </button>
  );
}

export function ContentBlocksPageClient({ blocks }: { blocks: ContentBlockRow[] }) {
  const [statusFilter, setStatusFilter] = useState("active");
  const [tagFilter, setTagFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selected, setSelected] = useState<string[]>([]);
  const [previewBlock, setPreviewBlock] = useState<ContentBlockRow | null>(null);

  const filtered = useMemo(() => {
    return blocks.filter((block) => {
      if (statusFilter === "active" && !isActiveStatus(block.status)) return false;
      if (statusFilter === "draft" && block.status !== "draft") return false;
      if (statusFilter === "archived" && block.status !== "archived") return false;
      if (search && !block.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (tagFilter !== "all") {
        const tags = parseContentTags(block.tags);
        if (!tags.includes(tagFilter)) return false;
      }
      return true;
    });
  }, [blocks, statusFilter, search, tagFilter]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    blocks.forEach((block) => parseContentTags(block.tags).forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [blocks]);

  const hasFilters = statusFilter !== "all" || tagFilter !== "all" || search.length > 0;
  const allSelected = filtered.length > 0 && filtered.every((block) => selected.includes(block.id));

  function resetFilters() {
    setStatusFilter("all");
    setTagFilter("all");
    setSearch("");
  }

  function toggleAll() {
    if (allSelected) {
      setSelected((current) => current.filter((id) => !filtered.some((block) => block.id === id)));
      return;
    }
    setSelected((current) => [...new Set([...current, ...filtered.map((block) => block.id)])]);
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border px-8">
        <div className="inline-flex border-b-2 border-primary py-4 text-sm font-medium text-primary">
          Content Block Templates
        </div>
      </div>

      <div className="border-b border-border px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Content Blocks</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Lock size={12} />
              Limited access
            </span>
          </div>
          <Link
            href="/content/templates/content-blocks/new"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Create Content Block
          </Link>
        </div>
      </div>

      <div className="border-b border-border px-8 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-muted">Status</span>
              <div className="relative">
                <select
                  className="min-w-[140px] appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="all">All</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted">Tags</span>
              <div className="relative">
                <select
                  className="min-w-[140px] appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm"
                  value={tagFilter}
                  onChange={(event) => setTagFilter(event.target.value)}
                >
                  <option value="all">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </label>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-primary bg-surface px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="pb-2 text-sm font-medium text-primary hover:underline"
              >
                Reset filters
              </button>
            ) : null}
          </div>
          <label className="relative block min-w-[240px]">
            <span className="sr-only">Search Content Block name</span>
            <input
              className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-10 text-sm outline-none focus:border-primary"
              placeholder="Search Content Block name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </label>
        </div>
        {statusFilter === "active" ? (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Status: Active
              <button type="button" onClick={() => setStatusFilter("all")} aria-label="Clear status filter">
                <X size={12} />
              </button>
            </span>
          </div>
        ) : null}
      </div>

      <div className="px-8 py-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-foreground">
            {filtered.length === 0 ? "No Results Found" : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
          </p>
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                viewMode === "list" ? "bg-background text-primary" : "text-muted hover:text-foreground"
              }`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                viewMode === "grid" ? "bg-background text-primary" : "text-muted hover:text-foreground"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="border-t border-border py-16 text-center">
            {blocks.length === 0 ? (
              <div className="mx-auto max-w-md">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5">
                  <div className="grid h-12 w-12 grid-cols-2 gap-1">
                    <div className="rounded-sm bg-primary" />
                    <div className="rounded-sm border border-dashed border-primary/40" />
                    <div className="rounded-sm border border-dashed border-primary/40" />
                    <div className="rounded-sm border border-dashed border-primary/40" />
                  </div>
                </div>
                <h2 className="mt-6 text-lg font-semibold text-foreground">You don&apos;t have any Content Blocks yet</h2>
                <p className="mt-2 text-sm text-muted">
                  Use Content Blocks to manage your reusable, cross-channel content in a single, centralized location.
                </p>
                <Link
                  href="/content/templates/content-blocks/new"
                  className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Create Content Block
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted">Try adjusting your filters or search terms.</p>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((block) => (
              <div
                key={block.id}
                className="rounded-xl border border-border bg-surface p-4 hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <BlockPreview
                    imageUrl={block.imageUrl}
                    name={block.name}
                    onClick={() => setPreviewBlock(block)}
                  />
                  <ContentBlockRowMenu blockId={block.id} blockName={block.name} />
                </div>
                <Link
                  href={`/content/templates/content-blocks/${block.id}/edit`}
                  className="mt-3 block font-medium text-foreground hover:text-primary"
                >
                  {block.name}
                </Link>
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone={statusTone(block.status)}>{block.status}</Badge>
                  <span className="text-xs text-muted">{contentBlockTypeLabel(block.blockType)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full border-t border-border text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
                <th className="w-10 py-3 pr-3 font-medium">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all content blocks"
                  />
                </th>
                <th className="py-3 pr-4 font-medium">Preview</th>
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Inclusion count</th>
                <th className="py-3 pr-4 font-medium">Type</th>
                <th className="py-3 pr-4 font-medium">Tags</th>
                <th className="py-3 pr-4 font-medium">Last edited</th>
                <th className="w-10 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((block) => {
                const tags = parseContentTags(block.tags);
                return (
                  <tr
                    key={block.id}
                    className="border-b border-border last:border-0 hover:bg-background"
                  >
                    <td className="py-4 pr-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(block.id)}
                        onChange={() =>
                          setSelected((current) =>
                            current.includes(block.id)
                              ? current.filter((id) => id !== block.id)
                              : [...current, block.id],
                          )
                        }
                        aria-label={`Select ${block.name}`}
                      />
                    </td>
                    <td className="py-4 pr-4">
                      <BlockPreview
                        imageUrl={block.imageUrl}
                        name={block.name}
                        onClick={() => setPreviewBlock(block)}
                      />
                    </td>
                    <td className="py-4 pr-4">
                      <Link
                        href={`/content/templates/content-blocks/${block.id}/edit`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {block.name}
                      </Link>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge tone={statusTone(block.status)}>{block.status}</Badge>
                    </td>
                    <td className="py-4 pr-4">{block.inclusionCount}</td>
                    <td className="py-4 pr-4">{contentBlockTypeLabel(block.blockType)}</td>
                    <td className="py-4 pr-4 text-muted">
                      {tags.length ? tags.join(", ") : "—"}
                    </td>
                    <td className="py-4 pr-4 text-muted">{format(new Date(block.updatedAt), "MMM d, yyyy")}</td>
                    <td className="py-4">
                      <ContentBlockRowMenu blockId={block.id} blockName={block.name} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {previewBlock ? (
          <ContentBlockPreviewModal block={previewBlock} onClose={() => setPreviewBlock(null)} />
        ) : null}
      </div>
    </div>
  );
}
