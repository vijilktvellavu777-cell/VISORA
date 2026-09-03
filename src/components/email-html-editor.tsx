"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  Eye,
  Globe,
  Image as ImageIcon,
  Info,
  Mail,
  Pencil,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_PREVIEW_USER,
  EmailDragDropPreviewPanel,
  type PreviewUserProfile,
} from "@/components/email-drag-drop-preview-panel";

type Props = {
  campaignName: string;
  initialBody?: string;
  onDone: (html: string) => void;
  onClose: () => void;
};

type EditorTab = "html" | "classic" | "plaintext";
type LeftMode = "mail" | "edit" | "preview";

const DEFAULT_HTML = `<html>
  <body>
    <p>Hi {{ first_name }},</p>
  </body>
</html>`;

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPreviewDocument(code: string, tab: EditorTab) {
  const trimmed = code.trim();
  if (!trimmed) return "";

  if (tab === "plaintext") {
    return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:24px;font-family:Segoe UI,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;white-space:pre-wrap;">${escapeHtml(code)}</body>
</html>`;
  }

  if (/<html[\s>]/i.test(trimmed) || /<!doctype/i.test(trimmed)) {
    return trimmed;
  }

  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:24px;font-family:Segoe UI,sans-serif;">${trimmed}</body>
</html>`;
}

export function EmailHtmlEditor({ campaignName, initialBody, onDone, onClose }: Props) {
  const [code, setCode] = useState(initialBody?.trim() ? initialBody : DEFAULT_HTML);
  const [tab, setTab] = useState<EditorTab>("html");
  const [leftMode, setLeftMode] = useState<LeftMode>("edit");
  const [previewProfile, setPreviewProfile] = useState<PreviewUserProfile>(DEFAULT_PREVIEW_USER);
  const [expandBlocks, setExpandBlocks] = useState(true);
  const [editorWidth, setEditorWidth] = useState(58);
  const [isResizing, setIsResizing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lineCount = useMemo(() => Math.max(code.split("\n").length, 1), [code]);
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1),
    [lineCount],
  );

  const previewHtml = useMemo(() => buildPreviewDocument(code, tab), [code, tab]);
  const previewMode = leftMode === "preview";

  const syncScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    function handleMove(event: MouseEvent) {
      const workspace = document.getElementById("html-editor-workspace");
      if (!workspace) return;
      const rect = workspace.getBoundingClientRect();
      const next = ((event.clientX - rect.left) / rect.width) * 100;
      setEditorWidth(Math.min(75, Math.max(35, next)));
    }

    function handleUp() {
      setIsResizing(false);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isResizing]);

  function handleDownload() {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${campaignName.replace(/[^a-z0-9-_ ]/gi, "").trim() || "campaign"}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleDone() {
    onDone(code);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1d24] text-foreground">
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
                {active ? (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-white" />
                ) : null}
                <Icon size={18} />
              </button>
            );
          })}
        </aside>

        {previewMode ? (
          <EmailDragDropPreviewPanel
            blocks={[]}
            profile={previewProfile}
            onProfileChange={setPreviewProfile}
            htmlOverride={previewHtml}
          />
        ) : (
          <>
        <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-surface">
          <div className="px-4 py-4 text-[11px] font-semibold tracking-[0.2em] text-muted">CONTENT</div>
          <nav className="flex-1 space-y-1 px-2">
            <button
              type="button"
              className="flex w-full items-center rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-foreground"
            >
              Design and Build
            </button>
            <button type="button" className="flex w-full rounded-lg px-3 py-2 text-sm text-foreground hover:bg-background">
              Link Management
            </button>
            <button type="button" className="flex w-full rounded-lg px-3 py-2 text-sm text-foreground hover:bg-background">
              Gmail Promotion
            </button>
            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
              <span className="text-base leading-none">+</span>
              Personalization
            </button>
            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
              <Globe size={14} />
              Languages
            </button>
            <div className="pt-4">
              <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Create with Operator
              </div>
              <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
                <Wand2 size={14} />
                Liquid
              </button>
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

        <div id="html-editor-workspace" className="flex min-h-0 min-w-0 flex-1 bg-background">
          <section className="flex min-h-0 min-w-0 flex-col border-r border-border bg-surface" style={{ width: `${editorWidth}%` }}>
                <div className="flex shrink-0 items-center justify-between border-b border-border px-4">
                  <div className="flex items-center gap-6">
                    {(
                      [
                        { id: "html" as const, label: "HTML" },
                        { id: "classic" as const, label: "Classic" },
                        { id: "plaintext" as const, label: "Plaintext" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        className={`border-b-2 py-3 text-sm font-medium transition ${
                          tab === item.id
                            ? "border-primary text-primary"
                            : "border-transparent text-muted hover:text-foreground"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-muted">
                    <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background hover:text-foreground" aria-label="Web">
                      <Globe size={16} />
                    </button>
                    <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background hover:text-foreground" aria-label="Images">
                      <ImageIcon size={16} />
                    </button>
                    <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background hover:text-foreground" aria-label="Search">
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 overflow-hidden">
                  <div
                    ref={lineNumbersRef}
                    className="w-12 shrink-0 overflow-hidden border-r border-border bg-background py-3 text-right font-mono text-xs leading-6 text-muted"
                  >
                    {lineNumbers.map((line) => (
                      <div key={line} className="pr-3">
                        {line}
                      </div>
                    ))}
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onScroll={syncScroll}
                    spellCheck={false}
                    className="min-h-0 w-full flex-1 resize-none border-0 bg-surface py-3 pl-3 pr-4 font-mono text-sm leading-6 text-foreground outline-none"
                    aria-label="HTML code editor"
                  />
                </div>
              </section>

          <button
            type="button"
            aria-label="Resize editor"
            onMouseDown={() => setIsResizing(true)}
            className={`flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-border/60 hover:bg-primary/30 ${
              isResizing ? "bg-primary/40" : ""
            }`}
          >
            <span className="h-10 w-1 rounded-full bg-muted" />
          </button>

          <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Preview</h2>
              <label className="flex items-center gap-2 text-sm text-muted">
                <span>Expand Content Blocks</span>
                <Info size={14} />
                <button
                  type="button"
                  role="switch"
                  aria-checked={expandBlocks}
                  onClick={() => setExpandBlocks((value) => !value)}
                  className={`relative h-5 w-9 rounded-full transition ${expandBlocks ? "bg-primary" : "bg-border"}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      expandBlocks ? "left-4" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              <div className="mx-auto min-h-[320px] max-w-3xl rounded-lg border border-border bg-white">
                {previewHtml ? (
                  <iframe
                    title="Email preview"
                    srcDoc={previewHtml}
                    sandbox="allow-same-origin"
                    className={`h-[480px] w-full border-0 ${expandBlocks ? "min-h-[480px]" : "h-[360px]"}`}
                  />
                ) : (
                  <div className="flex h-[360px] items-center justify-center px-6 text-sm text-muted">
                    No content available for preview.
                  </div>
                )}
              </div>

              <p className="mx-auto mt-4 max-w-3xl text-xs text-muted">
                Actual rendering may not be identical to this preview depending on the user&apos;s environment.
              </p>
              <p className="mx-auto mt-2 flex max-w-3xl items-center gap-1.5 text-xs text-muted">
                CSS inlining enabled
                <Info size={12} />
              </p>
            </div>
          </section>
        </div>
          </>
        )}
      </div>

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
