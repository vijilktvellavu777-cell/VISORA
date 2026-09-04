"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Monitor, Search, Smartphone, X } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui";
import { prepareEmailHtmlForPreview } from "@/lib/email-render";

export type RenderlyEmailItem = {
  id: string;
  name: string;
  kind: "campaign" | "template";
  subject: string | null;
  body: string;
  status?: string;
  updatedAt: string;
};

type ViewMode = "desktop" | "mobile";
type SourceFilter = "all" | "campaign" | "template";

function EmailPreviewFrame({
  html,
  title,
  viewMode,
  className = "",
}: {
  html: string;
  title: string;
  viewMode: ViewMode;
  className?: string;
}) {
  const srcDoc = prepareEmailHtmlForPreview(html);

  return (
    <div
      className={`mx-auto overflow-hidden rounded-lg border border-border bg-white shadow-sm ${
        viewMode === "mobile" ? "max-w-[375px]" : "w-full"
      } ${className}`}
    >
      {srcDoc ? (
        <iframe
          title={title}
          srcDoc={srcDoc}
          className="h-full min-h-[240px] w-full border-0 bg-white"
          sandbox="allow-same-origin"
        />
      ) : (
        <div className="flex min-h-[240px] items-center justify-center px-6 text-sm text-muted">
          No content available for preview.
        </div>
      )}
    </div>
  );
}

function RenderlyDetailModal({
  item,
  onClose,
}: {
  item: RenderlyEmailItem;
  onClose: () => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {item.kind === "campaign" ? "Campaign" : "Template"}
              {item.subject ? ` · ${item.subject}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setViewMode("desktop")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
                  viewMode === "desktop" ? "bg-surface text-foreground shadow-sm" : "text-muted"
                }`}
              >
                <Monitor size={14} />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
                  viewMode === "mobile" ? "bg-surface text-foreground shadow-sm" : "text-muted"
                }`}
              >
                <Smartphone size={14} />
                Mobile
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-background px-6 py-8">
          <EmailPreviewFrame
            html={item.body}
            title={`Render ${item.name}`}
            viewMode={viewMode}
            className="min-h-[min(720px,70vh)]"
          />
          <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-muted">
            Actual rendering may not be identical to this preview depending on the user&apos;s environment.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RenderlyPageClient({ items }: { items: RenderlyEmailItem[] }) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [selected, setSelected] = useState<RenderlyEmailItem | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (sourceFilter !== "all" && item.kind !== sourceFilter) return false;
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        (item.subject ?? "").toLowerCase().includes(query)
      );
    });
  }, [items, search, sourceFilter]);

  const campaignCount = items.filter((item) => item.kind === "campaign").length;
  const templateCount = items.filter((item) => item.kind === "template").length;

  return (
    <div className="min-h-screen bg-surface">
      <PageHeader
        title="Renderly"
        subtitle="Check how all email campaigns and templates render across devices."
      />

      <div className="space-y-6 px-8 pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[240px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search emails…"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(
              [
                { id: "all" as const, label: `All (${items.length})` },
                { id: "campaign" as const, label: `Campaigns (${campaignCount})` },
                { id: "template" as const, label: `Templates (${templateCount})` },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSourceFilter(option.id)}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  sourceFilter === option.id
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background px-6 py-16 text-center">
            <p className="text-sm text-muted">No emails found to render.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => setSelected(item)}
                className="overflow-hidden rounded-xl border border-border bg-surface text-left transition hover:border-primary/30 hover:shadow-sm"
              >
                <div className="border-b border-border bg-background px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">{item.name}</div>
                      <div className="mt-1 truncate text-xs text-muted">
                        {item.subject?.trim() || "No subject"}
                      </div>
                    </div>
                    <Badge tone={item.kind === "campaign" ? "warn" : "neutral"}>
                      {item.kind === "campaign" ? "Campaign" : "Template"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <EmailPreviewFrame
                    html={item.body}
                    title={`Thumbnail ${item.name}`}
                    viewMode="desktop"
                    className="h-[220px]"
                  />
                </div>
                <div className="border-t border-border px-4 py-2 text-xs text-muted">
                  Updated {format(new Date(item.updatedAt), "MMM d, yyyy")}
                  {item.status ? ` · ${item.status}` : ""}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected ? <RenderlyDetailModal item={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}
