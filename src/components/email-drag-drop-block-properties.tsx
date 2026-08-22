"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Copy,
  List,
  ListOrdered,
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
  type CanvasBlock,
  type FontWeight,
  type LineHeightMode,
  type ListStyleType,
  type ListType,
  type TextAlign,
  type TextBlockStyle,
  type TextDirection,
  type TitleLevel,
  blockPropertiesTitle,
  getBlockStyle,
} from "@/lib/email-drag-drop-blocks";

type Props = {
  block: CanvasBlock;
  onStyleChange: (style: TextBlockStyle) => void;
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
const TITLE_LEVELS: TitleLevel[] = ["h1", "h2", "h3", "h4", "h5", "h6"];
const LIST_STYLE_TYPES: { value: ListStyleType; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "disc", label: "Disc" },
  { value: "circle", label: "Circle" },
  { value: "square", label: "Square" },
  { value: "decimal", label: "Decimal" },
];

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <span className="shrink-0 text-sm text-foreground">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
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

function AlignButtons({ value, onChange }: { value: TextAlign; onChange: (value: TextAlign) => void }) {
  const options: { value: TextAlign; icon: React.ComponentType<{ size?: number }> }[] = [
    { value: "left", icon: AlignLeft },
    { value: "center", icon: AlignCenter },
    { value: "right", icon: AlignRight },
    { value: "justify", icon: AlignJustify },
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
      <div className="bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Block options
      </div>

      <PropertyRow label="Padding">
        <div className="space-y-3">
          <label className="flex items-center justify-end gap-2 text-sm text-muted">
            <span>More options</span>
            <button
              type="button"
              onClick={() => onChange({ ...options, paddingMoreOptions: !options.paddingMoreOptions })}
              className={`relative h-6 w-11 rounded-full transition ${
                options.paddingMoreOptions ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  options.paddingMoreOptions ? "left-5" : "left-0.5"
                }`}
              />
            </button>
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
              ).map(([key, label]) => (
                <div key={key}>
                  <div className="mb-1 text-xs text-muted">{label}</div>
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
              onChange({
                ...options,
                hideOnDesktop: !options.hideOnDesktop,
                hideOnMobile: options.hideOnMobile,
              })
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
              onChange({
                ...options,
                hideOnMobile: !options.hideOnMobile,
                hideOnDesktop: options.hideOnDesktop,
              })
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

export function EmailDragDropBlockProperties({
  block,
  onStyleChange,
  onDelete,
  onDuplicate,
  onClose,
}: Props) {
  const style = getBlockStyle(block);

  function update(partial: Partial<TextBlockStyle>) {
    onStyleChange({ ...style, ...partial });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold tracking-wide text-foreground">{blockPropertiesTitle(block.type)}</h3>
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
        {block.type === "title" ? (
          <PropertyRow label="Title">
            <SelectInput
              value={style.titleLevel ?? "h1"}
              onChange={(value) => update({ titleLevel: value as TitleLevel })}
              options={TITLE_LEVELS.map((level) => ({ value: level, label: level.toUpperCase() }))}
            />
          </PropertyRow>
        ) : null}

        {block.type === "list" ? (
          <>
            <PropertyRow label="List type">
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => update({ listType: "ordered" as ListType })}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                    style.listType === "ordered"
                      ? "border-primary bg-primary text-white"
                      : "border-border text-muted hover:bg-background"
                  }`}
                >
                  <ListOrdered size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => update({ listType: "unordered" as ListType })}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                    style.listType !== "ordered"
                      ? "border-primary bg-primary text-white"
                      : "border-border text-muted hover:bg-background"
                  }`}
                >
                  <List size={14} />
                </button>
              </div>
            </PropertyRow>
            <PropertyRow label="List style type">
              <SelectInput
                value={style.listStyleType ?? "default"}
                onChange={(value) => update({ listStyleType: value as ListStyleType })}
                options={LIST_STYLE_TYPES}
              />
            </PropertyRow>
          </>
        ) : null}

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

        <PropertyRow label="Text color">
          <ColorInput value={style.textColor} onChange={(value) => update({ textColor: value })} />
        </PropertyRow>

        <PropertyRow label="Link color">
          <ColorInput value={style.linkColor} onChange={(value) => update({ linkColor: value })} />
        </PropertyRow>

        <PropertyRow label="Align">
          <AlignButtons value={style.textAlign} onChange={(value) => update({ textAlign: value })} />
        </PropertyRow>

        {block.type === "paragraph" ? (
          <PropertyRow label="Paragraph spacing">
            <NumberStepper
              value={style.paragraphSpacing ?? 0}
              onChange={(value) => update({ paragraphSpacing: value })}
              max={100}
            />
          </PropertyRow>
        ) : null}

        {block.type === "list" ? (
          <>
            <PropertyRow label="List items spacing">
              <NumberStepper
                value={style.listItemsSpacing ?? 0}
                onChange={(value) => update({ listItemsSpacing: value })}
                max={100}
              />
            </PropertyRow>
            <PropertyRow label="Nested items indent">
              <NumberStepper
                value={style.nestedItemsIndent ?? 40}
                onChange={(value) => update({ nestedItemsIndent: value })}
                max={120}
              />
            </PropertyRow>
          </>
        ) : null}

        <PropertyRow label="Line height">
          <div className="space-y-2">
            <SelectInput
              value={style.lineHeightMode}
              onChange={(value) => update({ lineHeightMode: value as LineHeightMode })}
              options={[
                { value: "custom", label: "Custom" },
                { value: "auto", label: "Auto" },
              ]}
            />
            {style.lineHeightMode === "custom" ? (
              <NumberStepper
                value={style.lineHeight}
                onChange={(value) => update({ lineHeight: value })}
                min={0.5}
                max={3}
                step={0.1}
              />
            ) : null}
          </div>
        </PropertyRow>

        <PropertyRow label="Letter spacing">
          <NumberStepper value={style.letterSpacing} onChange={(value) => update({ letterSpacing: value })} max={20} />
        </PropertyRow>

        <PropertyRow label="Text direction">
          <DirectionButtons value={style.textDirection} onChange={(value) => update({ textDirection: value })} />
        </PropertyRow>

        <BlockOptionsSection
          options={style.blockOptions}
          onChange={(blockOptions) => update({ blockOptions })}
        />
      </div>
    </div>
  );
}
