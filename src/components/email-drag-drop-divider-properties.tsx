"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  MessageSquare,
  Minus,
  Monitor,
  Plus,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import {
  type BlockOptions,
  type BorderStyle,
  type CanvasBlock,
  type DividerBlockStyle,
  type PaddingOptions,
  type TextAlign,
  getDividerStyle,
} from "@/lib/email-drag-drop-blocks";

type Props = {
  block: CanvasBlock;
  onStyleChange: (style: DividerBlockStyle) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
};

const LINE_STYLES: { value: BorderStyle; label: string }[] = [
  { value: "solid", label: "solid" },
  { value: "dashed", label: "dashed" },
  { value: "dotted", label: "dotted" },
];

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

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 200,
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

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-border"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

function PaddingControl({
  label,
  options,
  onChange,
}: {
  label: string;
  options: PaddingOptions;
  onChange: (options: PaddingOptions) => void;
}) {
  return (
    <PropertyRow label={label}>
      <div className="space-y-3">
        <label className="flex items-center justify-end gap-2 text-sm text-muted">
          <span>More options</span>
          <ToggleSwitch
            checked={options.paddingMoreOptions}
            onChange={(checked) => onChange({ ...options, paddingMoreOptions: checked })}
          />
        </label>
        {options.paddingMoreOptions ? (
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["paddingTop", "Top"],
                ["paddingRight", "Right"],
                ["paddingBottom", "Bottom"],
                ["paddingLeft", "Left"],
              ] as const
            ).map(([key, sideLabel]) => (
              <div key={key}>
                <div className="mb-1 text-xs text-muted">{sideLabel}</div>
                <NumberStepper
                  value={options[key]}
                  onChange={(value) => onChange({ ...options, [key]: value })}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3">
            <span className="text-sm text-muted">All sides</span>
            <NumberStepper
              value={options.paddingAll}
              onChange={(value) =>
                onChange({
                  ...options,
                  paddingAll: value,
                  paddingTop: value,
                  paddingRight: value,
                  paddingBottom: value,
                  paddingLeft: value,
                })
              }
            />
            <div className="flex h-12 w-10 flex-col items-center justify-center rounded border border-border bg-background p-1">
              <div className="h-2 w-6 rounded-sm bg-muted/40" />
              <div className="mt-1 h-1 w-5 rounded-sm bg-muted/30" />
              <div className="mt-0.5 h-1 w-4 rounded-sm bg-muted/20" />
            </div>
          </div>
        )}
      </div>
    </PropertyRow>
  );
}

function AlignButtons({ value, onChange }: { value: TextAlign; onChange: (value: TextAlign) => void }) {
  const options: { value: TextAlign; icon: React.ComponentType<{ size?: number }> }[] = [
    { value: "left", icon: AlignLeft },
    { value: "center", icon: AlignCenter },
    { value: "right", icon: AlignRight },
  ];

  return (
    <div className="flex justify-end gap-1">
      {options.map(({ value: align, icon: Icon }) => (
        <button
          key={align}
          type="button"
          onClick={() => onChange(align)}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
            value === align ? "border-primary bg-primary text-white" : "border-border text-muted hover:bg-background"
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}

function BlockOptionsSection({
  options,
  onChange,
}: {
  options: BlockOptions;
  onChange: (options: BlockOptions) => void;
}) {
  const hideOnActive = options.hideOnDesktop || options.hideOnMobile;

  return (
    <div>
      <SectionHeader title="Block options" />
      <PaddingControl
        label="Padding"
        options={options}
        onChange={(padding) => onChange({ ...options, ...padding })}
      />
      <PropertyRow label="Hide on">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...options, hideOnDesktop: false, hideOnMobile: false })}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase ${
              !hideOnActive ? "border-primary bg-primary text-white" : "border-border text-muted"
            }`}
          >
            Off
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({ ...options, hideOnDesktop: !options.hideOnDesktop, hideOnMobile: options.hideOnMobile })
            }
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
              options.hideOnDesktop ? "border-primary bg-primary text-white" : "border-border text-muted"
            }`}
          >
            <Monitor size={14} />
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({ ...options, hideOnMobile: !options.hideOnMobile, hideOnDesktop: options.hideOnDesktop })
            }
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
              options.hideOnMobile ? "border-primary bg-primary text-white" : "border-border text-muted"
            }`}
          >
            <Smartphone size={14} />
          </button>
        </div>
      </PropertyRow>
    </div>
  );
}

export function EmailDragDropDividerProperties({
  block,
  onStyleChange,
  onDelete,
  onDuplicate,
  onClose,
}: Props) {
  const style = getDividerStyle(block);

  function update(partial: Partial<DividerBlockStyle>) {
    onStyleChange({ ...style, ...partial });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold tracking-wide text-foreground">DIVIDER PROPERTIES</h3>
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
        <PropertyRow label="Transparent">
          <div className="flex justify-end">
            <ToggleSwitch checked={style.transparent} onChange={(checked) => update({ transparent: checked })} />
          </div>
        </PropertyRow>

        <PropertyRow label="Line">
          <div className="flex items-center justify-end gap-2">
            <SelectInput
              value={style.lineStyle}
              onChange={(value) => update({ lineStyle: value as BorderStyle })}
              options={LINE_STYLES}
            />
            <NumberStepper
              value={style.lineWidth}
              onChange={(value) => update({ lineWidth: value })}
              min={1}
              max={10}
            />
            <input
              type="color"
              value={style.lineColor}
              onChange={(event) => update({ lineColor: event.target.value })}
              className="h-8 w-8 cursor-pointer rounded border border-border bg-background"
            />
          </div>
        </PropertyRow>

        <PropertyRow label="Width">
          <NumberStepper value={style.width} onChange={(value) => update({ width: value })} min={1} max={100} />
        </PropertyRow>

        <PropertyRow label="Align">
          <AlignButtons value={style.textAlign} onChange={(value) => update({ textAlign: value })} />
        </PropertyRow>

        <BlockOptionsSection
          options={style.blockOptions}
          onChange={(blockOptions) => update({ blockOptions })}
        />
      </div>
    </div>
  );
}
