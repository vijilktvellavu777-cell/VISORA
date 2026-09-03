"use client";

import Link from "next/link";
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
import { Badge } from "@/components/ui";
import { CreateCampaignDropdown } from "@/components/create-campaign-dropdown";
import { CampaignRowMenu } from "@/components/campaign-row-menu";
import { channelLabel } from "@/lib/messaging";

type CampaignRow = {
  id: string;
  name: string;
  status: string;
  channel: string;
  scheduledAt: string | null;
  updatedAt: string;
  segment: { name: string } | null;
  _count: { sends: number };
};

function statusTone(status: string) {
  if (status === "sent") return "ok" as const;
  if (status === "draft") return "neutral" as const;
  return "warn" as const;
}

function isActive(status: string) {
  return !["sent", "paused"].includes(status);
}

function isDraft(campaign: CampaignRow) {
  return campaign.status === "draft";
}

function draftEditHref(campaign: CampaignRow) {
  if (["email", "push", "in_app", "whatsapp"].includes(campaign.channel)) {
    return `/campaigns/${campaign.id}/edit`;
  }
  return `/campaigns/${campaign.id}`;
}

export function CampaignsPageClient({ campaigns }: { campaigns: CampaignRow[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return campaigns.filter((campaign) => {
      if (statusFilter === "active" && !isActive(campaign.status)) return false;
      if (statusFilter === "drafts" && !isDraft(campaign)) return false;
      if (statusFilter === "sent" && campaign.status !== "sent") return false;
      if (search && !campaign.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [campaigns, statusFilter, search]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Campaigns</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:bg-background"
              aria-label="Feedback"
            >
              <MessageSquare size={18} />
            </button>
            <CreateCampaignDropdown />
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
                  <option value="drafts">Drafts</option>
                  <option value="sent">Sent</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted">Tag</span>
              <div className="relative">
                <select className="min-w-[140px] appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm text-muted">
                  <option>Select…</option>
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
          </div>
          <label className="relative block min-w-[220px]">
            <span className="mb-1.5 block text-sm text-muted">Search</span>
            <input
              className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-10 text-sm outline-none focus:border-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              <th className="py-3 pr-4 font-medium">Name</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">
                <span className="inline-flex items-center gap-1">
                  Stop date
                  <Info size={12} />
                </span>
              </th>
              <th className="py-3 pr-4 font-medium">Campaign type</th>
              <th className="py-3 pr-4 font-medium">Entry schedule</th>
              <th className="py-3 pr-4 font-medium">Sent</th>
              <th className="py-3 pr-4 font-medium">Teams</th>
              <th className="py-3 pr-4 font-medium">Last edited</th>
              <th className="py-3 w-12 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted">No Results Found</p>
                    <div className="mx-auto mt-8 flex h-28 w-28 items-center justify-center rounded-2xl border border-border bg-background">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
                        <rect x="12" y="10" width="40" height="48" rx="4" stroke="#CBD5E1" strokeWidth="2" />
                        <path d="M20 22h24M20 30h24M20 38h16" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="46" cy="46" r="10" fill="#4F46E5" />
                        <path d="M42 46h8M46 42v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h2 className="mt-8 text-2xl font-semibold text-foreground">You do not have any Campaigns yet</h2>
                    <p className="mt-2 text-sm text-muted">
                      Create a Campaign to turbocharge your engagement workflows.
                    </p>
                    <div className="mt-6 flex justify-center">
                      <CreateCampaignDropdown />
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((campaign) => {
                const draft = isDraft(campaign);
                return (
                <tr
                  key={campaign.id}
                  onClick={() => {
                    if (draft) router.push(draftEditHref(campaign));
                  }}
                  className={`border-b border-border last:border-0 ${
                    draft ? "cursor-pointer hover:bg-background" : ""
                  }`}
                >
                  <td className="py-4 pr-4">
                    {draft ? (
                      <Link
                        href={draftEditHref(campaign)}
                        onClick={(event) => event.stopPropagation()}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {campaign.name}
                      </Link>
                    ) : (
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {campaign.name}
                      </Link>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    <Badge tone={statusTone(campaign.status)}>{campaign.status}</Badge>
                  </td>
                  <td className="py-4 pr-4 text-muted">
                    {campaign.scheduledAt ? format(new Date(campaign.scheduledAt), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="py-4 pr-4">{channelLabel(campaign.channel)}</td>
                  <td className="py-4 pr-4 text-muted">
                    {campaign.scheduledAt ? format(new Date(campaign.scheduledAt), "MMM d, yyyy") : "Immediate"}
                  </td>
                  <td className="py-4 pr-4">{campaign._count.sends}</td>
                  <td className="py-4 pr-4 text-muted">VISORA</td>
                  <td className="py-4 pr-4 text-muted">{format(new Date(campaign.updatedAt), "MMM d, yyyy")}</td>
                  <td className="py-4 text-right" onClick={(event) => event.stopPropagation()}>
                    <CampaignRowMenu
                      campaignId={campaign.id}
                      campaignName={campaign.name}
                      status={campaign.status}
                      channel={campaign.channel}
                    />
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
