"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlignJustify,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Code,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Mail,
  Menu,
  MessageSquare,
  Minus,
  Monitor,
  Move,
  MoveVertical,
  Pencil,
  Play,
  Plus,
  Settings,
  Sparkles,
  Square,
  Star,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { EmailDragDropBlockProperties } from "@/components/email-drag-drop-block-properties";
import { EmailDragDropButtonProperties } from "@/components/email-drag-drop-button-properties";
import { EmailDragDropDividerProperties } from "@/components/email-drag-drop-divider-properties";
import {
  type BlockType,
  type ButtonBlockStyle,
  type CanvasBlock,
  type DividerBlockStyle,
  type TextBlockStyle,
  blocksToHtml,
  defaultButtonStyle,
  defaultContent,
  defaultDividerStyle,
  defaultStyleForType,
  getBlockStyle,
  getBlockWrapperOptions,
  getButtonStyle,
  getDividerStyle,
  isPropertiesBlock,
  isTextBlock,
} from "@/lib/email-drag-drop-blocks";

export type { BlockType, CanvasBlock } from "@/lib/email-drag-drop-blocks";
export { blocksToHtml } from "@/lib/email-drag-drop-blocks";

type Props = {
  campaignName: string;
  initialBody?: string;
  onDone: (html: string) => void;
  onClose: () => void;
};

type SidebarTab = "content" | "rows" | "settings";
type LeftMode = "mail" | "edit" | "preview";
type DeviceView = "desktop" | "mobile";

const BLOCK_META: Record<
  BlockType,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }
> = {
  title: { label: "TITLE", icon: AlignLeft },
  paragraph: { label: "PARAGRAPH", icon: AlignJustify },
  list: { label: "LIST", icon: List },
  button: { label: "BUTTON", icon: Square },
  divider: { label: "DIVIDER", icon: Minus },
  spacer: { label: "SPACER", icon: MoveVertical },
  image: { label: "IMAGE", icon: ImageIcon },
  video: { label: "VIDEO", icon: Play },
  social: { label: "SOCIAL", icon: Plus },
  icons: { label: "ICONS", icon: Star },
  html: { label: "HTML", icon: Code },
  menu: { label: "MENU", icon: Menu },
};

const BASIC_BLOCKS: BlockType[] = ["title", "paragraph", "list", "button", "divider", "spacer"];
const MEDIA_BLOCKS: BlockType[] = ["image", "video", "social", "icons"];
const ADVANCED_BLOCKS: BlockType[] = ["html", "menu"];

const ROW_LAYOUTS = [
  { id: "1-col", label: "1 column", cols: 1 },
  { id: "2-col", label: "2 columns", cols: 2 },
  { id: "3-col", label: "3 columns", cols: 3 },
];

function previewTypographyStyle(block: CanvasBlock): React.CSSProperties {
  const style = getBlockStyle(block);
  return {
    fontFamily: style.fontFamily === "Global font" ? "Segoe UI, Helvetica, Arial, sans-serif" : style.fontFamily,
    fontWeight: style.fontWeight === "bold" ? 700 : style.fontWeight === "light" ? 300 : 400,
    fontSize: style.fontSize,
    color: style.textColor,
    textAlign: style.textAlign,
    lineHeight: style.lineHeightMode === "auto" ? "normal" : style.lineHeight,
    letterSpacing: style.letterSpacing,
    direction: style.textDirection,
  };
}

function previewPaddingStyle(block: CanvasBlock): React.CSSProperties {
  const options = getBlockWrapperOptions(block);
  if (options.paddingMoreOptions) {
    return {
      paddingTop: options.paddingTop,
      paddingRight: options.paddingRight,
      paddingBottom: options.paddingBottom,
      paddingLeft: options.paddingLeft,
    };
  }
  return { padding: options.paddingAll };
}

function isEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function stopEditorEventPropagation(event: React.SyntheticEvent) {
  event.stopPropagation();
}

function isBlockHiddenOnDevice(block: CanvasBlock, deviceView: DeviceView) {
  const options = getBlockWrapperOptions(block);
  if (deviceView === "desktop" && options.hideOnDesktop) return true;
  if (deviceView === "mobile" && options.hideOnMobile) return true;
  return false;
}

function BlockPreview({
  block,
  onChange,
}: {
  block: CanvasBlock;
  onChange: (content: string) => void;
}) {
  const typography = previewTypographyStyle(block);
  const padding = previewPaddingStyle(block);
  const style = getBlockStyle(block);

  switch (block.type) {
    case "title":
      return (
        <div style={padding}>
          <input
            value={block.content}
            onChange={(event) => onChange(event.target.value)}
            onClick={stopEditorEventPropagation}
            onKeyDown={stopEditorEventPropagation}
            style={{ ...typography, margin: 0, width: "100%", border: 0, background: "transparent", outline: "none" }}
            placeholder="Your headline here"
          />
        </div>
      );
    case "paragraph":
      return (
        <div style={padding}>
          <textarea
            value={block.content}
            onChange={(event) => onChange(event.target.value)}
            onClick={stopEditorEventPropagation}
            onKeyDown={stopEditorEventPropagation}
            style={{
              ...typography,
              margin: 0,
              marginBottom: style.paragraphSpacing ?? 0,
              width: "100%",
              resize: "none",
              border: 0,
              background: "transparent",
              outline: "none",
            }}
            rows={3}
            placeholder="Write your message here"
          />
        </div>
      );
    case "list": {
      const items = block.content.split("\n").filter(Boolean);
      const ListTag = style.listType === "ordered" ? "ol" : "ul";
      return (
        <div style={padding}>
          <ListTag
            style={{
              ...typography,
              margin: 0,
              paddingLeft: style.nestedItemsIndent ?? 40,
              listStyleType: style.listStyleType === "default" ? undefined : style.listStyleType,
            }}
          >
            {items.map((item, index) => (
              <li key={index} style={{ marginBottom: style.listItemsSpacing ?? 0 }}>
                {item}
              </li>
            ))}
          </ListTag>
          <textarea
            value={block.content}
            onChange={(event) => onChange(event.target.value)}
            onClick={stopEditorEventPropagation}
            onKeyDown={stopEditorEventPropagation}
            className="mt-2 w-full resize-none rounded border border-dashed border-border bg-background/60 p-2 text-xs text-muted outline-none"
            rows={3}
            placeholder="One item per line"
          />
        </div>
      );
    }
    case "button": {
      const buttonStyle = getButtonStyle(block);
      const padding = previewPaddingStyle(block);
      return (
        <div style={{ ...padding, textAlign: buttonStyle.textAlign }}>
          <input
            value={block.content}
            onChange={(event) => onChange(event.target.value)}
            onClick={stopEditorEventPropagation}
            onKeyDown={stopEditorEventPropagation}
            style={{
              fontFamily:
                buttonStyle.fontFamily === "Global font"
                  ? "Segoe UI, Helvetica, Arial, sans-serif"
                  : buttonStyle.fontFamily,
              fontWeight: buttonStyle.fontWeight === "bold" ? 700 : buttonStyle.fontWeight === "light" ? 300 : 400,
              fontSize: buttonStyle.fontSize,
              color: buttonStyle.textColor,
              backgroundColor: buttonStyle.backgroundColor,
              lineHeight: buttonStyle.lineHeight,
              letterSpacing: buttonStyle.letterSpacing,
              direction: buttonStyle.textDirection,
              borderRadius: buttonStyle.borderRadius,
              border:
                buttonStyle.border.style === "none"
                  ? "none"
                  : `${buttonStyle.border.width}px ${buttonStyle.border.style} ${buttonStyle.border.color}`,
              padding: buttonStyle.contentPadding.paddingMoreOptions
                ? `${buttonStyle.contentPadding.paddingTop}px ${buttonStyle.contentPadding.paddingRight}px ${buttonStyle.contentPadding.paddingBottom}px ${buttonStyle.contentPadding.paddingLeft}px`
                : `${buttonStyle.contentPadding.paddingAll}px`,
              width: buttonStyle.autoWidth ? "auto" : "100%",
              display: buttonStyle.autoWidth ? "inline-block" : "block",
              textAlign: "center",
              outline: "none",
            }}
            className="min-w-[120px]"
          />
        </div>
      );
    }
    case "divider": {
      const dividerStyle = getDividerStyle(block);
      const padding = previewPaddingStyle(block);
      const lineColor = dividerStyle.transparent ? "transparent" : dividerStyle.lineColor;
      const margin =
        dividerStyle.textAlign === "left"
          ? "0 auto 0 0"
          : dividerStyle.textAlign === "right"
            ? "0 0 0 auto"
            : "0 auto";

      return (
        <div style={{ ...padding, textAlign: dividerStyle.textAlign }}>
          <hr
            style={{
              border: "none",
              borderTop: `${dividerStyle.lineWidth}px ${dividerStyle.lineStyle} ${lineColor}`,
              width: `${dividerStyle.width}%`,
              margin,
            }}
          />
        </div>
      );
    }
    case "spacer":
      return <div className="flex h-8 items-center justify-center text-xs text-muted">Spacer</div>;
    case "image":
      return (
        <div className="flex aspect-[5/2] items-center justify-center rounded-lg bg-background text-muted">
          <ImageIcon size={32} />
        </div>
      );
    case "video":
      return (
        <div className="flex aspect-video items-center justify-center rounded-lg bg-background text-muted">
          <Play size={32} />
        </div>
      );
    case "social":
      return (
        <div className="flex justify-center gap-3 py-2">
          {[1, 2, 3].map((n) => (
            <span key={n} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted">
              <Plus size={16} />
            </span>
          ))}
        </div>
      );
    case "icons":
      return (
        <div className="flex justify-center gap-4 py-2 text-primary">
          <Star size={20} />
          <Star size={20} />
          <Star size={20} />
        </div>
      );
    case "html":
      return (
        <textarea
          value={block.content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-lg border border-border bg-background p-3 font-mono text-xs outline-none"
          rows={4}
        />
      );
    case "menu":
      return (
        <input
          value={block.content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 bg-transparent text-center text-sm text-muted outline-none"
        />
      );
    default:
      return null;
  }
}

function BlockCanvasActions({
  onDelete,
  onCopy,
}: {
  onDelete: () => void;
  onCopy: () => void;
}) {
  function handleAction(event: React.MouseEvent, action: () => void) {
    event.stopPropagation();
    action();
  }

  return (
    <>
      <div className="pointer-events-none absolute -right-2 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md">
        <Move size={12} />
      </div>
      <div className="absolute right-0 top-full z-10 mt-1 flex overflow-hidden rounded-md shadow-lg">
        <button
          type="button"
          onClick={(event) => handleAction(event, () => undefined)}
          className="flex h-8 w-8 items-center justify-center bg-primary text-white hover:bg-primary-dark"
          aria-label="Comment"
        >
          <MessageSquare size={14} />
        </button>
        <button
          type="button"
          onClick={(event) => handleAction(event, onDelete)}
          className="flex h-8 w-8 items-center justify-center bg-primary text-white hover:bg-primary-dark"
          aria-label="Delete block"
        >
          <Trash2 size={14} />
        </button>
        <button
          type="button"
          onClick={(event) => handleAction(event, onCopy)}
          className="flex h-8 w-8 items-center justify-center bg-primary text-white hover:bg-primary-dark"
          aria-label="Copy block"
        >
          <Copy size={14} />
        </button>
      </div>
    </>
  );
}

function BlockLibraryItem({ type, onAdd }: { type: BlockType; onAdd: (type: BlockType) => void }) {
  const meta = BLOCK_META[type];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      draggable
      onClick={() => onAdd(type)}
      onDragStart={(e) => {
        e.dataTransfer.setData("application/visora-block", type);
        e.dataTransfer.effectAllowed = "copy";
      }}
      className="flex cursor-grab flex-col items-center gap-2 rounded-lg border border-border bg-surface p-3 shadow-sm transition hover:border-primary/40 hover:shadow active:cursor-grabbing"
    >
      <Icon size={22} className="text-primary" strokeWidth={1.5} />
      <span className="text-[10px] font-semibold tracking-wide text-muted">{meta.label}</span>
    </button>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold tracking-wide text-muted"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

export function EmailDragDropEditor({ campaignName, initialBody, onDone, onClose }: Props) {
  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("content");
  const [leftMode, setLeftMode] = useState<LeftMode>("edit");
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const [dragOver, setDragOver] = useState(false);
  const [contentNav, setContentNav] = useState<"design" | "links">("design");

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );

  const addBlock = useCallback((type: BlockType) => {
    const id = crypto.randomUUID();
    const blockStyle = defaultStyleForType(type);
    setBlocks((prev) => [
      ...prev,
      {
        id,
        type,
        content: defaultContent(type),
        ...(blockStyle ? { style: blockStyle } : {}),
        ...(type === "button" ? { buttonStyle: defaultButtonStyle() } : {}),
        ...(type === "divider" ? { dividerStyle: defaultDividerStyle() } : {}),
      },
    ]);
    if (isPropertiesBlock(type)) {
      setSelectedBlockId(id);
      setSidebarTab("content");
    }
  }, []);

  const updateBlock = useCallback((id: string, content: string) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, content } : block)));
  }, []);

  const updateBlockStyle = useCallback((id: string, style: TextBlockStyle) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, style } : block)));
  }, []);

  const updateButtonStyle = useCallback((id: string, buttonStyle: ButtonBlockStyle) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, buttonStyle } : block)));
  }, []);

  const updateDividerStyle = useCallback((id: string, dividerStyle: DividerBlockStyle) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, dividerStyle } : block)));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    setSelectedBlockId((current) => (current === id ? null : current));
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === id);
      if (index === -1) return prev;
      const source = prev[index];
      const copy: CanvasBlock = {
        ...source,
        id: crypto.randomUUID(),
        style: source.style ? { ...source.style, blockOptions: { ...source.style.blockOptions } } : source.style,
        buttonStyle: source.buttonStyle
          ? {
              ...source.buttonStyle,
              contentPadding: { ...source.buttonStyle.contentPadding },
              border: { ...source.buttonStyle.border },
              blockOptions: { ...source.buttonStyle.blockOptions },
            }
          : source.buttonStyle,
        dividerStyle: source.dividerStyle
          ? { ...source.dividerStyle, blockOptions: { ...source.dividerStyle.blockOptions } }
          : source.dividerStyle,
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      setSelectedBlockId(copy.id);
      return next;
    });
    setSidebarTab("content");
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const type = e.dataTransfer.getData("application/visora-block") as BlockType;
    if (type && BLOCK_META[type]) addBlock(type);
  }

  function handleDownload() {
    const html = blocksToHtml(blocks);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${campaignName.replace(/[^a-z0-9-_ ]/gi, "").trim() || "campaign"}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleDone() {
    onDone(blocks.length > 0 ? blocksToHtml(blocks) : initialBody ?? "");
    onClose();
  }

  const previewMode = leftMode === "preview";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1d24] text-foreground">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
        <h1 className="truncate text-sm font-medium text-white">{campaignName}</h1>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-white shadow-lg"
          aria-label="AI assistant"
        >
          <Sparkles size={16} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left icon rail */}
        <aside className="flex w-14 shrink-0 flex-col items-center border-r border-white/10 bg-[#12151c] py-4">
          {(
            [
              { id: "mail" as const, icon: Mail },
              { id: "edit" as const, icon: Pencil },
              { id: "preview" as const, icon: Eye },
            ] as const
          ).map(({ id, icon: Icon }) => {
            const active = leftMode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setLeftMode(id)}
                className={`relative mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition ${
                  active ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                {active ? <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-white" /> : null}
                <Icon size={18} />
              </button>
            );
          })}
        </aside>

        {/* Left content menu */}
        <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-surface">
          <div className="px-4 py-4 text-[11px] font-semibold tracking-[0.2em] text-muted">CONTENT</div>
          <nav className="flex-1 space-y-1 px-2">
            <button
              type="button"
              onClick={() => setContentNav("design")}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-sm ${
                contentNav === "design" ? "bg-primary/10 font-semibold text-foreground" : "text-foreground hover:bg-background"
              }`}
            >
              Design and Build
            </button>
            <button
              type="button"
              onClick={() => setContentNav("links")}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-sm ${
                contentNav === "links" ? "bg-primary/10 font-semibold text-foreground" : "text-foreground hover:bg-background"
              }`}
            >
              Link Management
            </button>

            <div className="pt-3">
              <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
                <Plus size={14} />
                Personalization
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
                <Globe size={14} />
                Languages
              </button>
            </div>

            <div className="pt-4">
              <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Create with Operator
              </div>
              <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
                <Wand2 size={14} />
                Copy
              </button>
            </div>
          </nav>
          <button
            type="button"
            className="flex items-center gap-2 border-t border-border px-4 py-4 text-sm text-muted hover:text-foreground"
          >
            Style Settings
            <ExternalLink size={14} />
          </button>
        </aside>

        {/* Canvas */}
        <main className="flex min-w-0 flex-1 flex-col bg-[#e8ebf0]">
          <div className="flex items-center gap-2 px-4 py-3">
            <button
              type="button"
              onClick={() => setDeviceView("desktop")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                deviceView === "desktop" ? "bg-primary text-white" : "bg-surface text-muted"
              }`}
            >
              <Monitor size={16} />
            </button>
            <button
              type="button"
              onClick={() => setDeviceView("mobile")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                deviceView === "mobile" ? "bg-primary text-white" : "bg-surface text-muted"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="7" y="2" width="10" height="20" rx="2" />
                <line x1="12" y1="18" x2="12" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 items-start justify-center overflow-auto px-6 pb-6">
            <div
              className={`w-full rounded-lg bg-surface shadow-lg transition-all ${
                deviceView === "mobile" ? "max-w-[375px]" : "max-w-[680px]"
              } ${blocks.length === 0 ? "min-h-[520px]" : "min-h-[320px]"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {!previewMode && blocks.length === 0 ? (
                <div
                  className={`mx-6 mt-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition ${
                    dragOver ? "border-primary bg-primary/5" : "border-primary/30 bg-primary/[0.03]"
                  }`}
                >
                  <Upload size={24} className="text-primary" />
                  <p className="mt-3 text-sm font-medium text-primary">Drop content blocks here</p>
                </div>
              ) : null}

              <div className={`space-y-1 p-6 pb-8 ${blocks.length === 0 && !previewMode ? "pt-4" : ""}`}>
                {blocks.map((block) => {
                  if (isBlockHiddenOnDevice(block, deviceView)) return null;
                  const selected = selectedBlockId === block.id;

                  return (
                    <div
                      key={block.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (previewMode) return;
                        setSelectedBlockId(block.id);
                        setSidebarTab("content");
                      }}
                      onKeyDown={(event) => {
                        if (isEditableElement(event.target)) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          if (!previewMode) {
                            setSelectedBlockId(block.id);
                            setSidebarTab("content");
                          }
                        }
                      }}
                      className={`relative rounded-lg border p-1 transition ${
                        previewMode ? "pointer-events-none border-transparent" : "cursor-pointer"
                      } ${
                        selected
                          ? "mb-8 border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-primary/20 hover:bg-background/60"
                      }`}
                    >
                      {selected && !previewMode ? (
                        <BlockCanvasActions
                          onDelete={() => removeBlock(block.id)}
                          onCopy={() => duplicateBlock(block.id)}
                        />
                      ) : null}
                      <BlockPreview block={block} onChange={(content) => updateBlock(block.id, content)} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-surface">
          <div className="flex border-b border-border">
            {(
              [
                { id: "content" as const, label: "CONTENT", icon: LayoutGrid },
                { id: "rows" as const, label: "ROWS", icon: AlignJustify },
                { id: "settings" as const, label: "SETTINGS", icon: Settings },
              ] as const
            ).map(({ id, label, icon: Icon }) => {
              const active = sidebarTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSidebarTab(id)}
                  className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold tracking-wide ${
                    active ? "border-b-2 border-primary text-primary" : "text-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {sidebarTab === "content" && selectedBlock?.type === "divider" ? (
              <EmailDragDropDividerProperties
                block={selectedBlock}
                onStyleChange={(dividerStyle) => updateDividerStyle(selectedBlock.id, dividerStyle)}
                onDelete={() => removeBlock(selectedBlock.id)}
                onDuplicate={() => duplicateBlock(selectedBlock.id)}
                onClose={() => setSelectedBlockId(null)}
              />
            ) : null}

            {sidebarTab === "content" && selectedBlock?.type === "button" ? (
              <EmailDragDropButtonProperties
                block={selectedBlock}
                onStyleChange={(buttonStyle) => updateButtonStyle(selectedBlock.id, buttonStyle)}
                onDelete={() => removeBlock(selectedBlock.id)}
                onDuplicate={() => duplicateBlock(selectedBlock.id)}
                onClose={() => setSelectedBlockId(null)}
              />
            ) : null}

            {sidebarTab === "content" && selectedBlock && isTextBlock(selectedBlock.type) ? (
              <EmailDragDropBlockProperties
                block={selectedBlock}
                onStyleChange={(style) => updateBlockStyle(selectedBlock.id, style)}
                onDelete={() => removeBlock(selectedBlock.id)}
                onDuplicate={() => duplicateBlock(selectedBlock.id)}
                onClose={() => setSelectedBlockId(null)}
              />
            ) : null}

            {sidebarTab === "content" && (!selectedBlock || !isPropertiesBlock(selectedBlock.type)) ? (
              <>
                <CollapsibleSection title="BASIC BLOCKS">
                  <div className="grid grid-cols-3 gap-2">
                    {BASIC_BLOCKS.map((type) => (
                      <BlockLibraryItem key={type} type={type} onAdd={addBlock} />
                    ))}
                  </div>
                </CollapsibleSection>
                <CollapsibleSection title="MEDIA">
                  <div className="grid grid-cols-3 gap-2">
                    {MEDIA_BLOCKS.map((type) => (
                      <BlockLibraryItem key={type} type={type} onAdd={addBlock} />
                    ))}
                  </div>
                </CollapsibleSection>
                <CollapsibleSection title="ADVANCED">
                  <div className="grid grid-cols-3 gap-2">
                    {ADVANCED_BLOCKS.map((type) => (
                      <BlockLibraryItem key={type} type={type} onAdd={addBlock} />
                    ))}
                  </div>
                </CollapsibleSection>
              </>
            ) : null}

            {sidebarTab === "rows" ? (
              <div className="space-y-2 p-4">
                {ROW_LAYOUTS.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-3 text-left hover:border-primary/40"
                  >
                    <div className="flex gap-1">
                      {Array.from({ length: row.cols }).map((_, i) => (
                        <span key={i} className="h-8 w-6 rounded bg-background" />
                      ))}
                    </div>
                    <span className="text-sm text-foreground">{row.label}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {sidebarTab === "settings" ? (
              <div className="space-y-4 p-4 text-sm">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted">Background color</label>
                  <input type="color" defaultValue="#ffffff" className="mt-2 h-9 w-full cursor-pointer rounded border border-border" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted">Content width</label>
                  <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2">
                    <option>600px</option>
                    <option>680px</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted">Default link color</label>
                  <input type="color" defaultValue="#4f46e5" className="mt-2 h-9 w-full cursor-pointer rounded border border-border" />
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Bottom action bar */}
      <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 bg-[#1a1d24] px-6 py-3">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-lg border border-primary bg-transparent px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
        >
          <Download size={14} />
          Download file
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Done
        </button>
      </footer>
    </div>
  );
}
