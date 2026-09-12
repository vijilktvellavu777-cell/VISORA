"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  Columns3,
  Info,
  MessageSquare,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Badge, inputClass } from "@/components/ui";
import { LinkTableRowMenu } from "@/components/link-table-row-menu";

export type LinkTableRow = {
  id: string;
  name: string;
  url: string;
  status: string;
  updatedAt: string;
};

function statusTone(status: string) {
  if (status === "active") return "ok" as const;
  if (status === "draft") return "neutral" as const;
  return "warn" as const;
}

function matchesStatusFilter(status: string, statusFilter: string) {
  if (statusFilter === "all") return true;
  if (statusFilter === "active") return status === "active";
  if (statusFilter === "drafts") return status === "draft";
  return true;
}

export function LinkTablePageClient({ links }: { links: LinkTableRow[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [showCreateRow, setShowCreateRow] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return links.filter((link) => {
      if (!matchesStatusFilter(link.status, statusFilter)) return false;
      if (search) {
        const query = search.toLowerCase();
        if (!link.name.toLowerCase().includes(query) && !link.url.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [links, statusFilter, search]);

  const hasLinks = links.length > 0;
  const hasFilteredResults = filtered.length > 0;
  const showTableBody = hasLinks || showCreateRow;

  function resetCreateRow() {
    setShowCreateRow(false);
    setNewName("");
    setNewUrl("");
    setCreateError(null);
  }

  async function handleCreateLink() {
    setSaving(true);
    setCreateError(null);

    const response = await fetch("/api/content/link-table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, url: newUrl, status: "active" }),
    });
    const json = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setCreateError(typeof json.error === "string" ? json.error : "Could not create link.");
      return;
    }

    resetCreateRow();
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Link Table</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:bg-background"
              aria-label="Feedback"
            >
              <MessageSquare size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateRow(true);
                setCreateError(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Create new link
              <ChevronDown size={16} className={showCreateRow ? "rotate-180 transition" : "transition"} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-border px-8 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1.5 flex items-center gap-1 text-muted">
                Status
                <Info size={12} />
              </span>
              <div className="relative">
                <select
                  className="min-w-[140px] appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="all">All</option>
                  <option value="drafts">Drafts</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted">Tag</span>
              <div className="relative">
                <select className="min-w-[140px] appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm text-muted">
                  <option>Select…</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </label>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary hover:bg-background"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary hover:bg-background"
            >
              <Columns3 size={16} />
              Columns
            </button>
          </div>
          <label className="relative block min-w-[220px]">
            <span className="mb-1.5 block text-sm text-muted">Search</span>
            <input
              className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-10 text-sm outline-none focus:border-primary"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Search size={16} className="pointer-events-none absolute bottom-2.5 right-3 text-muted" />
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
        {statusFilter === "drafts" ? (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Status: Drafts
              <button type="button" onClick={() => setStatusFilter("all")} aria-label="Clear status filter">
                <X size={12} />
              </button>
            </span>
          </div>
        ) : null}
      </div>

      <div className="px-8 py-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
              <th className="py-3 pr-4 font-medium">Link name</th>
              <th className="py-3 pr-4 font-medium">Link URL</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Teams</th>
              <th className="py-3 pr-4 font-medium">Last edited</th>
              <th className="w-12 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {showCreateRow ? (
              <tr className="border-b border-border bg-primary/5">
                <td className="py-3 pr-4 align-top">
                  <label className="sr-only" htmlFor="new-link-name">
                    Link name
                  </label>
                  <input
                    id="new-link-name"
                    className={inputClass}
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="Link name"
                    autoFocus
                  />
                </td>
                <td className="py-3 pr-4 align-top">
                  <label className="sr-only" htmlFor="new-link-url">
                    Link URL
                  </label>
                  <input
                    id="new-link-url"
                    className={inputClass}
                    value={newUrl}
                    onChange={(event) => setNewUrl(event.target.value)}
                    placeholder="https://example.com"
                  />
                  {createError ? <p className="mt-2 text-xs text-error">{createError}</p> : null}
                </td>
                <td className="py-3 pr-4 align-top text-muted">—</td>
                <td className="py-3 pr-4 align-top text-muted">VISORA</td>
                <td className="py-3 pr-4 align-top text-muted">—</td>
                <td className="py-3 align-top text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetCreateRow}
                      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground hover:bg-background"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleCreateLink}
                      className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </td>
              </tr>
            ) : null}

            {filtered.map((link) => (
              <tr key={link.id} className="border-b border-border last:border-0">
                <td className="py-4 pr-4 font-medium text-foreground">{link.name}</td>
                <td className="max-w-md truncate py-4 pr-4 text-muted">{link.url}</td>
                <td className="py-4 pr-4">
                  <Badge tone={statusTone(link.status)}>{link.status}</Badge>
                </td>
                <td className="py-4 pr-4 text-muted">VISORA</td>
                <td className="py-4 pr-4 text-muted">{format(new Date(link.updatedAt), "MMM d, yyyy")}</td>
                <td className="py-4 text-right">
                  <LinkTableRowMenu
                    linkId={link.id}
                    linkName={link.name}
                    linkUrl={link.url}
                    status={link.status}
                  />
                </td>
              </tr>
            ))}

            {!showTableBody ? (
              <tr>
                <td colSpan={6} className="py-16">
                  <div className="text-center">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border border-border bg-background">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
                        <rect x="12" y="10" width="40" height="48" rx="4" stroke="#CBD5E1" strokeWidth="2" />
                        <path d="M20 22h24M20 30h24M20 38h16" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="46" cy="46" r="10" fill="#4F46E5" />
                        <path d="M42 46h8M46 42v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h2 className="mt-8 text-2xl font-semibold text-foreground">You do not have any links yet</h2>
                    <p className="mt-2 text-sm text-muted">
                      Create a new link to manage tracked URLs across your campaigns.
                    </p>
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowCreateRow(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                      >
                        Create new link
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : null}

            {hasLinks && !hasFilteredResults && !showCreateRow ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm font-medium text-muted">
                  No Results Found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
