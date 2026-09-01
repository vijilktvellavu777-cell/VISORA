"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ChevronUp,
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
  type ButtonBlockStyle,
  type ButtonLinkType,
  type CanvasBlock,
  type FontWeight,
  type PaddingOptions,
  type TextAlign,
  type TextDirection,
  getButtonStyle,
} from "@/lib/email-drag-drop-blocks";

type Props = {
  block: CanvasBlock;
  onStyleChange: (style: ButtonBlockStyle) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
};

const FONT_FAMILIES = ["Global font", "Arial", "Georgia", "Helvetica", "Times New Roman"];
const FONT_WEIGHTS: { value: FontWeight; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "regular", label: "Regular" },
  { value: "bold", label: "Bold" },
];
const LINK_TYPES: { value: ButtonLinkType; label: string }[] = [
  { value: "web_page", label: "Open web page" },
  { value: "email", label: "Open email" },
  { value: "phone", label: "Call phone number" },
  { value: "file", label: "Open file" },
];
const BORDER_STYLES: { value: BorderStyle; label: string }[] = [
  { value: "solid", label: "solid" },
  { value: "dashed", label: "dashed" },
  { value: "dotted", label: "dotted" },
  { value: "none", label: "none" },
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

function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-8 cursor-pointer rounded border border-border bg-background"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none"
      />
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
          </div>
        )}
      </div>
    </PropertyRow>
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

function ButtonAlignButtons({ value, onChange }: { value: TextAlign; onChange: (value: TextAlign) => void }) {
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

function DirectionButtons({
  value,
  onChange,
}: {
  value: TextDirection;
  onChange: (value: TextDirection) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      {(["ltr", "rtl"] as const).map((direction) => (
        <button
          key={direction}
          type="button"
          onClick={() => onChange(direction)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase ${
            value === direction
              ? "border-primary bg-primary text-white"
              : "border-border text-muted hover:bg-background"
          }`}
        >
          {direction}
        </button>
      ))}
    </div>
  );
}

export function EmailDragDropButtonProperties({
  block,
  onStyleChange,
  onDelete,
  onDuplicate,
  onClose,
}: Props) {
  const style = getButtonStyle(block);
  const [hoverOpen, setHoverOpen] = useState(true);

  function update(partial: Partial<ButtonBlockStyle>) {
    onStyleChange({ ...style, ...partial });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold tracking-wide text-foreground">BUTTON PROPERTIES</h3>
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
        <SectionHeader title="Action" />
        <PropertyRow label="Link type">
          <SelectInput
            value={style.linkType}
            onChange={(value) => update({ linkType: value as ButtonLinkType })}
            options={LINK_TYPES}
          />
        </PropertyRow>
        <div className="border-b border-border px-4 py-3">
          <div className="text-sm text-foreground">URL</div>
          <div className="mt-2 flex overflow-hidden rounded-lg border border-border">
            <span className="flex items-center bg-background px-3 text-sm text-muted">URL</span>
            <input
              value={style.url}
              onChange={(event) => update({ url: event.target.value })}
              className="min-w-0 flex-1 border-0 bg-background px-3 py-2 text-sm outline-none"
              placeholder="https://"
            />
          </div>
          <button type="button" className="mt-2 text-sm font-medium text-primary hover:underline">
            Link file
          </button>
        </div>

        <SectionHeader title="Button options" />
        <PropertyRow label="Auto width">
          <div className="flex justify-end">
            <ToggleSwitch checked={style.autoWidth} onChange={(checked) => update({ autoWidth: checked })} />
          </div>
        </PropertyRow>
        <PropertyRow label="Font family">
          <SelectInput
            value={style.fontFamily}
            onChange={(value) => update({ fontFamily: value })}
            options={FONT_FAMILIES.map((font) => ({ value: font, label: font }))}
          />
        </PropertyRow>
        <PropertyRow label="Font weight">
          <SelectInput
            value={style.fontWeight}
            onChange={(value) => update({ fontWeight: value as FontWeight })}
            options={FONT_WEIGHTS}
          />
        </PropertyRow>
        <PropertyRow label="Font size">
          <NumberStepper value={style.fontSize} onChange={(value) => update({ fontSize: value })} min={8} max={72} />
        </PropertyRow>
        <PropertyRow label="Background color">
          <ColorInput value={style.backgroundColor} onChange={(value) => update({ backgroundColor: value })} />
        </PropertyRow>
        <PropertyRow label="Text color">
          <ColorInput value={style.textColor} onChange={(value) => update({ textColor: value })} />
        </PropertyRow>
        <PropertyRow label="Align">
          <ButtonAlignButtons value={style.textAlign} onChange={(value) => update({ textAlign: value })} />
        </PropertyRow>
        <PropertyRow label="Line height">
          <NumberStepper
            value={style.lineHeight}
            onChange={(value) => update({ lineHeight: value })}
            min={0.5}
            max={4}
            step={0.1}
          />
        </PropertyRow>
        <PropertyRow label="Letter spacing">
          <NumberStepper value={style.letterSpacing} onChange={(value) => update({ letterSpacing: value })} max={20} />
        </PropertyRow>
        <PropertyRow label="Text direction">
          <DirectionButtons value={style.textDirection} onChange={(value) => update({ textDirection: value })} />
        </PropertyRow>
        <PropertyRow label="Border radius">
          <NumberStepper value={style.borderRadius} onChange={(value) => update({ borderRadius: value })} max={50} />
        </PropertyRow>

        <PaddingControl
          label="Content padding"
          options={style.contentPadding}
          onChange={(contentPadding) => update({ contentPadding })}
        />

        <PropertyRow label="Border">
          <div className="space-y-3">
            <label className="flex items-center justify-end gap-2 text-sm text-muted">
              <span>More options</span>
              <ToggleSwitch
                checked={style.border.moreOptions}
                onChange={(checked) => update({ border: { ...style.border, moreOptions: checked } })}
              />
            </label>
            <div className="flex items-center justify-end gap-2">
              <SelectInput
                value={style.border.style}
                onChange={(value) => update({ border: { ...style.border, style: value as BorderStyle } })}
                options={BORDER_STYLES}
              />
              <NumberStepper
                value={style.border.width}
                onChange={(value) => update({ border: { ...style.border, width: value } })}
                max={10}
              />
              <input
                type="color"
                value={style.border.color}
                onChange={(event) => update({ border: { ...style.border, color: event.target.value } })}
                className="h-8 w-8 cursor-pointer rounded border border-border bg-background"
              />
            </div>
          </div>
        </PropertyRow>

        <div className="border-b border-border">
          <button
            type="button"
            onClick={() => setHoverOpen((value) => !value)}
            className="flex w-full items-center justify-between bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Button hover
            {hoverOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {hoverOpen ? (
            <PropertyRow label="Button hover">
              <div className="flex justify-end">
                <ToggleSwitch
                  checked={style.hoverEnabled}
                  onChange={(checked) => update({ hoverEnabled: checked })}
                />
              </div>
            </PropertyRow>
          ) : null}
        </div>

        <BlockOptionsSection
          options={style.blockOptions}
          onChange={(blockOptions) => update({ blockOptions })}
        />
      </div>
    </div>
  );
}
