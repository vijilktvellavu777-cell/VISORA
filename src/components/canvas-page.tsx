"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ChevronDown,
  Columns3,
  Info,
  Lock,
  MessageSquare,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { CreateCanvasDropdown } from "@/components/create-canvas-dropdown";

type CanvasRow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updatedAt: string;
  segment: { name: string } | null;
  _count: { entries: number; steps: number };
};

function statusTone(status: string) {
  if (status === "active") return "ok" as const;
  if (status === "draft") return "neutral" as const;
  return "warn" as const;
}

function isActiveStatus(status: string) {
  return !["stopped", "archived", "paused"].includes(status);
}

export function CanvasPageClient({ canvases }: { canvases: CanvasRow[] }) {
  const [statusFilter, setStatusFilter] = useState("active");
  const [tagFilter, setTagFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return canvases.filter((canvas) => {
      if (statusFilter === "active" && !isActiveStatus(canvas.status)) return false;
      if (statusFilter === "draft" && canvas.status !== "draft") return false;
      if (statusFilter === "stopped" && canvas.status !== "stopped") return false;
      if (search && !canvas.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [canvases, statusFilter, search]);

  const hasFilters = statusFilter !== "all" || tagFilter !== "all" || search.length > 0;

  function resetFilters() {
    setStatusFilter("all");
    setTagFilter("all");
    setSearch("");
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border px-8 pt-4">
        <div className="flex gap-6">
          <button
            type="button"
            className="border-b-2 border-primary pb-3 text-sm font-medium text-foreground"
          >
            Canvas
          </button>
        </div>
      </div>

      <div className="border-b border-border px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Canvas</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Lock size={12} />
              Limited access
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:bg-background"
              aria-label="Feedback"
            >
              <MessageSquare size={18} />
            </button>
            <CreateCanvasDropdown />
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
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="all">All</option>
                  <option value="draft">Draft</option>
                  <option value="stopped">Stopped</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted">Tags</span>
              <div className="relative">
                <select
                  className="min-w-[140px] appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                >
                  <option value="all">All Tags</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
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
          <label className="relative block min-w-[220px]">
            <span className="sr-only">Search Canvases</span>
            <input
              className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-10 text-sm outline-none focus:border-primary"
              placeholder="Search Canvases"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-base font-semibold text-foreground">No Results Found</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">
                  <span className="inline-flex items-center gap-1">
                    Stop date
                    <Info size={12} />
                  </span>
                </th>
                <th className="py-3 pr-4 font-medium">Steps</th>
                <th className="py-3 pr-4 font-medium">Enrolled</th>
                <th className="py-3 pr-4 font-medium">Teams</th>
                <th className="py-3 font-medium">Last edited</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((canvas) => (
                <tr key={canvas.id} className="border-b border-border last:border-0">
                  <td className="py-4 pr-4">
                    <Link href={`/canvas/${canvas.id}`} className="font-medium text-foreground hover:text-primary">
                      {canvas.name}
                    </Link>
                    {canvas.description ? (
                      <p className="mt-0.5 text-xs text-muted">{canvas.description}</p>
                    ) : null}
                  </td>
                  <td className="py-4 pr-4">
                    <Badge tone={statusTone(canvas.status)}>{canvas.status}</Badge>
                  </td>
                  <td className="py-4 pr-4 text-muted">—</td>
                  <td className="py-4 pr-4">{canvas._count.steps}</td>
                  <td className="py-4 pr-4">{canvas._count.entries}</td>
                  <td className="py-4 pr-4 text-muted">VISORA</td>
                  <td className="py-4 text-muted">{format(new Date(canvas.updatedAt), "MMM d, yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Priority Sorter
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
