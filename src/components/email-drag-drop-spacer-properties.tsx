"use client";

import { Copy, MessageSquare, Minus, Monitor, Plus, Smartphone, Trash2, X } from "lucide-react";
import { type CanvasBlock, type SpacerBlockStyle, getSpacerStyle } from "@/lib/email-drag-drop-blocks";

type Props = {
  block: CanvasBlock;
  onStyleChange: (style: SpacerBlockStyle) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
};

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <span className="shrink-0 text-sm text-foreground">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</div>
  );
}

function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 500,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  function update(next: number) {
    onChange(Math.min(max, Math.max(min, next)));
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => update(value - step)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-background"
      >
        <Minus size={14} />
      </button>
      <input
        type="number"
        value={value}
        onChange={(event) => update(Number(event.target.value) || 0)}
        className="w-14 rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => update(value + step)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-background"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function HideOnControl({
  hideOnDesktop,
  hideOnMobile,
  onChange,
}: {
  hideOnDesktop: boolean;
  hideOnMobile: boolean;
  onChange: (hideOnDesktop: boolean, hideOnMobile: boolean) => void;
}) {
  const hideOnActive = hideOnDesktop || hideOnMobile;

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onChange(false, false)}
        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase ${
          !hideOnActive ? "border-primary bg-primary text-white" : "border-border text-muted"
        }`}
      >
        Off
      </button>
      <button
        type="button"
        onClick={() => onChange(!hideOnDesktop, hideOnMobile)}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
          hideOnDesktop ? "border-primary bg-primary text-white" : "border-border text-muted"
        }`}
      >
        <Monitor size={14} />
      </button>
      <button
        type="button"
        onClick={() => onChange(hideOnDesktop, !hideOnMobile)}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
          hideOnMobile ? "border-primary bg-primary text-white" : "border-border text-muted"
        }`}
      >
        <Smartphone size={14} />
      </button>
    </div>
  );
}

export function EmailDragDropSpacerProperties({
  block,
  onStyleChange,
  onDelete,
  onDuplicate,
  onClose,
}: Props) {
  const style = getSpacerStyle(block);

  function update(partial: Partial<SpacerBlockStyle>) {
    onStyleChange({ ...style, ...partial });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold tracking-wide text-foreground">SPACER PROPERTIES</h3>
        <div className="flex items-center gap-1">
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-background">
            <MessageSquare size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-background"
          >
            <Trash2 size={15} />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-background"
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-background"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <PropertyRow label="Height">
          <NumberStepper value={style.height} onChange={(height) => update({ height })} min={1} max={500} />
        </PropertyRow>

        <div>
          <SectionHeader title="Block options" />
          <PropertyRow label="Hide on">
            <HideOnControl
              hideOnDesktop={style.hideOnDesktop}
              hideOnMobile={style.hideOnMobile}
              onChange={(hideOnDesktop, hideOnMobile) => update({ hideOnDesktop, hideOnMobile })}
            />
          </PropertyRow>
        </div>
      </div>
    </div>
  );
}
