"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Info,
  Lock,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import { CampaignTargetingStep } from "@/components/campaign-targeting-step";
import { CanvasBuildStep } from "@/components/canvas-build-step";
import { CanvasEntryScheduleStep } from "@/components/canvas-entry-schedule-step";
import { CanvasSendSettingsStep } from "@/components/canvas-send-settings-step";
import { emptyTargeting, type CampaignTargeting } from "@/lib/campaign-targeting";
import {
  CANVAS_WIZARD_CREATING_KEY,
  CANVAS_WIZARD_DRAFT_KEY,
  clearCanvasWizardDraftSession,
  waitForCanvasWizardDraftId,
} from "@/lib/canvas-names";
import {
  DEFAULT_BUILD_LAYOUT,
  DEFAULT_ENTRY_SCHEDULE,
  DEFAULT_SEND_SETTINGS,
  formatEntryScheduleSummary,
  formatSendSettingsSummary,
  type CanvasBuildLayout,
  type CanvasEntrySchedule,
  type CanvasSendSettings,
} from "@/lib/canvas-wizard-types";
import { parseJson } from "@/lib/types";

type SegmentOption = { id: string; name: string };

type CanvasStepDraft = {
  type: string;
  name: string;
  config: string;
};

type CanvasDraft = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  segmentId: string | null;
  conversionEvents: string[];
  tags: string[];
  entrySchedule: CanvasEntrySchedule;
  sendSettings: CanvasSendSettings;
  buildLayout: CanvasBuildLayout;
  steps: CanvasStepDraft[];
};

const STEPS = [
  { id: 1, label: "Basics", shortLabel: "Basics" },
  { id: 2, label: "Entry Schedule", shortLabel: "Entry Schedule" },
  { id: 3, label: "Target Audience", shortLabel: "Target Audience" },
  { id: 4, label: "Send Settings", shortLabel: "Send Settings" },
  { id: 5, label: "Build Canvas", shortLabel: "Build Canvas" },
  { id: 6, label: "Summary", shortLabel: "Summary" },
] as const;

function defaultCanvasName() {
  return `New Canvas - ${format(new Date(), "MMMM d, yyyy")}`;
}

function mapCanvasDraft(raw: {
  id: string;
  name: string;
  description: string | null;
  status: string;
  segmentId: string | null;
  conversionEvents?: string | unknown[];
  tags?: string | unknown[];
  entrySchedule?: string | Record<string, unknown>;
  sendSettings?: string | Record<string, unknown>;
  buildLayout?: string | Record<string, unknown>;
  steps?: { type: string; name: string; config: string }[];
}): CanvasDraft {
  const entrySchedule = (
    typeof raw.entrySchedule === "object" && raw.entrySchedule !== null
      ? raw.entrySchedule
      : parseJson(raw.entrySchedule as string, {})
  ) as CanvasEntrySchedule;

  const sendSettings = (
    typeof raw.sendSettings === "object" && raw.sendSettings !== null
      ? raw.sendSettings
      : parseJson(raw.sendSettings as string, {})
  ) as CanvasSendSettings;

  const buildLayout = (
    typeof raw.buildLayout === "object" && raw.buildLayout !== null
      ? raw.buildLayout
      : parseJson(raw.buildLayout as string, {})
  ) as CanvasBuildLayout;

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    status: raw.status,
    segmentId: raw.segmentId,
    conversionEvents: Array.isArray(raw.conversionEvents)
      ? raw.conversionEvents.filter((value): value is string => typeof value === "string")
      : parseJson<string[]>(raw.conversionEvents as string, []),
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((value): value is string => typeof value === "string")
      : parseJson<string[]>(raw.tags as string, []),
    entrySchedule: { ...DEFAULT_ENTRY_SCHEDULE, ...entrySchedule },
    sendSettings: { ...DEFAULT_SEND_SETTINGS, ...sendSettings },
    buildLayout: { ...DEFAULT_BUILD_LAYOUT, ...buildLayout },
    steps: (raw.steps ?? []).map((step) => ({
      type: step.type,
      name: step.name,
      config: step.config ?? "{}",
    })),
  };
}

function targetingFromCanvas(canvas: { segmentId: string | null }): CampaignTargeting {
  const parsed = emptyTargeting();
  if (canvas.segmentId) parsed.segmentIds = [canvas.segmentId];
  return parsed;
}

function StepNav({
  step,
  onStep,
  compact = false,
}: {
  step: number;
  onStep: (next: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap justify-between gap-4 ${compact ? "gap-2" : ""}`}>
      {STEPS.map((item) => {
        const active = step === item.id;
        const complete = step > item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onStep(item.id)}
            className={`flex flex-1 flex-col items-center gap-2 text-center transition hover:opacity-80 ${
              compact ? "min-w-[72px]" : "min-w-[88px]"
            }`}
          >
            <span
              className={`relative inline-flex items-center justify-center rounded-full text-sm font-semibold ${
                compact ? "h-7 w-7" : "h-9 w-9"
              } ${
                active
                  ? "bg-primary text-white"
                  : complete
                    ? "bg-primary/15 text-primary"
                    : "bg-primary/10 text-primary/70"
              }`}
            >
              {item.id}
              {active ? (
                <AlertCircle
                  size={compact ? 10 : 12}
                  className="absolute -bottom-0.5 -right-0.5 fill-warning text-surface"
                />
              ) : null}
            </span>
            <span className={`text-xs ${active ? "font-semibold text-foreground" : "text-muted"}`}>
              {compact ? item.shortLabel.split(" ")[0] : item.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function CanvasWizard({ fresh = false, canvasId }: { fresh?: boolean; canvasId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [canvas, setCanvas] = useState<CanvasDraft | null>(null);
  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [targeting, setTargeting] = useState<CampaignTargeting>(emptyTargeting());
  const [showDescription, setShowDescription] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newConversionEvent, setNewConversionEvent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDraft(id: string) {
      const response = await fetch(`/api/canvas/${id}`);
      if (!response.ok) return null;
      const draft = await response.json();
      if (draft.status !== "draft") return null;
      return mapCanvasDraft(draft);
    }

    async function applyDraft(draft: CanvasDraft) {
      setCanvas(draft);
      setTargeting(targetingFromCanvas(draft));
      if (draft.description) setShowDescription(true);
    }

    async function init() {
      const segmentRes = await fetch("/api/segments").then((response) => response.json());
      if (cancelled) return;
      if (Array.isArray(segmentRes)) setSegments(segmentRes);

      if (canvasId) {
        const draft = await loadDraft(canvasId);
        if (cancelled) return;
        if (draft) {
          sessionStorage.setItem(CANVAS_WIZARD_DRAFT_KEY, canvasId);
          await applyDraft(draft);
          return;
        }
        setError("Could not load canvas draft");
        return;
      }

      if (fresh) clearCanvasWizardDraftSession();

      const savedDraftId = sessionStorage.getItem(CANVAS_WIZARD_DRAFT_KEY);
      if (savedDraftId && !fresh) {
        const draft = await loadDraft(savedDraftId);
        if (cancelled) return;
        if (draft) {
          await applyDraft(draft);
          return;
        }
        sessionStorage.removeItem(CANVAS_WIZARD_DRAFT_KEY);
      }

      if (sessionStorage.getItem(CANVAS_WIZARD_CREATING_KEY) === "1") {
        const draftId = await waitForCanvasWizardDraftId();
        if (cancelled) return;
        if (draftId) {
          const draft = await loadDraft(draftId);
          if (draft) {
            await applyDraft(draft);
            return;
          }
        }
      }

      sessionStorage.setItem(CANVAS_WIZARD_CREATING_KEY, "1");
      try {
        const createRes = await fetch("/api/canvas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: defaultCanvasName() }),
        });
        if (!createRes.ok) {
          if (!cancelled) setError("Could not create canvas draft");
          return;
        }
        const created = await createRes.json();
        sessionStorage.setItem(CANVAS_WIZARD_DRAFT_KEY, created.id);
        if (cancelled) return;
        await applyDraft(mapCanvasDraft(created));
      } finally {
        sessionStorage.removeItem(CANVAS_WIZARD_CREATING_KEY);
      }
    }

    init().catch(() => {
      if (!cancelled) setError("Could not load canvas wizard");
    });

    return () => {
      cancelled = true;
    };
  }, [canvasId, fresh]);

  async function saveCanvas(data: Partial<CanvasDraft> & { status?: string }) {
    if (!canvas) return false;
    setSaving(true);
    const response = await fetch(`/api/canvas/${canvas.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name ?? canvas.name,
        description: data.description ?? canvas.description,
        status: data.status,
        segmentId: data.segmentId ?? targeting.segmentIds[0] ?? canvas.segmentId ?? null,
        conversionEvents: data.conversionEvents ?? canvas.conversionEvents,
        tags: data.tags ?? canvas.tags,
        entrySchedule: data.entrySchedule ?? canvas.entrySchedule,
        sendSettings: data.sendSettings ?? canvas.sendSettings,
        buildLayout: data.buildLayout ?? canvas.buildLayout,
        steps: data.steps ?? canvas.steps,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setError("Could not save canvas");
      return false;
    }
    const updated = await response.json();
    setCanvas(mapCanvasDraft(updated));
    setError(null);
    return true;
  }

  async function copyId() {
    if (!canvas) return;
    await navigator.clipboard.writeText(canvas.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function addConversionEvent() {
    if (!canvas) return;
    const value = newConversionEvent.trim();
    if (!value) return;
    if (canvas.conversionEvents.length >= 4) return;
    if (canvas.conversionEvents.includes(value)) return;
    setCanvas({ ...canvas, conversionEvents: [...canvas.conversionEvents, value] });
    setNewConversionEvent("");
  }

  function removeConversionEvent(index: number) {
    if (!canvas) return;
    setCanvas({
      ...canvas,
      conversionEvents: canvas.conversionEvents.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  async function saveDraft(options?: { continueToSummary?: boolean }) {
    if (!canvas) return false;
    const ok = await saveCanvas({
      name: canvas.name,
      description: canvas.description,
      conversionEvents: canvas.conversionEvents,
      entrySchedule: canvas.entrySchedule,
      sendSettings: canvas.sendSettings,
      buildLayout: canvas.buildLayout,
      steps: canvas.steps,
      status: options?.continueToSummary ? canvas.status : "draft",
    });
    if (ok && !options?.continueToSummary) {
      clearCanvasWizardDraftSession();
      router.push("/canvas");
      router.refresh();
    }
    if (ok && options?.continueToSummary) {
      setStep(6);
    }
    return ok;
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  function goToStep(nextStep: number) {
    if (nextStep >= 1 && nextStep <= STEPS.length) setStep(nextStep);
  }

  async function goNext() {
    if (!canvas) return;
    const ok = await saveCanvas({
      name: canvas.name,
      description: canvas.description,
      conversionEvents: canvas.conversionEvents,
      entrySchedule: canvas.entrySchedule,
      sendSettings: canvas.sendSettings,
      buildLayout: canvas.buildLayout,
      steps: canvas.steps,
    });
    if (ok && step < STEPS.length) setStep(step + 1);
  }

  if (!canvas) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        {error ?? "Loading canvas…"}
      </div>
    );
  }

  const tabTitle =
    canvas.name.length > 28 ? `Edit '${canvas.name.slice(0, 28)}…'` : `Edit '${canvas.name}'`;

  const isBuildStep = step === 5;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border bg-surface px-6 pt-3">
        <div className="flex items-center gap-1 text-sm">
          <Link href="/canvas" className="rounded-t-lg px-3 py-2 text-muted hover:text-foreground">
            Canvas
          </Link>
          <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-background px-3 py-2 font-medium text-foreground">
            {tabTitle}
            <Link href="/canvas" className="text-muted hover:text-foreground" aria-label="Close">
              <X size={14} />
            </Link>
          </div>
        </div>
        {!isBuildStep ? (
          <div className="mt-2 pb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Lock size={12} />
              Limited access
            </span>
          </div>
        ) : null}
      </div>

      {!isBuildStep ? (
        <div className="border-b border-border bg-surface px-8 py-4">
          <StepNav step={step} onStep={goToStep} />
        </div>
      ) : null}

      <div className={isBuildStep ? "flex min-h-0 flex-1 flex-col" : "mx-auto max-w-4xl px-8 py-8 pb-28"}>
        {step === 1 ? (
          <div className="space-y-6">
            <Card className="space-y-5 p-6">
              <h2 className="text-lg font-semibold text-foreground">Set Up Canvas Details</h2>
              <Field label="Canvas Name">
                <input
                  className={inputClass}
                  value={canvas.name}
                  onChange={(event) => setCanvas({ ...canvas, name: event.target.value })}
                />
              </Field>
              {showDescription ? (
                <Field label="Description">
                  <textarea
                    className={`${inputClass} min-h-20`}
                    value={canvas.description ?? ""}
                    onChange={(event) => setCanvas({ ...canvas, description: event.target.value })}
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
                <div className="text-sm font-semibold text-foreground">Canvas ID</div>
                <div className="mt-2 flex overflow-hidden rounded-lg border border-border">
                  <input
                    readOnly
                    value={canvas.id}
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
                  This is the unique key for this Canvas. Use it to identify which Canvas to send in a request to the
                  Canvas Trigger API.
                </p>
              </div>
            </Card>

            <Card className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-foreground">Assign Conversion Events</h2>
              <p className="text-sm text-muted">
                Define up to 4 conversion events to track for this Canvas. The conversion events must be assigned
                during Canvas creation, and cannot be changed once a Canvas has launched.
              </p>
              {canvas.conversionEvents.length > 0 ? (
                <ul className="space-y-2">
                  {canvas.conversionEvents.map((event, index) => (
                    <li
                      key={event}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <span>{event}</span>
                      <button
                        type="button"
                        onClick={() => removeConversionEvent(index)}
                        className="text-muted hover:text-error"
                        aria-label={`Remove ${event}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {canvas.conversionEvents.length < 4 ? (
                <div className="flex flex-wrap items-end gap-2">
                  <label className="min-w-[220px] flex-1 text-sm">
                    <span className="mb-1.5 block text-muted">Event name</span>
                    <input
                      className={inputClass}
                      value={newConversionEvent}
                      onChange={(event) => setNewConversionEvent(event.target.value)}
                      placeholder="e.g. purchase, signup"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={addConversionEvent}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    <Plus size={14} />
                    Add Conversion Event
                  </button>
                </div>
              ) : null}
            </Card>
          </div>
        ) : null}

        {step === 2 ? (
          <CanvasEntryScheduleStep
            value={canvas.entrySchedule}
            onChange={(entrySchedule) => setCanvas({ ...canvas, entrySchedule })}
          />
        ) : null}

        {step === 3 ? (
          <CampaignTargetingStep segments={segments} value={targeting} onChange={setTargeting} />
        ) : null}

        {step === 4 ? (
          <CanvasSendSettingsStep
            value={canvas.sendSettings}
            onChange={(sendSettings) => setCanvas({ ...canvas, sendSettings })}
          />
        ) : null}

        {step === 5 ? (
          <CanvasBuildStep
            layout={canvas.buildLayout}
            onChange={(buildLayout) => setCanvas({ ...canvas, buildLayout })}
            canvasName={canvas.name}
            saving={saving}
            onSave={() => saveDraft()}
            onSaveAndContinue={() => saveDraft({ continueToSummary: true })}
          />
        ) : null}

        {step === 6 ? (
          <Card className="space-y-5 p-6">
            <h2 className="text-lg font-semibold text-foreground">Summary</h2>
            <p className="text-sm text-muted">Review your canvas settings before saving.</p>
            <dl className="space-y-4 text-sm">
              <SummaryRow label="Canvas name" value={canvas.name} onEdit={() => goToStep(1)} />
              <SummaryRow
                label="Conversion events"
                value={canvas.conversionEvents.length ? canvas.conversionEvents.join(", ") : "None"}
                onEdit={() => goToStep(1)}
              />
              <SummaryRow
                label="Entry schedule"
                value={formatEntryScheduleSummary(canvas.entrySchedule)}
                onEdit={() => goToStep(2)}
              />
              <SummaryRow
                label="Target audience"
                value={
                  targeting.segmentIds[0]
                    ? segments.find((segment) => segment.id === targeting.segmentIds[0])?.name ?? "Selected segment"
                    : "All profiles"
                }
                onEdit={() => goToStep(3)}
              />
              <SummaryRow
                label="Send settings"
                value={formatSendSettingsSummary(canvas.sendSettings)}
                onEdit={() => goToStep(4)}
              />
              <SummaryRow
                label="Canvas variants"
                value={`${canvas.buildLayout.variants?.length ?? 1} variant${(canvas.buildLayout.variants?.length ?? 1) === 1 ? "" : "s"}`}
                onEdit={() => goToStep(5)}
              />
            </dl>
          </Card>
        ) : null}

        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      </div>

      {!isBuildStep ? (
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

            <div className="hidden min-w-0 flex-1 sm:block">
              <StepNav step={step} onStep={goToStep} compact />
            </div>

            <button
              type="button"
              onClick={() => {
                if (step < STEPS.length) goNext();
                else saveDraft();
              }}
              disabled={saving}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={step === STEPS.length ? "Finish" : "Next step"}
            >
              <ChevronRight size={20} />
            </button>

            <button
              type="button"
              onClick={() => saveDraft()}
              disabled={saving}
              className="ml-2 shrink-0 rounded-lg border border-primary bg-surface px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
        <dd className="mt-1 text-foreground">{value}</dd>
      </div>
      <button type="button" onClick={onEdit} className="text-sm font-medium text-primary hover:underline">
        Edit
      </button>
    </div>
  );
}
