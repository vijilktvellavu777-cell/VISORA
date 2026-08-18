"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  Lock,
  Search,
  SlidersHorizontal,
  Smartphone,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { parseContentTags } from "@/lib/content-blocks";

export type InAppMessageRow = {
  id: string;
  name: string;
  title: string | null;
  status: string;
  tags: string | string[];
  updatedAt: string;
};

function statusTone(status: string) {
  if (status === "active") return "ok" as const;
  if (status === "draft") return "neutral" as const;
  return "warn" as const;
}

export function InAppMessagesPageClient({ messages }: { messages: InAppMessageRow[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return messages.filter((message) => {
      if (statusFilter === "active" && message.status !== "active") return false;
      if (statusFilter === "draft" && message.status !== "draft") return false;
      if (search && !message.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [messages, statusFilter, search]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border px-8">
        <div className="inline-flex border-b-2 border-primary py-4 text-sm font-medium text-primary">
          In-app Messages
        </div>
      </div>

      <div className="border-b border-border px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">In-app Messages</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Lock size={12} />
              Limited access
            </span>
          </div>
          <Link
            href="/campaigns/new?type=in_app&fresh=1"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Create In-app Message
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
          </div>
          <label className="relative block min-w-[240px]">
            <span className="sr-only">Search in-app message name</span>
            <input
              className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-10 text-sm outline-none focus:border-primary"
              placeholder="Search in-app message name"
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
        {filtered.length === 0 ? (
          <div className="border-t border-border py-16 text-center">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-md">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5">
                  <Smartphone size={32} className="text-primary" />
                </div>
                <h2 className="mt-6 text-lg font-semibold text-foreground">
                  You don&apos;t have any In-app Messages yet
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Create reusable in-app message templates to engage users inside your product.
                </p>
                <Link
                  href="/campaigns/new?type=in_app&fresh=1"
                  className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Create In-app Message
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted">No Results Found</p>
            )}
          </div>
        ) : (
          <table className="w-full border-t border-border text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Title</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Tags</th>
                <th className="py-3 pr-4 font-medium">Last edited</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((message) => {
                const tags = parseContentTags(message.tags);
                return (
                  <tr
                    key={message.id}
                    onClick={() => router.push(`/content/templates/in-app-messages/${message.id}/edit`)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-background"
                  >
                    <td className="py-4 pr-4 font-medium text-foreground">{message.name}</td>
                    <td className="py-4 pr-4 text-muted">{message.title ?? "—"}</td>
                    <td className="py-4 pr-4">
                      <Badge tone={statusTone(message.status)}>{message.status}</Badge>
                    </td>
                    <td className="py-4 pr-4 text-muted">{tags.length ? tags.join(", ") : "—"}</td>
                    <td className="py-4 pr-4 text-muted">{format(new Date(message.updatedAt), "MMM d, yyyy")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
