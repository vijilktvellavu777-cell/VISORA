"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  ChevronDown,
  Copy,
  Info,
  Lock,
  Tag,
  X,
} from "lucide-react";
import { Button, Card, Field, inputClass } from "@/components/ui";

type SegmentOption = { id: string; name: string };

type CampaignDraft = {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  body: string;
  segmentId: string | null;
  conversionEvent: string | null;
  scheduledAt: string | null;
  status: string;
};

const STEPS = [
  { id: 1, label: "Compose message" },
  { id: 2, label: "Target audience" },
  { id: 3, label: "Assign conversions" },
  { id: 4, label: "Schedule delivery" },
] as const;

const CONVERSION_EVENTS = [
  { value: "", label: "No conversion tracking" },
  { value: "purchase", label: "Purchase" },
  { value: "signup", label: "Signup" },
  { value: "conversion", label: "Conversion" },
  { value: "order_completed", label: "Order completed" },
];

function defaultCampaignName() {
  return `New Campaign - ${format(new Date(), "MMMM d, yyyy")}`;
}

export function EmailCampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [campaign, setCampaign] = useState<CampaignDraft | null>(null);
  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [showDescription, setShowDescription] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      const [segmentRes, createRes] = await Promise.all([
        fetch("/api/segments").then((r) => r.json()),
        fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: defaultCampaignName(),
            channel: "email",
            subject: "",
            body: "Hi {{ first_name }},\n\n",
          }),
        }),
      ]);

      if (Array.isArray(segmentRes)) setSegments(segmentRes);
      if (!createRes.ok) {
        setError("Could not create campaign draft");
        return;
      }
      const created = await createRes.json();
      setCampaign({
        id: created.id,
        name: created.name,
        description: created.description,
        subject: created.subject ?? "",
        body: created.body ?? "",
        segmentId: created.segmentId,
        conversionEvent: created.conversionEvent,
        scheduledAt: created.scheduledAt,
        status: created.status,
      });
      if (created.description) setShowDescription(true);
      if (created.scheduledAt) {
        setScheduleMode("scheduled");
        const dt = new Date(created.scheduledAt);
        setScheduledDate(format(dt, "yyyy-MM-dd"));
        setScheduledTime(format(dt, "HH:mm"));
      }
    }
    init().catch(() => setError("Could not load campaign wizard"));
  }, []);

  async function saveCampaign(data: Partial<CampaignDraft> & { status?: string }) {
    if (!campaign) return false;
    setSaving(true);
    const response = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (!response.ok) {
      setError("Could not save campaign");
      return false;
    }
    const updated = await response.json();
    setCampaign({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      subject: updated.subject ?? "",
      body: updated.body ?? "",
      segmentId: updated.segmentId,
      conversionEvent: updated.conversionEvent,
      scheduledAt: updated.scheduledAt,
      status: updated.status,
    });
    setError(null);
    return true;
  }

  async function copyId() {
    if (!campaign) return;
    await navigator.clipboard.writeText(campaign.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function goNext() {
    if (!campaign) return;
    if (step === 1) {
      const ok = await saveCampaign({
        name: campaign.name,
        description: campaign.description,
        subject: campaign.subject,
        body: campaign.body,
      });
      if (ok) setStep(2);
      return;
    }
    if (step === 2) {
      const ok = await saveCampaign({ segmentId: campaign.segmentId });
      if (ok) setStep(3);
      return;
    }
    if (step === 3) {
      const ok = await saveCampaign({ conversionEvent: campaign.conversionEvent });
      if (ok) setStep(4);
      return;
    }
  }

  async function finish(saveOnly: boolean) {
    if (!campaign) return;
    let scheduledAt: string | null = null;
    let status = "draft";

    if (scheduleMode === "scheduled" && scheduledDate) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      status = "scheduled";
    }

    const ok = await saveCampaign({ scheduledAt, status });
    if (!ok) return;
    if (saveOnly) {
      router.push("/campaigns");
      router.refresh();
    } else {
      router.push(`/campaigns/${campaign.id}`);
      router.refresh();
    }
  }

  if (!campaign) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        {error ?? "Loading campaign…"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface px-6 pt-3">
        <div className="flex items-center gap-1 text-sm">
          <Link href="/campaigns" className="rounded-t-lg px-3 py-2 text-muted hover:text-foreground">
            Campaigns
          </Link>
          <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-background px-3 py-2 font-medium text-foreground">
            Edit &apos;{campaign.name.length > 28 ? `${campaign.name.slice(0, 28)}…` : campaign.name}&apos;
            <Link href="/campaigns" className="text-muted hover:text-foreground" aria-label="Close">
              <X size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-surface px-8 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <Lock size={12} />
          Limited access
        </span>

        <div className="mt-6 flex flex-wrap justify-between gap-6">
          {STEPS.map((item) => {
            const active = step === item.id;
            const complete = step > item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => item.id < step && setStep(item.id)}
                className="flex min-w-[120px] flex-1 flex-col items-center gap-2 text-center"
              >
                <span
                  className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    active
                      ? "bg-primary text-white"
                      : complete
                        ? "bg-primary/15 text-primary"
                        : "bg-primary/10 text-primary/70"
                  }`}
                >
                  {item.id}
                  {active ? (
                    <AlertCircle size={12} className="absolute -bottom-0.5 -right-0.5 fill-warning text-surface" />
                  ) : null}
                </span>
                <span className={`text-xs ${active ? "font-semibold text-foreground" : "text-muted"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-8 py-8">
        {step === 1 ? (
          <Card className="space-y-5 p-6">
            <h2 className="text-lg font-semibold text-foreground">Campaign Details</h2>
            <Field label="Campaign Name">
              <input
                className={inputClass}
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
              />
            </Field>
            {showDescription ? (
              <Field label="Description">
                <textarea
                  className={`${inputClass} min-h-20`}
                  value={campaign.description ?? ""}
                  onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
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

            <hr className="border-border" />

            <div>
              <div className="text-sm font-semibold text-foreground">Campaign ID</div>
              <div className="mt-2 flex overflow-hidden rounded-lg border border-border">
                <input
                  readOnly
                  value={campaign.id}
                  className="min-w-0 flex-1 border-0 bg-surface px-3 py-2 text-sm text-muted outline-none"
                />
                <button
                  type="button"
                  onClick={copyId}
                  className="inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  <Copy size={14} />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
                <Info size={14} className="mt-0.5 shrink-0 text-primary" />
                This is the unique key for this Campaign. Use it to identify which Campaign to send in a request to
                the Campaign Trigger API.
              </p>
            </div>

            <hr className="border-border" />

            <Field label="Email subject">
              <input
                className={inputClass}
                value={campaign.subject ?? ""}
                onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                placeholder="Your subject line"
              />
            </Field>
            <Field label="Message body">
              <textarea
                className={`${inputClass} min-h-48 font-mono text-xs`}
                value={campaign.body}
                onChange={(e) => setCampaign({ ...campaign, body: e.target.value })}
              />
            </Field>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card className="space-y-5 p-6">
            <h2 className="text-lg font-semibold text-foreground">Target audience</h2>
            <p className="text-sm text-muted">Choose which segment should receive this email campaign.</p>
            <Field label="Segment">
              <select
                className={inputClass}
                value={campaign.segmentId ?? ""}
                onChange={(e) => setCampaign({ ...campaign, segmentId: e.target.value || null })}
              >
                <option value="">All profiles</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </Field>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card className="space-y-5 p-6">
            <h2 className="text-lg font-semibold text-foreground">Assign conversions</h2>
            <p className="text-sm text-muted">
              Select a conversion event to measure performance after users receive this campaign.
            </p>
            <Field label="Conversion event">
              <select
                className={inputClass}
                value={campaign.conversionEvent ?? ""}
                onChange={(e) => setCampaign({ ...campaign, conversionEvent: e.target.value || null })}
              >
                {CONVERSION_EVENTS.map((event) => (
                  <option key={event.value || "none"} value={event.value}>
                    {event.label}
                  </option>
                ))}
              </select>
            </Field>
          </Card>
        ) : null}

        {step === 4 ? (
          <Card className="space-y-5 p-6">
            <h2 className="text-lg font-semibold text-foreground">Schedule delivery</h2>
            <p className="text-sm text-muted">Send immediately or schedule this campaign for later.</p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleMode === "immediate"}
                  onChange={() => setScheduleMode("immediate")}
                />
                Send immediately when launched
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleMode === "scheduled"}
                  onChange={() => setScheduleMode("scheduled")}
                />
                Schedule for a specific date and time
              </label>
            </div>
            {scheduleMode === "scheduled" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date">
                  <input
                    type="date"
                    className={inputClass}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </Field>
                <Field label="Time">
                  <input
                    type="time"
                    className={inputClass}
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </Field>
              </div>
            ) : null}
          </Card>
        ) : null}

        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <Button href="/campaigns" variant="ghost">
                Cancel
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step === 4 ? (
              <>
                <Button variant="ghost" onClick={() => finish(true)}>
                  {saving ? "Saving…" : "Save draft"}
                </Button>
                <Button onClick={() => finish(false)}>{saving ? "Saving…" : "Review campaign"}</Button>
              </>
            ) : (
              <Button onClick={goNext}>{saving ? "Saving…" : "Next"}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
