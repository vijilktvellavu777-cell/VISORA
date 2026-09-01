"use client";

import { useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  GripVertical,
  MessageSquare,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { SocialIconBadge } from "@/components/social-icon-badge";
import {
  type CanvasBlock,
  type PaddingOptions,
  type SocialBlockStyle,
  type SocialIconItem,
  type SocialPlatform,
  type TextAlign,
  getSocialStyle,
} from "@/lib/email-drag-drop-blocks";
import {
  SOCIAL_ICON_COLLECTIONS,
  SOCIAL_ICON_SPACING_OPTIONS,
  SOCIAL_PLATFORM_META,
  previewPlatforms,
} from "@/lib/social-block-icons";

type Props = {
  block: CanvasBlock;
  onStyleChange: (style: SocialBlockStyle) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
};

const ADDABLE_PLATFORMS: SocialPlatform[] = [
  "facebook",
  "x",
  "instagram",
  "linkedin",
  "youtube",
  "pinterest",
  "tiktok",
  "snapchat",
  "whatsapp",
  "custom",
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

function CollectionPreview({ collection }: { collection: SocialBlockStyle["iconCollection"] }) {
  return (
    <div className="flex items-center gap-1">
      {previewPlatforms().map((platform) => (
        <SocialIconBadge key={platform} platform={platform} collection={collection} size={18} />
      ))}
    </div>
  );
}

function IconCollectionSelect({
  value,
  onChange,
}: {
  value: SocialBlockStyle["iconCollection"];
  onChange: (value: SocialBlockStyle["iconCollection"]) => void;
}) {
  return (
    <div className="border-b border-border px-4 py-3">
      <div className="text-sm text-foreground">Select icon collection</div>
      <div className="mt-2 flex items-center gap-3">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as SocialBlockStyle["iconCollection"])}
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          {SOCIAL_ICON_COLLECTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <CollectionPreview collection={value} />
      </div>
    </div>
  );
}

function IconCard({
  icon,
  collection,
  onChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  icon: SocialIconItem;
  collection: SocialBlockStyle["iconCollection"];
  onChange: (icon: SocialIconItem) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const meta = SOCIAL_PLATFORM_META[icon.platform];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-lg border border-border bg-background p-3"
    >
      <div className="flex items-start gap-2">
        <button type="button" className="mt-1 cursor-grab text-muted" aria-label="Reorder icon">
          <GripVertical size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SocialIconBadge platform={icon.platform} collection={collection} size={24} />
              <span className="text-sm font-medium text-foreground">{meta.label}</span>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <span>More options</span>
              <ToggleSwitch
                checked={icon.moreOptions}
                onChange={(checked) => onChange({ ...icon, moreOptions: checked })}
              />
            </label>
          </div>
          <button type="button" onClick={onDelete} className="mt-1 text-sm font-medium text-red-500 hover:underline">
            Delete
          </button>
          <div className="mt-3">
            <div className="text-sm text-foreground">URL</div>
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <input
                value={icon.url}
                onChange={(event) => onChange({ ...icon, url: event.target.value })}
                className="w-full border-0 bg-background px-3 py-2 text-sm outline-none"
                placeholder="URL"
              />
            </div>
          </div>
          {icon.moreOptions ? (
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-sm text-foreground">Custom label</div>
                <div className="mt-2 overflow-hidden rounded-lg border border-border">
                  <input
                    value={icon.customLabel ?? ""}
                    onChange={(event) => onChange({ ...icon, customLabel: event.target.value })}
                    className="w-full border-0 bg-background px-3 py-2 text-sm outline-none"
                    placeholder="Custom label"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={icon.openInNewTab !== false}
                  onChange={(event) => onChange({ ...icon, openInNewTab: event.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Open in new tab
              </label>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmailDragDropSocialProperties({
  block,
  onStyleChange,
  onDelete,
  onDuplicate,
  onClose,
}: Props) {
  const style = getSocialStyle(block);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const availablePlatforms = useMemo(
    () => ADDABLE_PLATFORMS.filter((platform) => !style.icons.some((icon) => icon.platform === platform)),
    [style.icons],
  );

  function update(partial: Partial<SocialBlockStyle>) {
    onStyleChange({ ...style, ...partial });
  }

  function updateIcon(id: string, nextIcon: SocialIconItem) {
    update({ icons: style.icons.map((icon) => (icon.id === id ? nextIcon : icon)) });
  }

  function removeIcon(id: string) {
    update({ icons: style.icons.filter((icon) => icon.id !== id) });
  }

  function addIcon(platform: SocialPlatform) {
    const meta = SOCIAL_PLATFORM_META[platform];
    update({
      icons: [
        ...style.icons,
        {
          id: crypto.randomUUID(),
          platform,
          url: meta.defaultUrl,
          moreOptions: false,
          openInNewTab: true,
        },
      ],
    });
    setShowAddMenu(false);
  }

  function reorderIcons(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const icons = [...style.icons];
    const sourceIndex = icons.findIndex((icon) => icon.id === sourceId);
    const targetIndex = icons.findIndex((icon) => icon.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const [moved] = icons.splice(sourceIndex, 1);
    icons.splice(targetIndex, 0, moved);
    update({ icons });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold tracking-wide text-foreground">SOCIAL PROPERTIES</h3>
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
        <IconCollectionSelect value={style.iconCollection} onChange={(iconCollection) => update({ iconCollection })} />

        <div className="border-b border-border px-4 py-3">
          <div className="text-sm text-foreground">Configure icon collection</div>
          <div className="mt-3 space-y-3">
            {style.icons.map((icon) => (
              <IconCard
                key={icon.id}
                icon={icon}
                collection={style.iconCollection}
                onChange={(nextIcon) => updateIcon(icon.id, nextIcon)}
                onDelete={() => removeIcon(icon.id)}
                onDragStart={() => setDraggingId(icon.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggingId) reorderIcons(draggingId, icon.id);
                  setDraggingId(null);
                }}
              />
            ))}
          </div>
          <div className="relative mt-3">
            <button
              type="button"
              onClick={() => setShowAddMenu((open) => !open)}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              + Add new icon
            </button>
            {showAddMenu && availablePlatforms.length > 0 ? (
              <div className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
                {availablePlatforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => addIcon(platform)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-background"
                  >
                    <SocialIconBadge platform={platform} collection={style.iconCollection} size={20} />
                    {SOCIAL_PLATFORM_META[platform].label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <PropertyRow label="Align">
          <AlignButtons value={style.textAlign} onChange={(textAlign) => update({ textAlign })} />
        </PropertyRow>

        <PropertyRow label="Icon spacing">
          <div className="flex justify-end">
            <select
              value={style.iconSpacing}
              onChange={(event) => update({ iconSpacing: Number(event.target.value) })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {SOCIAL_ICON_SPACING_OPTIONS.map((spacing) => (
                <option key={spacing} value={spacing}>
                  {spacing}
                </option>
              ))}
            </select>
          </div>
        </PropertyRow>

        <div>
          <SectionHeader title="Block options" />
          <PaddingControl
            label="Padding"
            options={style.blockOptions}
            onChange={(blockOptions) => update({ blockOptions: { ...style.blockOptions, ...blockOptions } })}
          />
        </div>
      </div>
    </div>
  );
}
