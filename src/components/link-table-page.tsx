"use client";

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
import { Badge } from "@/components/ui";
import { CreateNewLinkTableDropdown } from "@/components/create-new-link-table-dropdown";
import { LinkTableRowMenu } from "@/components/link-table-row-menu";
import { linkTableTypeLabel } from "@/lib/link-table";

export type LinkTableListRow = {
  id: string;
  name: string;
  type: string;
  description: string | null;
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

export function LinkTablePageClient({ tables }: { tables: LinkTableListRow[] }) {
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tables.filter((table) => {
      if (!matchesStatusFilter(table.status, statusFilter)) return false;
      if (search) {
        const query = search.toLowerCase();
        const haystack = [table.name, table.type, table.description ?? "", linkTableTypeLabel(table.type)]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [tables, statusFilter, search]);

  const hasTables = tables.length > 0;
  const hasFilteredResults = filtered.length > 0;

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
            <CreateNewLinkTableDropdown />
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
              <th className="py-3 pr-4 font-medium">Link table name</th>
              <th className="py-3 pr-4 font-medium">Type</th>
              <th className="py-3 pr-4 font-medium">Description</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Teams</th>
              <th className="py-3 pr-4 font-medium">Last edited</th>
              <th className="w-12 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((table) => (
              <tr key={table.id} className="border-b border-border last:border-0">
                <td className="py-4 pr-4 font-medium text-foreground">{table.name}</td>
                <td className="py-4 pr-4 text-muted">{linkTableTypeLabel(table.type)}</td>
                <td className="max-w-md truncate py-4 pr-4 text-muted">{table.description ?? "—"}</td>
                <td className="py-4 pr-4">
                  <Badge tone={statusTone(table.status)}>{table.status}</Badge>
                </td>
                <td className="py-4 pr-4 text-muted">VISORA</td>
                <td className="py-4 pr-4 text-muted">{format(new Date(table.updatedAt), "MMM d, yyyy")}</td>
                <td className="py-4 text-right">
                  <LinkTableRowMenu
                    tableId={table.id}
                    tableName={table.name}
                    tableType={table.type}
                    description={table.description}
                    status={table.status}
                  />
                </td>
              </tr>
            ))}

            {!hasTables ? (
              <tr>
                <td colSpan={7} className="py-16">
                  <div className="text-center">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border border-border bg-background">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
                        <rect x="12" y="10" width="40" height="48" rx="4" stroke="#CBD5E1" strokeWidth="2" />
                        <path d="M20 22h24M20 30h24M20 38h16" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="46" cy="46" r="10" fill="#4F46E5" />
                        <path d="M42 46h8M46 42v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h2 className="mt-8 text-2xl font-semibold text-foreground">You do not have any link tables yet</h2>
                    <p className="mt-2 text-sm text-muted">
                      Create a link table to organize tracked URLs across your campaigns.
                    </p>
                    <div className="mt-6 flex justify-center">
                      <CreateNewLinkTableDropdown />
                    </div>
                  </div>
                </td>
              </tr>
            ) : null}

            {hasTables && !hasFilteredResults ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm font-medium text-muted">
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
