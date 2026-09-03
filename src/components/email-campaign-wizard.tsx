"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Code,
  Copy,
  Info,
  LayoutGrid,
  MousePointerClick,
  Pencil,
  X,
} from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import { CampaignTargetingStep } from "@/components/campaign-targeting-step";
import { CampaignReviewSummaryStep } from "@/components/campaign-review-summary-step";
import { CampaignScheduleStep } from "@/components/campaign-schedule-step";
import {
  clearEmailWizardDraftSession,
  EMAIL_WIZARD_CREATING_KEY,
  EMAIL_WIZARD_DRAFT_KEY,
  waitForEmailWizardDraftId,
} from "@/lib/campaign-names";
import {
  emptyTargeting,
  parseCampaignTargeting,
  serializeCampaignTargeting,
  type CampaignTargeting,
} from "@/lib/campaign-targeting";
import {
  campaignScheduleFromRecord,
  DEFAULT_CAMPAIGN_SCHEDULE,
  resolveCampaignScheduleOutcome,
  type CampaignSchedule,
} from "@/lib/campaign-schedule";
import { EmailComposeSummary } from "@/components/email-compose-summary";
import { EmailDragDropEditor } from "@/components/email-drag-drop-editor";
import { EmailHtmlEditor } from "@/components/email-html-editor";
import { EmailTemplatesPicker, type EmailTemplateItem } from "@/components/email-templates-picker";
import { TagsPicker } from "@/components/tags-picker";
import { parseTags } from "@/lib/tags";

type SegmentOption = { id: string; name: string };

type CampaignDraft = {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  preheader: string | null;
  fromAddress: string | null;
  body: string;
  segmentId: string | null;
  targetingRules: string;
  conversionEvent: string | null;
  scheduledAt: string | null;
  scheduleConfig: string | null;
  status: string;
  tags: string[];
};

type EmailTemplate = EmailTemplateItem;

const DEFAULT_FROM = "VISORA <noreply@visora.app>";
const FROM_ADDRESS_PLACEHOLDER = "VISORA <noreply@visora.app>";
const SUBJECT_PLACEHOLDER = "Your email subject";
const PREHEADER_PLACEHOLDER = "Your preheader text";

const CREATE_EMAIL_OPTIONS = [
  {
    id: "drag-drop" as const,
    title: "Drag-and-drop editor",
    subtitle: "Start from scratch",
    icon: MousePointerClick,
  },
  {
    id: "html" as const,
    title: "HTML code editor",
    subtitle: "Start from scratch",
    icon: Code,
  },
  {
    id: "templates" as const,
    title: "Templates",
    subtitle: "Choose a template",
    icon: LayoutGrid,
  },
];

const STEPS = [
  { id: 1, label: "Compose message", shortLabel: "Compose" },
  { id: 2, label: "Target Audience", shortLabel: "Target" },
  { id: 3, label: "Review summary", shortLabel: "Summary" },
  { id: 4, label: "Schedule delivery", shortLabel: "Schedule" },
] as const;

function defaultCampaignName() {
  return `New Campaign - ${format(new Date(), "MMMM d, yyyy")}`;
}

function resolveFromAddress(fromAddress: string | null) {
  const trimmed = fromAddress?.trim();
  return trimmed || DEFAULT_FROM;
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
  preheader?: string | null;
  fromAddress: string | null;
  body: string;
  segmentId: string | null;
  targetingRules?: string | null;
  conversionEvent: string | null;
  scheduledAt: string | null;
  status: string;
  tags?: string | unknown[] | null;
  scheduleConfig?: string | null;
}): CampaignDraft {
  return {
    id: created.id,
    name: created.name,
    description: created.description,
    subject: created.subject ?? "",
    preheader: created.preheader ?? "",
    fromAddress: created.fromAddress ?? "",
    body: created.body ?? "",
    segmentId: created.segmentId,
    targetingRules: created.targetingRules ?? "{}",
    conversionEvent: created.conversionEvent,
    scheduledAt: created.scheduledAt,
    scheduleConfig: created.scheduleConfig ?? null,
    status: created.status,
    tags: parseTags(created.tags),
  };
}

export function EmailCampaignWizard({
  fresh = false,
  campaignId,
}: {
  fresh?: boolean;
  campaignId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [campaign, setCampaign] = useState<CampaignDraft | null>(null);
  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [showDescription, setShowDescription] = useState(false);
  const [schedule, setSchedule] = useState<CampaignSchedule>(DEFAULT_CAMPAIGN_SCHEDULE);
  const [copied, setCopied] = useState(false);
  const [editingCampaignDetails, setEditingCampaignDetails] = useState(false);
  const [editingSendingInfo, setEditingSendingInfo] = useState(true);
  const [editorMode, setEditorMode] = useState<"drag-drop" | "html" | "templates" | null>(null);
  const [showEmailSummary, setShowEmailSummary] = useState(false);
  const [summarySendingInfoEditing, setSummarySendingInfoEditing] = useState(false);
  const [dragDropEditorOpen, setDragDropEditorOpen] = useState(false);
  const [htmlEditorOpen, setHtmlEditorOpen] = useState(false);
  const [templatesPickerOpen, setTemplatesPickerOpen] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [targeting, setTargeting] = useState<CampaignTargeting>(emptyTargeting());

  useEffect(() => {
    let cancelled = false;

    async function loadDraft(draftId: string) {
      const response = await fetch(`/api/campaigns/${draftId}`);
      if (!response.ok) return null;
      const draft = await response.json();
      if (draft.status !== "draft" || draft.channel !== "email") return null;
      return mapCampaignDraft(draft);
    }

    async function init() {
      const segmentRes = await fetch("/api/segments").then((r) => r.json());
      if (cancelled) return;
      if (Array.isArray(segmentRes)) setSegments(segmentRes);

      async function applyLoadedDraft(draft: CampaignDraft) {
        setCampaign(draft);
        setTargeting(targetingFromCampaign(draft));
        if (draft.description) setShowDescription(true);
        if (draft.body.trim()) {
          setShowEmailSummary(true);
          setEditorMode("drag-drop");
        }
        setSchedule(campaignScheduleFromRecord(draft.scheduleConfig, draft.scheduledAt));
      }

      if (campaignId) {
        const draft = await loadDraft(campaignId);
        if (cancelled) return;
        if (draft) {
          sessionStorage.setItem(EMAIL_WIZARD_DRAFT_KEY, campaignId);
          await applyLoadedDraft(draft);
          return;
        }
        setError("Could not load campaign draft");
        return;
      }

      if (fresh) {
        clearEmailWizardDraftSession();
      }

      const savedDraftId = sessionStorage.getItem(EMAIL_WIZARD_DRAFT_KEY);
      if (savedDraftId && !fresh) {
        const draft = await loadDraft(savedDraftId);
        if (cancelled) return;
        if (draft) {
          await applyLoadedDraft(draft);
          return;
        }
        sessionStorage.removeItem(EMAIL_WIZARD_DRAFT_KEY);
      }

      if (sessionStorage.getItem(EMAIL_WIZARD_CREATING_KEY) === "1") {
        const draftId = await waitForEmailWizardDraftId();
        if (cancelled) return;
        if (draftId) {
          const draft = await loadDraft(draftId);
          if (draft) {
            await applyLoadedDraft(draft);
            return;
          }
        }
      }

      sessionStorage.setItem(EMAIL_WIZARD_CREATING_KEY, "1");
      try {
        const createRes = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: defaultCampaignName(),
            channel: "email",
            subject: "",
            fromAddress: DEFAULT_FROM,
            body: "",
            autoUniqueName: true,
          }),
        });

        if (!createRes.ok) {
          if (!cancelled) setError("Could not create campaign draft");
          return;
        }

        const created = await createRes.json();
        sessionStorage.setItem(EMAIL_WIZARD_DRAFT_KEY, created.id);
        if (cancelled) return;

        await applyLoadedDraft(mapCampaignDraft(created));
      } finally {
        sessionStorage.removeItem(EMAIL_WIZARD_CREATING_KEY);
      }
    }

    init().catch(() => {
      if (!cancelled) setError("Could not load campaign wizard");
    });

    return () => {
      cancelled = true;
    };
  }, [fresh, campaignId]);

  async function saveCampaign(
    data: Partial<Omit<CampaignDraft, "scheduleConfig">> & {
      status?: string;
      tags?: string[];
      scheduleConfig?: CampaignSchedule;
    },
  ) {
    if (!campaign) return false;
    setSaving(true);
    const response = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        ...(data.fromAddress !== undefined
          ? { fromAddress: resolveFromAddress(data.fromAddress) }
          : {}),
      }),
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

  function handleChooseNewTemplate() {
    setShowEmailSummary(false);
    setEditorMode(null);
    setSummarySendingInfoEditing(false);
  }

  function handleEmailEditorDone(html: string, mode: "drag-drop" | "html") {
    setCampaign((prev) => (prev ? { ...prev, body: html } : prev));
    setEditorMode(mode);
    setShowEmailSummary(true);
    setSummarySendingInfoEditing(false);
    if (mode === "drag-drop") setDragDropEditorOpen(false);
    if (mode === "html") setHtmlEditorOpen(false);
  }

  async function selectEditorMode(mode: "drag-drop" | "html" | "templates") {
    setEditorMode(mode);
    if (mode === "drag-drop") {
      setDragDropEditorOpen(true);
      return;
    }
    if (mode === "html") {
      if (!campaign?.body?.trim()) {
        setCampaign((prev) =>
          prev
            ? {
                ...prev,
                body: "<html>\n  <body>\n    <p>Hi {{ first_name }},</p>\n  </body>\n</html>",
              }
            : prev,
        );
      }
      setHtmlEditorOpen(true);
      return;
    }
    if (mode === "templates") {
      setTemplatesPickerOpen(true);
      return;
    }
  }

  function applyTemplate(template: EmailTemplate) {
    setCampaign((prev) =>
      prev
        ? {
            ...prev,
            subject: template.subject ?? prev.subject,
            body: template.body,
          }
        : prev,
    );
    setSelectedTemplateName(template.name);
    setEditorMode("templates");
    setShowEmailSummary(true);
    setSummarySendingInfoEditing(false);
  }

  function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === "string" ? reader.result : "";
      setEditorMode("html");
      setCampaign((prev) => (prev ? { ...prev, body: content } : prev));
      setUploadFileName(file.name);
      setHtmlEditorOpen(true);
      setError(null);
    };
    reader.onerror = () => setError("Could not read the uploaded file");
    reader.readAsText(file);
    event.target.value = "";
  }

  async function goNext() {
    if (!campaign) return;
    if (step === 1) {
      const ok = await saveCampaign({
        name: campaign.name,
        description: campaign.description,
        fromAddress: campaign.fromAddress,
        subject: campaign.subject,
        preheader: campaign.preheader,
        body: campaign.body,
        tags: campaign.tags,
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
      return;
    }
  }

  async function finish(saveOnly: boolean) {
    if (!campaign) return;
    const { scheduledAt, status } = resolveCampaignScheduleOutcome(schedule);

    const ok = await saveCampaign({ scheduledAt, status, scheduleConfig: schedule });
    if (!ok) return;
    clearEmailWizardDraftSession();
    if (saveOnly) {
      router.push("/campaigns");
      router.refresh();
    } else {
      router.push(`/campaigns/${campaign.id}`);
      router.refresh();
    }
  }

  async function saveDraft() {
    if (!campaign) return;
    const ok = await saveCampaign({
      name: campaign.name,
      description: campaign.description,
      fromAddress: campaign.fromAddress,
      subject: campaign.subject,
      preheader: campaign.preheader,
      body: campaign.body,
      segmentId: targeting.segmentIds[0] ?? null,
      targetingRules: serializeCampaignTargeting(targeting),
      tags: campaign.tags,
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
            <Card className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">Campaign Details</h2>
                <button
                  type="button"
                  onClick={() => setEditingCampaignDetails((value) => !value)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
                  aria-label="Edit campaign details"
                >
                  <Pencil size={16} />
                </button>
              </div>

              {editingCampaignDetails ? (
                <div className="mt-4 space-y-4">
                  <Field label="Campaign Name">
                    <input
                      className={`${inputClass} ${nameError ? "border-error focus:border-error" : ""}`}
                      value={campaign.name}
                      onChange={(e) => {
                        setCampaign({ ...campaign, name: e.target.value });
                        if (nameError) setNameError(null);
                      }}
                    />
                    {nameError ? <p className="mt-1.5 text-sm text-error">{nameError}</p> : null}
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
                  <TagsPicker
                    value={campaign.tags}
                    onChange={(tags) => {
                      setCampaign({ ...campaign, tags });
                      void saveCampaign({ tags });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setEditingCampaignDetails(false)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Done editing
                  </button>
                </div>
              ) : (
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">Campaign Name</dt>
                    <dd className="mt-1 text-foreground">{campaign.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">Description</dt>
                    <dd className={`mt-1 ${campaign.description?.trim() ? "text-foreground" : "text-muted"}`}>
                      {campaign.description?.trim() || "No description"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">Tags</dt>
                    {campaign.tags.length > 0 ? (
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {campaign.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </dd>
                    ) : (
                      <dd className="mt-1 text-muted">No tags</dd>
                    )}
                  </div>
                </dl>
              )}

              <hr className="my-5 border-border" />

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
            </Card>

            {!showEmailSummary ? (
            <Card className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">Sending info</h2>
                <button
                  type="button"
                  onClick={() => setEditingSendingInfo((value) => !value)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
                  aria-label="Edit sending info"
                >
                  <Pencil size={16} />
                </button>
              </div>

              {editingSendingInfo ? (
                <div className="mt-4 space-y-4">
                  <Field label="From address">
                    <input
                      className={inputClass}
                      value={campaign.fromAddress ?? ""}
                      onChange={(e) => setCampaign({ ...campaign, fromAddress: e.target.value })}
                      placeholder={FROM_ADDRESS_PLACEHOLDER}
                    />
                  </Field>
                  <Field label="Subject line">
                    <input
                      className={inputClass}
                      value={campaign.subject ?? ""}
                      onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                      placeholder={SUBJECT_PLACEHOLDER}
                    />
                  </Field>
                  <Field label="Preheader">
                    <input
                      className={inputClass}
                      value={campaign.preheader ?? ""}
                      onChange={(e) => setCampaign({ ...campaign, preheader: e.target.value })}
                      placeholder={PREHEADER_PLACEHOLDER}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => setEditingSendingInfo(false)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Done editing
                  </button>
                </div>
              ) : (
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">From address</dt>
                    <dd
                      className={`mt-1 ${campaign.fromAddress?.trim() ? "text-foreground" : "text-muted"}`}
                    >
                      {campaign.fromAddress?.trim() || FROM_ADDRESS_PLACEHOLDER}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">Subject line</dt>
                    <dd className={`mt-1 ${campaign.subject?.trim() ? "text-foreground" : "text-muted"}`}>
                      {campaign.subject?.trim() || SUBJECT_PLACEHOLDER}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">Preheader</dt>
                    <dd className={`mt-1 ${campaign.preheader?.trim() ? "text-foreground" : "text-muted"}`}>
                      {campaign.preheader?.trim() || PREHEADER_PLACEHOLDER}
                    </dd>
                  </div>
                </dl>
              )}
            </Card>
            ) : null}

            {showEmailSummary ? (
            <Card className="p-6">
              <EmailComposeSummary
                subject={campaign.subject ?? ""}
                fromAddress={campaign.fromAddress ?? ""}
                preheader={campaign.preheader ?? ""}
                bodyHtml={campaign.body}
                editorLabel={
                  editorMode === "html"
                    ? "HTML Code Editor"
                    : editorMode === "templates"
                      ? "Template"
                      : "Drag-And-Drop Editor"
                }
                sendingInfoEditing={summarySendingInfoEditing}
                onSendingInfoEditingChange={setSummarySendingInfoEditing}
                onSubjectChange={(value) => setCampaign({ ...campaign, subject: value })}
                onFromAddressChange={(value) => setCampaign({ ...campaign, fromAddress: value })}
                onPreheaderChange={(value) => setCampaign({ ...campaign, preheader: value })}
                onEditMessage={() => {
                  if (editorMode === "html") setHtmlEditorOpen(true);
                  else setDragDropEditorOpen(true);
                }}
                onChooseNewTemplate={handleChooseNewTemplate}
                subjectPlaceholder={SUBJECT_PLACEHOLDER}
                fromPlaceholder={FROM_ADDRESS_PLACEHOLDER}
                preheaderPlaceholder={PREHEADER_PLACEHOLDER}
              />
            </Card>
            ) : (
            <Card className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">Create new email</h2>
                <p className="mt-1 text-sm text-muted">How would you like to start?</p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {CREATE_EMAIL_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = editorMode === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectEditorMode(option.id)}
                      className={`rounded-xl border p-5 text-center transition hover:border-primary/40 hover:shadow-sm ${
                        active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-surface"
                      }`}
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-background">
                        <Icon size={28} className="text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="mt-4 text-sm font-semibold text-foreground">{option.title}</div>
                      <div className="mt-1 text-xs text-muted">{option.subtitle}</div>
                    </button>
                  );
                })}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.txt,text/html,text/plain"
                className="hidden"
                onChange={handleUploadFile}
              />
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Upload file
                </button>
                {uploadFileName ? (
                  <p className="mt-2 text-xs text-muted">Uploaded: {uploadFileName}</p>
                ) : null}
              </div>

              {editorMode === "html" ? (
                <div className="mt-6 rounded-xl border border-border bg-background p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">HTML code editor</p>
                      <p className="mt-1 text-sm text-muted">
                        {campaign.body.trim()
                          ? "Your HTML has been saved from the editor."
                          : "Open the editor to write HTML with a live preview."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHtmlEditorOpen(true)}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                      {campaign.body.trim() ? "Edit HTML" : "Open editor"}
                    </button>
                  </div>
                </div>
              ) : null}

              {editorMode === "drag-drop" ? (
                <div className="mt-6 rounded-xl border border-border bg-background p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Drag-and-drop editor</p>
                      <p className="mt-1 text-sm text-muted">
                        {campaign.body.trim()
                          ? "Your email design has been saved from the editor."
                          : "Open the editor to build your email with content blocks."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDragDropEditorOpen(true)}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                      {campaign.body.trim() ? "Edit design" : "Open editor"}
                    </button>
                  </div>
                </div>
              ) : null}

              {editorMode === "templates" ? (
                <div className="mt-6 rounded-xl border border-border bg-background p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Templates</p>
                      <p className="mt-1 text-sm text-muted">
                        {selectedTemplateName
                          ? `Selected template: ${selectedTemplateName}`
                          : "Browse saved templates or Visora templates to start your email."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTemplatesPickerOpen(true)}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                      {selectedTemplateName ? "Change template" : "Browse templates"}
                    </button>
                  </div>
                </div>
              ) : null}
            </Card>
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <CampaignTargetingStep segments={segments} value={targeting} onChange={setTargeting} />
        ) : null}

        {step === 3 ? (
          <CampaignReviewSummaryStep
            campaign={campaign}
            targeting={targeting}
            segments={segments}
            selectedTemplateName={selectedTemplateName}
            defaultFrom={DEFAULT_FROM}
            onEditStep={goToStep}
          />
        ) : null}

        {step === 4 ? (
          <CampaignScheduleStep value={schedule} onChange={setSchedule} />
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
              else finish(false);
            }}
            disabled={saving}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={step === 4 ? "Review campaign" : "Next step"}
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

      {templatesPickerOpen ? (
        <EmailTemplatesPicker
          onSelect={(template) => {
            applyTemplate(template);
            setTemplatesPickerOpen(false);
          }}
          onClose={() => setTemplatesPickerOpen(false)}
          onBuildFromScratch={(mode) => {
            setEditorMode(mode);
            if (mode === "drag-drop") setDragDropEditorOpen(true);
            if (mode === "html") setHtmlEditorOpen(true);
          }}
        />
      ) : null}

      {htmlEditorOpen ? (
        <EmailHtmlEditor
          campaignName={campaign.name}
          initialBody={campaign.body}
          onDone={(html) => handleEmailEditorDone(html, "html")}
          onClose={() => setHtmlEditorOpen(false)}
        />
      ) : null}

      {dragDropEditorOpen ? (
        <EmailDragDropEditor
          campaignName={campaign.name}
          initialBody={campaign.body}
          onDone={(html) => handleEmailEditorDone(html, "drag-drop")}
          onClose={() => setDragDropEditorOpen(false)}
        />
      ) : null}
    </div>
  );
}
