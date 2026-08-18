"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Beaker,
  Bot,
  Braces,
  ChevronDown,
  ChevronUp,
  Clock,
  DoorOpen,
  Gauge,
  GitBranch,
  GripVertical,
  MessageSquare,
  Plus,
  Rocket,
  Send,
  Settings,
  Sparkles,
  Split,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import type { CanvasBuildLayout, CanvasBuildVariant, CanvasFlowStep } from "@/lib/canvas-wizard-types";

type Props = {
  layout: CanvasBuildLayout;
  onChange: (layout: CanvasBuildLayout) => void;
  canvasName: string;
  saving?: boolean;
  onSave: () => void;
  onSaveAndContinue: () => void;
};

type PaletteItem = {
  type: string;
  label: string;
  icon: typeof Send;
  tone: string;
};

const DRAG_MIME = "application/x-visora-canvas-component";

const ZOOM_LEVELS = [50, 75, 100, 125, 150] as const;

const COMPONENT_GROUPS: { title: string; items: PaletteItem[] }[] = [
  {
    title: "Message Controls",
    items: [
      { type: "message", label: "Message", icon: Send, tone: "bg-emerald-500" },
      { type: "delay", label: "Delay", icon: Clock, tone: "bg-violet-500" },
    ],
  },
  {
    title: "AI Actions",
    items: [{ type: "agent", label: "Agent Step", icon: Bot, tone: "bg-slate-600" }],
  },
  {
    title: "Flow Controls",
    items: [
      { type: "decision_split", label: "Decision Split", icon: Split, tone: "bg-orange-400" },
      { type: "audience_paths", label: "Audience Paths", icon: Users, tone: "bg-red-500" },
      { type: "action_paths", label: "Action Paths", icon: Zap, tone: "bg-sky-400" },
      { type: "experiment_paths", label: "Experiment Paths", icon: Beaker, tone: "bg-pink-500" },
      { type: "send_destination", label: "Send to Destination", icon: GitBranch, tone: "bg-violet-500" },
    ],
  },
  {
    title: "Audience Updates",
    items: [{ type: "context", label: "Context", icon: Braces, tone: "bg-amber-400" }],
  },
];

function createStepId() {
  return `step-${Math.random().toString(36).slice(2, 9)}`;
}

function parseDragPayload(data: DataTransfer): PaletteItem | null {
  const raw = data.getData(DRAG_MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PaletteItem;
  } catch {
    return null;
  }
}

export function CanvasBuildStep({
  layout,
  onChange,
  canvasName,
  saving = false,
  onSave,
  onSaveAndContinue,
}: Props) {
  const zoomMenuRef = useRef<HTMLDivElement>(null);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [dragOverVariantId, setDragOverVariantId] = useState<string | null>(null);
  const [dragOverCanvas, setDragOverCanvas] = useState(false);

  const variants = layout.variants ?? [{ id: "variant-1", name: "Variant 1", weight: 100 }];
  const variantSteps = layout.variantSteps ?? {};
  const entryRulesExpanded = layout.entryRulesExpanded ?? true;
  const sidebarCollapsed = layout.sidebarCollapsed ?? false;
  const zoom = layout.zoom ?? 100;
  const viewMode = layout.viewMode ?? "detailed";

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!zoomMenuRef.current?.contains(event.target as Node)) setZoomMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function updateLayout(partial: Partial<CanvasBuildLayout>) {
    onChange({ ...layout, ...partial });
  }

  function addVariant() {
    const nextIndex = variants.length + 1;
    const next: CanvasBuildVariant = {
      id: `variant-${nextIndex}`,
      name: `Variant ${nextIndex}`,
      weight: 0,
    };
    updateLayout({ variants: [...variants, next] });
  }

  function addStepToVariant(variantId: string, item: PaletteItem) {
    const nextStep: CanvasFlowStep = {
      id: createStepId(),
      componentType: item.type,
      label: item.label,
      tone: item.tone,
    };
    const current = variantSteps[variantId] ?? [];
    updateLayout({
      variantSteps: {
        ...variantSteps,
        [variantId]: [...current, nextStep],
      },
    });
  }

  function removeStep(variantId: string, stepId: string) {
    updateLayout({
      variantSteps: {
        ...variantSteps,
        [variantId]: (variantSteps[variantId] ?? []).filter((step) => step.id !== stepId),
      },
    });
  }

  function handleDropOnVariant(variantId: string, event: React.DragEvent) {
    event.preventDefault();
    setDragOverVariantId(null);
    setDragOverCanvas(false);
    const item = parseDragPayload(event.dataTransfer);
    if (item) addStepToVariant(variantId, item);
  }

  const viewLabel = viewMode === "detailed" ? "Detailed View" : "Compact View";
  const compact = viewMode === "compact";

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col bg-background">
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {!sidebarCollapsed ? (
          <aside className="flex w-[300px] min-w-[300px] shrink-0 flex-col border-r border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">Components</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Drag components onto the canvas to build your user journey.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateLayout({ sidebarCollapsed: true })}
                  className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-background hover:text-foreground"
                  aria-label="Collapse sidebar"
                >
                  <ArrowLeftRight size={16} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {COMPONENT_GROUPS.map((group) => (
                <div key={group.title} className="mb-6 last:mb-0">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData(DRAG_MIME, JSON.stringify(item));
                            event.dataTransfer.effectAllowed = "copy";
                          }}
                          className="flex w-full cursor-grab items-center gap-3 rounded-lg border border-transparent bg-surface px-2 py-2.5 active:cursor-grabbing hover:border-border hover:bg-background hover:shadow-sm"
                        >
                          <GripVertical size={14} className="shrink-0 text-muted/60" />
                          <span
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${item.tone}`}
                          >
                            <Icon size={16} />
                          </span>
                          <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-4 py-4">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted hover:bg-background hover:text-foreground"
              >
                <Sparkles size={14} />
                Clean Up Canvas
              </button>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => updateLayout({ sidebarCollapsed: false })}
            className="flex w-12 shrink-0 items-center justify-center border-r border-border bg-surface text-muted hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <ArrowLeftRight size={16} />
          </button>
        )}

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50">
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-5 py-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
            >
              Expand
              <ChevronDown size={14} />
            </button>
            <div className="flex items-center gap-2 text-muted">
              <button type="button" aria-label="Comments" className="rounded-lg p-2 hover:bg-background">
                <MessageSquare size={16} />
              </button>
              <button type="button" aria-label="Collapse panel" className="rounded-lg p-2 hover:bg-background">
                <ArrowLeftRight size={16} />
              </button>
            </div>
          </div>

          <div
            className={`min-h-0 flex-1 overflow-auto ${dragOverCanvas ? "bg-primary/5" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
              setDragOverCanvas(true);
            }}
            onDragLeave={() => setDragOverCanvas(false)}
          >
            <div
              className={`mx-auto origin-top px-6 transition-transform duration-150 ${compact ? "py-6" : "py-10"}`}
              style={{ transform: `scale(${zoom / 100})`, width: zoom === 100 ? "100%" : `${10000 / zoom}%` }}
            >
              <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
                <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                  <button
                    type="button"
                    onClick={() => updateLayout({ entryRulesExpanded: !entryRulesExpanded })}
                    className="flex w-full items-center justify-between bg-slate-700 px-4 py-3 text-left text-sm font-medium text-white"
                  >
                    Entry Rules
                    {entryRulesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {entryRulesExpanded ? (
                    <div className="space-y-4 px-4 py-4 text-sm">
                      <EntryRuleRow icon={Clock} title="Schedule" />
                      <EntryRuleRow icon={Users} title="Audience" />
                      <EntryRuleRow icon={DoorOpen} title="Exit Criteria" subtitle="No exit criteria selected." />
                      <EntryRuleRow
                        icon={Gauge}
                        title="Controls"
                        subtitle="Users are not eligible to re-enter this Canvas."
                      />
                    </div>
                  ) : null}
                  <div className="flex justify-center pb-1">
                    <div className="h-0 w-0 border-x-[14px] border-t-[10px] border-x-transparent border-t-slate-700" />
                  </div>
                </div>

                <div className="my-3 h-10 w-px bg-border" />

                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  <Plus size={14} />
                  Add Variant
                </button>

                <div className="my-3 h-10 w-px bg-border" />

                {variants.map((variant) => {
                  const steps = variantSteps[variant.id] ?? [];
                  const isDropTarget = dragOverVariantId === variant.id;

                  return (
                    <div key={variant.id} className="w-full max-w-md">
                      <div className="flex items-stretch overflow-hidden rounded-full border border-border bg-slate-700 text-sm text-white shadow-sm">
                        <div className="flex min-w-[72px] items-center justify-center bg-slate-600 px-4 py-2.5 font-semibold">
                          {variant.weight}%
                        </div>
                        <div className="flex flex-1 items-center px-4 py-2.5 font-medium">{variant.name}</div>
                        <button
                          type="button"
                          className="px-3 py-2 text-white/80 hover:bg-white/10"
                          aria-label={`Settings for ${variant.name}`}
                        >
                          <Settings size={16} />
                        </button>
                      </div>

                      {steps.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {steps.map((step) => (
                            <div
                              key={step.id}
                              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 shadow-sm"
                            >
                              <span
                                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${step.tone}`}
                              >
                                <StepIcon type={step.componentType} />
                              </span>
                              <span className="flex-1 text-sm font-medium text-foreground">{step.label}</span>
                              <button
                                type="button"
                                onClick={() => removeStep(variant.id, step.id)}
                                className="text-muted hover:text-error"
                                aria-label={`Remove ${step.label}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex justify-center py-3">
                        <div className="h-8 w-px bg-border" />
                      </div>

                      <div
                        className="flex justify-center pb-8"
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          event.dataTransfer.dropEffect = "copy";
                          setDragOverVariantId(variant.id);
                        }}
                        onDragLeave={() => setDragOverVariantId(null)}
                        onDrop={(event) => handleDropOnVariant(variant.id, event)}
                      >
                        <button
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border bg-surface transition ${
                            isDropTarget
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted hover:border-primary hover:text-primary"
                          }`}
                          aria-label="Drop component here to add step"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-5 py-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <div ref={zoomMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setZoomMenuOpen((open) => !open)}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              {viewLabel}, {zoom}%
              <ChevronUp size={14} className={zoomMenuOpen ? "rotate-180 transition" : "transition"} />
            </button>
            {zoomMenuOpen ? (
              <div className="absolute bottom-full left-0 z-30 mb-2 min-w-[180px] rounded-lg border border-border bg-surface py-1 shadow-lg">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">View</div>
                {(["detailed", "compact"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      updateLayout({ viewMode: mode });
                      setZoomMenuOpen(false);
                    }}
                    className={`flex w-full px-3 py-2 text-left text-sm hover:bg-background ${
                      viewMode === mode ? "font-medium text-primary" : "text-foreground"
                    }`}
                  >
                    {mode === "detailed" ? "Detailed View" : "Compact View"}
                  </button>
                ))}
                <div className="my-1 border-t border-border" />
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Zoom</div>
                {ZOOM_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      updateLayout({ zoom: level });
                      setZoomMenuOpen(false);
                    }}
                    className={`flex w-full px-3 py-2 text-left text-sm hover:bg-background ${
                      zoom === level ? "font-medium text-primary" : "text-foreground"
                    }`}
                  >
                    {level}%
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <span className="hidden h-4 w-px bg-border sm:inline-block" />
          <Clock size={16} />
          <span className="truncate">{canvasName}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-background"
          >
            <Rocket size={14} />
            Test Canvas
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-lg border border-primary bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onSaveAndContinue}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            Save and continue
          </button>
        </div>
      </div>
    </div>
  );
}

function StepIcon({ type }: { type: string }) {
  const map: Record<string, typeof Send> = {
    message: Send,
    delay: Clock,
    agent: Bot,
    decision_split: Split,
    audience_paths: Users,
    action_paths: Zap,
    experiment_paths: Beaker,
    send_destination: GitBranch,
    context: Braces,
  };
  const Icon = map[type] ?? Send;
  return <Icon size={16} />;
}

function EntryRuleRow({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Clock;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-muted" />
      <div>
        <div className="font-medium text-foreground">{title}</div>
        {subtitle ? <div className="text-xs text-muted">{subtitle}</div> : null}
      </div>
    </div>
  );
}
