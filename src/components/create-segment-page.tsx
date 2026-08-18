"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calculator,
  ChevronDown,
  List,
  LogIn,
  Search,
  Tag,
  X,
} from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import {
  emptySegmentBuilder,
  SegmentBuilderCard,
  type BuilderState,
} from "@/components/segment-builder-card";
import { buildSegmentRulesPayload } from "@/lib/segment-builder";

function defaultSegmentName() {
  return "New Segment";
}

export function CreateSegmentPage() {
  const router = useRouter();
  const [name, setName] = useState(defaultSegmentName());
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [appsTarget, setAppsTarget] = useState("specific");
  const [specificApps, setSpecificApps] = useState<string[]>(["visora-web"]);
  const [analyticsTracking, setAnalyticsTracking] = useState(false);
  const [builder, setBuilder] = useState<BuilderState>(emptySegmentBuilder());
  const [lookupQuery, setLookupQuery] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/segments?stats=1")
      .then((response) => response.json())
      .then((data) => {
        if (typeof data.totalUsers === "number") setTotalUsers(data.totalUsers);
      })
      .catch(() => undefined);
  }, []);

  const estimatedUsers = 0;
  const estimatedPercent = totalUsers > 0 ? ((estimatedUsers / totalUsers) * 100).toFixed(1) : "0.0";

  async function saveSegment() {
    if (!name.trim()) {
      setError("Segment name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    const rules = buildSegmentRulesPayload({
      appsTarget,
      specificApps,
      analyticsTracking,
      filterGroups: builder.filterGroups,
      exclusionGroups: builder.exclusionGroups,
    });

    const response = await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        rules,
      }),
    });

    setSaving(false);
    if (!response.ok) {
      setError("Could not create segment");
      return;
    }

    router.push("/audience/segments");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="border-b border-border bg-surface px-6 pt-3">
        <div className="flex items-center gap-1 text-sm">
          <Link href="/audience" className="rounded-t-lg px-3 py-2 text-muted hover:text-foreground">
            Segments
          </Link>
          <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-background px-3 py-2 font-medium text-foreground">
            {name.length > 34 ? `${name.slice(0, 34)}…` : name || "New Segment"}
            <Link href="/audience/segments" className="text-muted hover:text-foreground" aria-label="Close">
              <X size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Create segment</h1>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card className="space-y-5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-foreground">Segment Details</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    User Data
                    <ChevronDown size={14} />
                  </button>
                  <Link
                    href="/campaigns/new?type=email&fresh=1"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Create campaign
                    <ChevronDown size={14} />
                  </Link>
                </div>
              </div>

              <Field label="Segment Name">
                <input
                  className={inputClass}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>

              {showDescription ? (
                <Field label="Description">
                  <textarea
                    className={`${inputClass} min-h-20`}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </Field>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDescription(true)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  + Add description
                </button>
              )}

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary"
              >
                <Tag size={14} />
                Tags
                <ChevronDown size={14} />
              </button>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Apps and websites targeted">
                  <div className="relative">
                    <select
                      className={`${inputClass} appearance-none pr-8`}
                      value={appsTarget}
                      onChange={(event) => setAppsTarget(event.target.value)}
                    >
                      <option value="all">Users from all apps</option>
                      <option value="specific">Users from specific apps</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                  </div>
                </Field>

                <Field label="Specific Apps">
                  <div className="relative">
                    <select
                      className={`${inputClass} appearance-none pr-8`}
                      value={specificApps[0] ?? ""}
                      onChange={(event) => setSpecificApps(event.target.value ? [event.target.value] : [])}
                      disabled={appsTarget !== "specific"}
                    >
                      <option value="visora-web">VISORA Web</option>
                      <option value="visora-ios">VISORA iOS</option>
                      <option value="visora-android">VISORA Android</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                  </div>
                </Field>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <span className="text-sm font-medium text-foreground">Analytics Tracking</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analyticsTracking}
                  onClick={() => setAnalyticsTracking((value) => !value)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    analyticsTracking ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      analyticsTracking ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </Card>

            <SegmentBuilderCard value={builder} onChange={setBuilder} />

            <Card className="space-y-4 p-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">User Lookup</h2>
                <p className="mt-1 text-sm text-muted">
                  Check if a user matches the segment, filter, and app criteria
                </p>
              </div>
              <div className="relative">
                <input
                  className={`${inputClass} pr-12`}
                  placeholder="Search by External User ID or VISORA ID"
                  value={lookupQuery}
                  onChange={(event) => setLookupQuery(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-foreground"
                  aria-label="Search user"
                >
                  <Search size={16} />
                </button>
              </div>
            </Card>
          </div>

          <aside>
            <Card className="sticky top-8 space-y-5 p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">Reachable users</h2>
                <LogIn size={18} className="text-primary" />
              </div>

              <div>
                <div className="text-sm text-muted">Estimated users</div>
                <div className="mt-1 text-4xl font-semibold text-foreground">{estimatedUsers.toLocaleString()}</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full w-0 rounded-full bg-primary" />
                </div>
                <div className="mt-2 text-sm text-muted">{estimatedPercent}% of total users</div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Show breakdown
                <ChevronDown size={14} />
              </button>

              <div className="space-y-3 border-t border-border pt-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Calculator size={16} />
                  Calculate exact statistics
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <List size={16} />
                  View calculation queue
                </button>
              </div>
            </Card>
          </aside>
        </div>

        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      </div>

      <footer className="fixed bottom-0 left-[240px] right-0 z-30 border-t border-border bg-surface px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
          <Link
            href="/audience/segments"
            className="rounded-lg border border-primary px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={saveSegment}
            disabled={saving}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save segment"}
          </button>
        </div>
      </footer>
    </div>
  );
}
