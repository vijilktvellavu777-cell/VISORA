"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Share2,
  Sun,
} from "lucide-react";
import type { RenderlyCampaignListItem } from "@/lib/renderly-types";
import { RenderlyEmailPreviewFrame } from "@/components/renderly-email-preview";

const TABS = [
  "Proofing",
  "Editor",
  "Previews",
  "Live Previews",
  "Links",
  "Images",
  "Content Analysis",
  "Spelling",
  "Accessibility",
  "Screen Reader",
  "AI Analysis",
] as const;

type TabId = (typeof TABS)[number];

export function RenderlyReportPageClient({ campaign }: { campaign: RenderlyCampaignListItem }) {
  const [activeTab, setActiveTab] = useState<TabId>("Proofing");
  const [device, setDevice] = useState<"desktop" | "mobile" | "previews">("desktop");
  const [copied, setCopied] = useState(false);
  const [tabScroll, setTabScroll] = useState(0);

  const updatedLabel = useMemo(
    () => format(new Date(campaign.updatedAt), "MMMM d, yyyy 'at' hh:mm a"),
    [campaign.updatedAt],
  );

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(campaign.projectAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="border-b border-border bg-surface px-8 py-4">
        <nav className="text-sm text-muted">
          <Link href="/renderly" className="hover:text-primary">
            Creative Tools
          </Link>
          <span className="mx-2">&gt;</span>
          <Link href="/renderly" className="hover:text-primary">
            Rendering
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-foreground">Rendering Report</span>
        </nav>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <h1 className="text-xl font-semibold leading-snug text-[#5b21b6] md:text-2xl">
                {campaign.proofTitle}
              </h1>
              <button
                type="button"
                className="mt-1 shrink-0 text-primary"
                aria-label="Edit proof title"
              >
                <Pencil size={16} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>Project Address:</span>
              <code className="rounded bg-background px-2 py-0.5 text-foreground">
                {campaign.projectAddress}
              </code>
              <button
                type="button"
                onClick={copyAddress}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <Copy size={14} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-muted"
              aria-label="More options"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-8 mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted">
              Subject Line
              <Pencil size={12} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {campaign.subject?.trim() || campaign.name}
            </p>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Preview Text</div>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {campaign.preheader?.trim() || "—"}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted">
              Version
              <Pencil size={12} />
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">1.0</p>
            <p className="text-xs text-muted">{updatedLabel}</p>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Previews used</div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
              {campaign.metrics.previews}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-8 mt-6 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="relative border-b border-border bg-background/80 px-2 py-2">
          <button
            type="button"
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-muted hover:bg-surface"
            aria-label="Scroll tabs left"
            onClick={() => setTabScroll((value) => Math.max(0, value - 120))}
          >
            <ChevronLeft size={18} />
          </button>
          <div
            className="mx-8 flex gap-1 overflow-hidden"
            style={{ transform: `translateX(-${tabScroll}px)` }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                {tab}
                {tab === "AI Analysis" ? (
                  <span className="ml-1.5 rounded bg-[#5b21b6]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#5b21b6]">
                    Beta
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-muted hover:bg-surface"
            aria-label="Scroll tabs right"
            onClick={() => setTabScroll((value) => value + 120)}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex min-h-[520px] flex-col lg:flex-row">
          <div className="min-w-0 flex-1 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{activeTab}</h2>
                {activeTab === "Proofing" ? (
                  <p className="mt-1 max-w-xl text-sm text-muted">
                    Utilize this section to collaborate, track comments and perform QA before moving
                    on to device previews.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted">This section is coming soon.</p>
                )}
              </div>
              {activeTab === "Proofing" ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary"
                >
                  <Send size={16} />
                  Send test
                </button>
              ) : null}
            </div>

            {activeTab === "Proofing" ? (
              <>
                <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-border pb-4">
                  {(
                    [
                      { id: "desktop" as const, label: "Desktop (0)" },
                      { id: "mobile" as const, label: "Mobile (0)" },
                      { id: "previews" as const, label: `Previews (${campaign.metrics.previews})` },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDevice(option.id)}
                      className={`rounded-lg px-3 py-1.5 text-sm ${
                        device === option.id
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted hover:bg-background"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
                    >
                      Images on ▾
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
                    >
                      <Sun size={14} />
                      Light ▾
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
                    >
                      No filter ▾
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white"
                      aria-label="Comments"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 bg-background px-4 py-8">
                  {device === "previews" ? (
                    <p className="text-center text-sm text-muted">
                      {campaign.metrics.previews} preview sessions recorded for this proof.
                    </p>
                  ) : (
                    <RenderlyEmailPreviewFrame
                      html={campaign.body}
                      title={campaign.name}
                      viewMode={device === "mobile" ? "mobile" : "desktop"}
                      className="mx-auto min-h-[480px] max-w-4xl shadow-md"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="mt-12 rounded-xl border border-dashed border-border bg-background px-6 py-16 text-center text-sm text-muted">
                {activeTab} tools will appear here in a future update.
              </div>
            )}
          </div>

          <aside className="w-full border-t border-border bg-background/50 p-6 lg:w-[320px] lg:border-t-0 lg:border-l">
            <h3 className="text-sm font-semibold text-foreground">Comments</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <select className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs">
                <option>Version 1.0</option>
              </select>
              <select className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs">
                <option>Open</option>
                <option>Resolved</option>
              </select>
            </div>
            <div className="mt-8 rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted">
              No comments yet. Collaborators can leave feedback on this proof.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
