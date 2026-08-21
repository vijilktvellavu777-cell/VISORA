"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import { CampaignDetailsCard } from "@/components/campaign-details-card";
import { CampaignTargetingStep } from "@/components/campaign-targeting-step";
import { CampaignReviewSummaryStep } from "@/components/campaign-review-summary-step";
import { PushPlatformStep } from "@/components/push-platform-step";
import { InAppMessageComposer } from "@/components/in-app-message-composer";
import {
  clearChannelWizardDraftSession,
  IN_APP_WIZARD_CREATING_KEY,
  IN_APP_WIZARD_DRAFT_KEY,
  PUSH_WIZARD_CREATING_KEY,
  PUSH_WIZARD_DRAFT_KEY,
  waitForChannelWizardDraftId,
} from "@/lib/campaign-names";
import {
  defaultInAppMessage,
  defaultPushMessage,
  parseInAppPayload,
  parsePushPayload,
  serializeInAppPayload,
  serializePushPayload,
  type InAppMessagePayload,
  type PushMessagePayload,
} from "@/lib/campaign-message";
import {
  emptyTargeting,
  parseCampaignTargeting,
  serializeCampaignTargeting,
  type CampaignTargeting,
} from "@/lib/campaign-targeting";

type SegmentOption = { id: string; name: string };
type Channel = "push" | "in_app";

type CampaignDraft = {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  body: string;
  segmentId: string | null;
  targetingRules: string;
  scheduledAt: string | null;
  status: string;
};

const STEPS = [
  { id: 1, label: "Compose message", shortLabel: "Compose" },
  { id: 2, label: "Target Audience", shortLabel: "Target" },
  { id: 3, label: "Review summary", shortLabel: "Summary" },
  { id: 4, label: "Schedule delivery", shortLabel: "Schedule" },
] as const;

const CHANNEL_CONFIG: Record<
  Channel,
  {
    label: string;
    draftKey: string;
    creatingKey: string;
    defaultName: string;
  }
> = {
  push: {
    label: "Push",
    draftKey: PUSH_WIZARD_DRAFT_KEY,
    creatingKey: PUSH_WIZARD_CREATING_KEY,
    defaultName: "New Push Campaign",
  },
  in_app: {
    label: "In-app",
    draftKey: IN_APP_WIZARD_DRAFT_KEY,
    creatingKey: IN_APP_WIZARD_CREATING_KEY,
    defaultName: "New In-app Campaign",
  },
};

function defaultCampaignName(prefix: string) {
  return `${prefix} - ${format(new Date(), "MMMM d, yyyy")}`;
}

function targetingFromCampaign(campaign: {
  segmentId: string | null;
  targetingRules?: string | null;
}): CampaignTargeting {
  const parsed = parseCampaignTargeting(campaign.targetingRules);
  if (campaign.segmentId && !parsed.segmentIds.includes(campaign.segmentId)) {
    parsed.segmentIds = [campaign.segmentId, ...parsed.segmentIds];
  }
  if (parsed.filterGroups.length === 0) {
    parsed.filterGroups = emptyTargeting().filterGroups;
  }
  return parsed;
}

function mapCampaignDraft(created: {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  body: string;
  segmentId: string | null;
  scheduledAt: string | null;
  status: string;
  targetingRules?: string | null;
}): CampaignDraft {
  return {
    id: created.id,
    name: created.name,
    description: created.description,
    subject: created.subject ?? "",
    body: created.body ?? "",
    segmentId: created.segmentId,
    targetingRules: created.targetingRules ?? "{}",
    scheduledAt: created.scheduledAt,
    status: created.status,
  };
}

export function ChannelCampaignWizard({
  channel,
  fresh = false,
  campaignId,
}: {
  channel: Channel;
  fresh?: boolean;
  campaignId?: string;
}) {
  const router = useRouter();
  const config = CHANNEL_CONFIG[channel];
  const [step, setStep] = useState(1);
  const [campaign, setCampaign] = useState<CampaignDraft | null>(null);
  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [showDescription, setShowDescription] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [targeting, setTargeting] = useState<CampaignTargeting>(emptyTargeting());
  const [pushMessage, setPushMessage] = useState<PushMessagePayload>(defaultPushMessage());
  const [inAppMessage, setInAppMessage] = useState<InAppMessagePayload>(defaultInAppMessage());

  useEffect(() => {
    let cancelled = false;

    async function loadDraft(draftId: string) {
      const response = await fetch(`/api/campaigns/${draftId}`);
      if (!response.ok) return null;
      const draft = await response.json();
      if (draft.status !== "draft" || draft.channel !== channel) return null;
      return mapCampaignDraft(draft);
    }

    async function applyLoadedDraft(draft: CampaignDraft) {
      setCampaign(draft);
      setTargeting(targetingFromCampaign(draft));
      if (draft.description) setShowDescription(true);
      if (draft.scheduledAt) {
        setScheduleMode("scheduled");
        const dt = new Date(draft.scheduledAt);
        setScheduledDate(format(dt, "yyyy-MM-dd"));
        setScheduledTime(format(dt, "HH:mm"));
      }
      if (channel === "push") {
        setPushMessage(parsePushPayload(draft.subject, draft.body));
      } else {
        setInAppMessage(parseInAppPayload(draft.subject, draft.body));
      }
    }

    async function init() {
      const segmentRes = await fetch("/api/segments").then((response) => response.json());
      if (cancelled) return;
      if (Array.isArray(segmentRes)) setSegments(segmentRes);

      if (campaignId) {
        const draft = await loadDraft(campaignId);
        if (cancelled) return;
        if (draft) {
          sessionStorage.setItem(config.draftKey, campaignId);
          await applyLoadedDraft(draft);
          return;
        }
        setError("Could not load campaign draft");
        return;
      }

      if (fresh) {
        clearChannelWizardDraftSession(channel);
      }

      const savedDraftId = sessionStorage.getItem(config.draftKey);
      if (savedDraftId && !fresh) {
        const draft = await loadDraft(savedDraftId);
        if (cancelled) return;
        if (draft) {
          await applyLoadedDraft(draft);
          return;
        }
        sessionStorage.removeItem(config.draftKey);
      }

      if (sessionStorage.getItem(config.creatingKey) === "1") {
        const draftId = await waitForChannelWizardDraftId(channel);
        if (cancelled) return;
        if (draftId) {
          const draft = await loadDraft(draftId);
          if (draft) {
            await applyLoadedDraft(draft);
            return;
          }
        }
      }

      sessionStorage.setItem(config.creatingKey, "1");
      try {
        const createRes = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: defaultCampaignName(config.defaultName),
            channel,
            subject: "",
            body: channel === "push" ? JSON.stringify({ message: "", platforms: ["ios", "android", "web"] }) : "",
            autoUniqueName: true,
          }),
        });

        if (!createRes.ok) {
          if (!cancelled) setError("Could not create campaign draft");
          return;
        }

        const created = await createRes.json();
        sessionStorage.setItem(config.draftKey, created.id);
        if (cancelled) return;

        await applyLoadedDraft(mapCampaignDraft(created));
      } finally {
        sessionStorage.removeItem(config.creatingKey);
      }
    }

    init().catch(() => {
      if (!cancelled) setError("Could not load campaign wizard");
    });

    return () => {
      cancelled = true;
    };
  }, [campaignId, channel, config.creatingKey, config.defaultName, config.draftKey, fresh]);

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
      const json = await response.json().catch(() => ({}));
      const message = typeof json.error === "string" ? json.error : "Could not save campaign";
      if (response.status === 409 && data.name !== undefined) {
        setNameError(message);
      } else {
        setError(message);
      }
      return false;
    }
    const updated = await response.json();
    const nextCampaign = mapCampaignDraft(updated);
    setCampaign(nextCampaign);
    if (data.targetingRules !== undefined || data.segmentId !== undefined) {
      setTargeting(targetingFromCampaign(nextCampaign));
    }
    setError(null);
    setNameError(null);
    return true;
  }

  async function copyId() {
    if (!campaign) return;
    await navigator.clipboard.writeText(campaign.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function composePayload() {
    if (channel === "push") {
      return serializePushPayload(pushMessage);
    }
    return serializeInAppPayload(inAppMessage);
  }

  async function goNext() {
    if (!campaign) return;
    if (step === 1) {
      const messagePayload = composePayload();
      const ok = await saveCampaign({
        name: campaign.name,
        description: campaign.description,
        subject: messagePayload.subject,
        body: messagePayload.body,
      });
      if (ok) setStep(2);
      return;
    }
    if (step === 2) {
      const ok = await saveCampaign({
        segmentId: targeting.segmentIds[0] ?? null,
        targetingRules: serializeCampaignTargeting(targeting),
      });
      if (ok) setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
    }
  }

  async function finish() {
    if (!campaign) return;
    let scheduledAt: string | null = null;
    let status = "draft";

    if (scheduleMode === "scheduled" && scheduledDate) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      status = "scheduled";
    }

    const ok = await saveCampaign({ scheduledAt, status });
    if (!ok) return;
    clearChannelWizardDraftSession(channel);
    router.push(`/campaigns/${campaign.id}`);
    router.refresh();
  }

  async function saveDraft() {
    if (!campaign) return;
    const messagePayload = composePayload();
    const ok = await saveCampaign({
      name: campaign.name,
      description: campaign.description,
      subject: messagePayload.subject,
      body: messagePayload.body,
      segmentId: targeting.segmentIds[0] ?? null,
      targetingRules: serializeCampaignTargeting(targeting),
      status: "draft",
    });
    if (ok) {
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 3000);
    }
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  function goToStep(nextStep: number) {
    if (nextStep >= 1 && nextStep <= STEPS.length) setStep(nextStep);
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
        <div className="flex flex-wrap justify-between gap-4">
          {STEPS.map((item) => {
            const active = step === item.id;
            const complete = step > item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goToStep(item.id)}
                className="flex min-w-[100px] flex-1 flex-col items-center gap-2 text-center transition hover:opacity-80"
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
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-8 pb-28">
        {step === 1 ? (
          <div className="space-y-6">
            <CampaignDetailsCard
              campaign={campaign}
              showDescription={showDescription}
              nameError={nameError}
              copied={copied}
              onNameChange={(name) => {
                setCampaign({ ...campaign, name });
                if (nameError) setNameError(null);
              }}
              onDescriptionChange={(description) => setCampaign({ ...campaign, description })}
              onShowDescription={() => setShowDescription(true)}
              onCopyId={copyId}
            />
            {channel === "push" ? (
              <PushPlatformStep value={pushMessage} onChange={setPushMessage} />
            ) : (
              <InAppMessageComposer value={inAppMessage} onChange={setInAppMessage} />
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <CampaignTargetingStep segments={segments} value={targeting} onChange={setTargeting} />
        ) : null}

        {step === 3 ? (
          <CampaignReviewSummaryStep
            channel={channel}
            campaign={campaign}
            targeting={targeting}
            segments={segments}
            pushMessage={pushMessage}
            inAppMessage={inAppMessage}
            onEditStep={goToStep}
          />
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
                    onChange={(event) => setScheduledDate(event.target.value)}
                  />
                </Field>
                <Field label="Time">
                  <input
                    type="time"
                    className={inputClass}
                    value={scheduledTime}
                    onChange={(event) => setScheduledTime(event.target.value)}
                  />
                </Field>
              </div>
            ) : null}
          </Card>
        ) : null}

        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      </div>

      <footer className="fixed bottom-0 left-[240px] right-0 z-30 border-t border-border bg-surface">
        <div className="flex items-center gap-4 px-6 py-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous step"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-4 sm:gap-6">
            {STEPS.map((item) => {
              const active = step === item.id;
              const complete = step > item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToStep(item.id)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-background"
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      active
                        ? "bg-primary text-white"
                        : complete
                          ? "bg-primary/15 text-primary"
                          : "bg-primary/10 text-primary/60"
                    }`}
                  >
                    {item.id}
                  </span>
                  <span
                    className={`text-sm ${
                      active ? "font-semibold text-foreground" : complete ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {item.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              if (step < 4) goNext();
              else finish();
            }}
            disabled={saving}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={step === 4 ? "Finish campaign" : "Next step"}
          >
            <ChevronRight size={20} />
          </button>

          {saveNotice ? (
            <span className="ml-2 shrink-0 text-sm text-success">Changes saved</span>
          ) : null}

          <button
            type="button"
            onClick={saveDraft}
            disabled={saving}
            className="ml-2 shrink-0 rounded-lg border border-primary bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
        </div>
      </footer>
    </div>
  );
}
