"use client";

import { useCallback, useState } from "react";
import {
  AlignJustify,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Code,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Mail,
  Menu,
  Minus,
  Monitor,
  MoveVertical,
  Pencil,
  Play,
  Plus,
  Settings,
  Sparkles,
  Square,
  Star,
  Upload,
  Wand2,
} from "lucide-react";

export type BlockType =
  | "title"
  | "paragraph"
  | "list"
  | "button"
  | "divider"
  | "spacer"
  | "image"
  | "video"
  | "social"
  | "icons"
  | "html"
  | "menu";

export type CanvasBlock = {
  id: string;
  type: BlockType;
  content: string;
};

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

function defaultContent(type: BlockType): string {
  switch (type) {
    case "title":
      return "Your headline here";
    case "paragraph":
      return "Write your message here. Add personalization with {{ first_name }}.";
    case "list":
      return "First item\nSecond item\nThird item";
    case "button":
      return "Call to action";
    case "html":
      return "<p>Custom HTML block</p>";
    case "menu":
      return "Home | Products | Contact";
    default:
      return "";
  }
}

function blockToHtml(block: CanvasBlock): string {
  switch (block.type) {
    case "title":
      return `<h1 style="font-size:28px;font-weight:700;margin:0 0 16px;color:#0f172a;">${block.content}</h1>`;
    case "paragraph":
      return `<p style="font-size:16px;line-height:1.6;margin:0 0 16px;color:#334155;">${block.content.replace(/\n/g, "<br/>")}</p>`;
    case "list": {
      const items = block.content.split("\n").filter(Boolean);
      return `<ul style="margin:0 0 16px;padding-left:20px;color:#334155;">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
    }
    case "button":
      return `<p style="margin:0 0 16px;"><a href="#" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">${block.content}</a></p>`;
    case "divider":
      return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`;
    case "spacer":
      return `<div style="height:32px;"></div>`;
    case "image":
      return `<p style="margin:0 0 16px;text-align:center;"><img src="https://placehold.co/600x240/e2e8f0/64748b?text=Image" alt="Image" style="max-width:100%;border-radius:8px;" /></p>`;
    case "video":
      return `<p style="margin:0 0 16px;text-align:center;color:#64748b;">[ Video placeholder ]</p>`;
    case "social":
      return `<p style="margin:0 0 16px;text-align:center;color:#64748b;">[ Social links ]</p>`;
    case "icons":
      return `<p style="margin:0 0 16px;text-align:center;color:#64748b;">[ Icon row ]</p>`;
    case "html":
      return block.content;
    case "menu":
      return `<p style="margin:0 0 16px;text-align:center;font-size:14px;color:#64748b;">${block.content}</p>`;
    default:
      return "";
  }
}

export function blocksToHtml(blocks: CanvasBlock[]): string {
  const inner = blocks.map(blockToHtml).join("\n");
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Segoe UI,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;padding:32px;">
            <tr><td>${inner}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function BlockPreview({ block, onChange }: { block: CanvasBlock; onChange: (content: string) => void }) {
  switch (block.type) {
    case "title":
      return (
        <input
          value={block.content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 bg-transparent text-2xl font-bold text-foreground outline-none"
          placeholder="Your headline here"
        />
      );
    case "paragraph":
      return (
        <textarea
          value={block.content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none border-0 bg-transparent text-base leading-relaxed text-foreground outline-none"
          rows={3}
          placeholder="Write your message here"
        />
      );
    case "list":
      return (
        <textarea
          value={block.content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none border-0 bg-transparent text-base text-foreground outline-none"
          rows={3}
          placeholder="One item per line"
        />
      );
    case "button":
      return (
        <div className="py-2">
          <input
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg bg-primary px-6 py-3 text-center text-sm font-semibold text-white outline-none"
          />
        </div>
      );
    case "divider":
      return <hr className="my-4 border-border" />;
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
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("content");
  const [leftMode, setLeftMode] = useState<LeftMode>("edit");
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const [dragOver, setDragOver] = useState(false);
  const [contentNav, setContentNav] = useState<"design" | "links">("design");

  const addBlock = useCallback((type: BlockType) => {
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, content: defaultContent(type) },
    ]);
  }, []);

  const updateBlock = useCallback((id: string, content: string) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, content } : block)));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
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

          <div className="flex flex-1 justify-center overflow-auto px-6 pb-6">
            <div
              className={`w-full rounded-lg bg-surface shadow-lg transition-all ${
                deviceView === "mobile" ? "max-w-[375px]" : "max-w-[680px]"
              }`}
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

              <div className={`space-y-1 p-6 ${blocks.length === 0 && !previewMode ? "pt-4" : ""}`}>
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className={`group relative rounded-lg border border-transparent p-3 transition hover:border-primary/20 hover:bg-background/60 ${
                      previewMode ? "pointer-events-none" : ""
                    }`}
                  >
                    {!previewMode ? (
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        className="absolute right-2 top-2 hidden rounded bg-background px-2 py-0.5 text-[10px] text-muted shadow group-hover:inline-block"
                      >
                        Remove
                      </button>
                    ) : null}
                    <BlockPreview block={block} onChange={(content) => updateBlock(block.id, content)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-surface">
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
            {sidebarTab === "content" ? (
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
