"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, ChevronDown, MessageSquare, Search } from "lucide-react";
import { Badge, inputClass } from "@/components/ui";
import { LinkTableLinkRowMenu } from "@/components/link-table-link-row-menu";
import { linkTableTypeLabel } from "@/lib/link-table";

export type LinkTableDetail = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  status: string;
};

export type LinkTableLinkRow = {
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

export function LinkTableDetailPageClient({
  table,
  links,
}: {
  table: LinkTableDetail;
  links: LinkTableLinkRow[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showCreateRow, setShowCreateRow] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return links;
    const query = search.toLowerCase();
    return links.filter(
      (link) =>
        link.name.toLowerCase().includes(query) || link.url.toLowerCase().includes(query),
    );
  }, [links, search]);

  function resetCreateRow() {
    setShowCreateRow(false);
    setNewName("");
    setNewUrl("");
    setCreateError(null);
  }

  async function handleCreateLink() {
    setSaving(true);
    setCreateError(null);

    const response = await fetch(`/api/content/link-table/${table.id}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, url: newUrl }),
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

  const hasLinks = links.length > 0;
  const showTableBody = hasLinks || showCreateRow;

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border px-8 py-6">
        <Link
          href="/content/files/link-table"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Link Table
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{table.name}</h1>
            <p className="mt-2 text-sm text-muted">
              {linkTableTypeLabel(table.type)}
              {table.description ? ` · ${table.description}` : ""}
            </p>
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
        <label className="relative block min-w-[220px] max-w-sm">
          <span className="mb-1.5 block text-sm text-muted">Search</span>
          <input
            className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-10 text-sm outline-none focus:border-primary"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Search size={16} className="pointer-events-none absolute bottom-2.5 right-3 text-muted" />
        </label>
      </div>

      <div className="px-8 py-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
              <th className="py-3 pr-4 font-medium">Link name</th>
              <th className="py-3 pr-4 font-medium">Link URL</th>
              <th className="py-3 pr-4 font-medium">Status</th>
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
                <td className="py-4 pr-4 text-muted">{format(new Date(link.updatedAt), "MMM d, yyyy")}</td>
                <td className="py-4 text-right">
                  <LinkTableLinkRowMenu
                    linkTableId={table.id}
                    linkId={link.id}
                    linkName={link.name}
                    linkUrl={link.url}
                  />
                </td>
              </tr>
            ))}

            {!showTableBody ? (
              <tr>
                <td colSpan={5} className="py-16">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-foreground">You do not have any links yet</h2>
                    <p className="mt-2 text-sm text-muted">Add links with a name and URL to this table.</p>
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

            {hasLinks && filtered.length === 0 && !showCreateRow ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm font-medium text-muted">
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
