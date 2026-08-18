"use client";

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
  MessageSquare,
  Plus,
  Rocket,
  Send,
  Settings,
  Sparkles,
  Split,
  Users,
  Zap,
} from "lucide-react";
import type { CanvasBuildLayout, CanvasBuildVariant } from "@/lib/canvas-wizard-types";

type Props = {
  layout: CanvasBuildLayout;
  onChange: (layout: CanvasBuildLayout) => void;
  canvasName: string;
  saving?: boolean;
  onSave: () => void;
  onSaveAndContinue: () => void;
};

const COMPONENT_GROUPS = [
  {
    title: "Message Controls",
    items: [
      { label: "Message", icon: Send, tone: "bg-emerald-500" },
      { label: "Delay", icon: Clock, tone: "bg-violet-500" },
    ],
  },
  {
    title: "AI Actions",
    items: [{ label: "Agent Step", icon: Bot, tone: "bg-slate-600" }],
  },
  {
    title: "Flow Controls",
    items: [
      { label: "Decision Split", icon: Split, tone: "bg-orange-400" },
      { label: "Audience Paths", icon: Users, tone: "bg-red-500" },
      { label: "Action Paths", icon: Zap, tone: "bg-sky-400" },
      { label: "Experiment Paths", icon: Beaker, tone: "bg-pink-500" },
      { label: "Send to Destination", icon: GitBranch, tone: "bg-violet-500" },
    ],
  },
  {
    title: "Audience Updates",
    items: [{ label: "Context", icon: Braces, tone: "bg-amber-400" }],
  },
];

export function CanvasBuildStep({
  layout,
  onChange,
  canvasName,
  saving = false,
  onSave,
  onSaveAndContinue,
}: Props) {
  const variants = layout.variants ?? [{ id: "variant-1", name: "Variant 1", weight: 100 }];
  const entryRulesExpanded = layout.entryRulesExpanded ?? true;
  const sidebarCollapsed = layout.sidebarCollapsed ?? false;

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
                    Select components to build your user journey.
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
                        <button
                          key={item.label}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2.5 text-left hover:border-border hover:bg-background"
                        >
                          <span
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${item.tone}`}
                          >
                            <Icon size={16} />
                          </span>
                          <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">{item.label}</span>
                        </button>
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

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-10">
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

            {variants.map((variant) => (
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
                <div className="flex justify-center py-3">
                  <div className="h-8 w-px bg-border" />
                </div>
                <div className="flex justify-center pb-8">
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-muted hover:border-primary hover:text-primary"
                    aria-label="Add step"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-5 py-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <button type="button" className="inline-flex items-center gap-1 hover:text-foreground">
            Detailed View, 100%
            <ChevronUp size={14} />
          </button>
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
