"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui";

const STARRED_SEGMENTS_KEY = "visora-starred-segments";

export type SegmentRow = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
  createdAt: string;
  count: number;
};

function readStarredIds() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = localStorage.getItem(STARRED_SEGMENTS_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function writeStarredIds(ids: Set<string>) {
  localStorage.setItem(STARRED_SEGMENTS_KEY, JSON.stringify(Array.from(ids)));
}

export function SegmentsPageClient({ segments }: { segments: SegmentRow[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("active");
  const [tagFilter, setTagFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setStarredIds(readStarredIds());
  }, []);

  const filtered = useMemo(() => {
    return segments.filter((segment) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesName = segment.name.toLowerCase().includes(query);
        const matchesDescription = segment.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) return false;
      }
      if (starredOnly && !starredIds.has(segment.id)) return false;
      return true;
    });
  }, [segments, statusFilter, search, starredOnly, starredIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const startRow = filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, filtered.length);

  function toggleStar(segmentId: string) {
    setStarredIds((current) => {
      const next = new Set(current);
      if (next.has(segmentId)) next.delete(segmentId);
      else next.add(segmentId);
      writeStarredIds(next);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border px-8">
        <div className="inline-flex border-b-2 border-primary py-4 text-sm font-medium text-primary">
          Segments
        </div>
      </div>

      <div className="border-b border-border px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Segments</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary bg-surface text-primary hover:bg-primary/5"
              aria-label="Feedback"
            >
              <MessageSquare size={18} />
            </button>
            <Link
              href="/audience/segments/new"
              className="inline-flex items-center rounded-lg border border-primary bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Create Segment
            </Link>
          </div>
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
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="active">Active</option>
                  <option value="all">All</option>
                </select>
                {statusFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setPage(1);
                    }}
                    className="absolute right-7 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    aria-label="Clear status filter"
                  >
                    <X size={12} />
                  </button>
                ) : null}
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
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
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </label>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-primary bg-surface px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-primary bg-surface px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <Columns3 size={16} />
              Columns
            </button>

            <label className="inline-flex items-center gap-2 pb-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={starredOnly}
                onChange={(event) => {
                  setStarredOnly(event.target.checked);
                  setPage(1);
                }}
                className="accent-primary"
              />
              Show starred only
            </label>
          </div>

          <label className="relative block min-w-[260px]">
            <span className="mb-1.5 block text-sm text-muted">Search</span>
            <input
              className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-10 text-sm outline-none focus:border-primary"
              placeholder="Search for segments"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Search size={16} className="pointer-events-none absolute bottom-2.5 right-3 text-muted" />
          </label>
        </div>

        {statusFilter === "active" ? (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Status: Active
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setPage(1);
                }}
                aria-label="Clear status filter"
              >
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
              <th className="w-10 py-3 pr-3 font-medium">
                <span className="sr-only">Star</span>
              </th>
              <th className="py-3 pr-4 font-medium">Name</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Profiles</th>
              <th className="py-3 pr-4 font-medium">Last edited</th>
              <th className="py-3 pr-4 font-medium">Created by</th>
              <th className="py-3 font-medium">Teams</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-muted">
                  No Results Found
                </td>
              </tr>
            ) : (
              paginated.map((segment) => {
                const starred = starredIds.has(segment.id);
                return (
                  <tr
                    key={segment.id}
                    onClick={() => router.push(`/audience/segments/${segment.id}`)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-background"
                  >
                    <td className="py-4 pr-3" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleStar(segment.id)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-surface ${
                          starred ? "text-warning" : "text-muted hover:text-foreground"
                        }`}
                        aria-label={starred ? "Unstar segment" : "Star segment"}
                      >
                        <Star size={16} fill={starred ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="py-4 pr-4">
                      <Link
                        href={`/audience/segments/${segment.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {segment.name}
                      </Link>
                      {segment.description ? (
                        <p className="mt-1 text-xs text-muted">{segment.description}</p>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4">
                      <Badge tone="ok">Active</Badge>
                    </td>
                    <td className="py-4 pr-4">{segment.count.toLocaleString()}</td>
                    <td className="py-4 pr-4 text-muted">
                      {format(new Date(segment.updatedAt), "MMM d, yyyy")}
                    </td>
                    <td className="py-4 pr-4 text-muted">VISORA</td>
                    <td className="py-4 text-muted">VISORA</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-8 py-4 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-4">
          <span>
            Showing rows {startRow} - {endRow} of {filtered.length}
          </span>
          <span className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden />
          <label className="inline-flex items-center gap-2">
            Rows per page:
            <div className="relative">
              <select
                className="appearance-none rounded-lg border border-border bg-surface py-1.5 pl-3 pr-8 text-sm text-foreground"
                value={rowsPerPage}
                onChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(1);
                }}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary px-2 text-sm font-medium text-white"
          >
            {currentPage}
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
