"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import type { RenderlyCampaignListItem } from "@/lib/renderly-types";
import { RenderlyEmailPreviewFrame } from "@/components/renderly-email-preview";
import { RenderlyRowMenu } from "@/components/renderly-row-menu";

const PAGE_SIZE = 10;

function formatKb(kb: number) {
  return `${kb.toFixed(2)}kb`;
}

function formatMs(ms: number) {
  return `${ms.toFixed(2)}ms`;
}

export function RenderlyPageClient({ items }: { items: RenderlyCampaignListItem[] }) {
  const [search, setSearch] = useState("");
  const [cardView, setCardView] = useState(false);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.subject ?? "").toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min(filtered.length, (safePage + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border px-8 py-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Renderly</h1>
        <p className="mt-1 text-sm text-muted">
          Proof and QA email campaign HTML before send.
        </p>
      </div>

      <div className="px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {filtered.length === 0
              ? "0 rendering"
              : `${rangeStart} - ${rangeEnd} of ${filtered.length} rendering`}
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <span>Card View</span>
            <button
              type="button"
              role="switch"
              aria-checked={cardView}
              onClick={() => setCardView((value) => !value)}
              className={`relative h-6 w-11 rounded-full transition ${
                cardView ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  cardView ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <label className="relative min-w-[280px] flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Search rendering"
              className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <button type="button" disabled className="text-sm text-muted disabled:opacity-40">
            Delete
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted">No filters applied</span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Filter size={16} />
              Filter
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Sort
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-background px-6 py-16 text-center">
            <p className="text-sm text-muted">No campaign renderings found.</p>
          </div>
        ) : cardView ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((item) => (
              <Link
                key={item.id}
                href={`/renderly/${item.id}`}
                className="overflow-hidden rounded-xl border border-border bg-surface text-left transition hover:border-primary/30 hover:shadow-sm"
              >
                <div className="border-b border-border bg-background px-4 py-3">
                  <div className="truncate text-sm font-semibold text-foreground">{item.name}</div>
                  <div className="mt-1 truncate text-xs text-muted">
                    {item.subject?.trim() || "No subject"}
                  </div>
                </div>
                <div className="p-4">
                  <RenderlyEmailPreviewFrame
                    html={item.body}
                    title={`Thumbnail ${item.name}`}
                    className="h-[220px]"
                  />
                </div>
                <div className="flex justify-between border-t border-border px-4 py-2 text-xs text-muted">
                  <span>{formatKb(item.metrics.htmlSizeKb)}</span>
                  <span>{item.metrics.previews} previews</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-medium text-muted">
                  <th className="py-3 pr-4 font-medium">Rendering title</th>
                  <th className="py-3 pr-4 font-medium">Tags</th>
                  <th className="py-3 pr-4 font-medium text-center">Previews</th>
                  <th className="py-3 pr-4 font-medium text-center">Comments</th>
                  <th className="py-3 pr-4 font-medium text-center">Broken links</th>
                  <th className="py-3 pr-4 font-medium text-center">Unsecure links</th>
                  <th className="py-3 pr-4 font-medium text-center">HTML size</th>
                  <th className="py-3 pr-4 font-medium text-center">Load time</th>
                  <th className="w-12 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/80 hover:bg-background/60"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/renderly/${item.id}`}
                        className="flex items-center gap-3"
                      >
                        <RenderlyEmailPreviewFrame
                          html={item.body}
                          title={`Thumbnail ${item.name}`}
                          className="h-14 w-[72px] shrink-0"
                        />
                        <span className="line-clamp-2 font-medium text-foreground hover:text-primary">
                          {item.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {item.tags.length > 0 ? (
                        <span className="line-clamp-2">{item.tags.join(", ")}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 pr-4 text-center tabular-nums">{item.metrics.previews}</td>
                    <td className="py-3 pr-4 text-center tabular-nums">{item.metrics.comments}</td>
                    <td className="py-3 pr-4 text-center tabular-nums">
                      {item.metrics.brokenLinks}
                    </td>
                    <td className="py-3 pr-4 text-center tabular-nums">
                      {item.metrics.unsecureLinks}
                    </td>
                    <td className="py-3 pr-4 text-center tabular-nums">
                      {formatKb(item.metrics.htmlSizeKb)}
                    </td>
                    <td className="py-3 pr-4 text-center tabular-nums">
                      {formatMs(item.metrics.loadTimeMs)}
                    </td>
                    <td className="py-3 text-right">
                      <RenderlyRowMenu campaignId={item.id} campaignName={item.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE ? (
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-muted">
              Page {safePage + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
