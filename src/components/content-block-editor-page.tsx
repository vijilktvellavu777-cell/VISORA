"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Code,
  Copy,
  ExternalLink,
  Info,
  Lock,
  MousePointerClick,
  Tag,
  X,
} from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import { EmailDragDropEditor } from "@/components/email-drag-drop-editor";
import { EmailHtmlEditor } from "@/components/email-html-editor";
import { contentBlockLiquidTag, isValidContentBlockName } from "@/lib/content-blocks";

type EditorMode = "drag_drop" | "html" | null;

type ContentBlockDraft = {
  id?: string;
  name: string;
  description: string | null;
  body: string;
  editorType: EditorMode;
  status: string;
};

const EDITOR_OPTIONS = [
  {
    id: "drag_drop" as const,
    title: "Drag-and-drop editor",
    subtitle: "Start from scratch",
    icon: MousePointerClick,
  },
  {
    id: "html" as const,
    title: "HTML code editor",
    subtitle: "Start from scratch",
    icon: Code,
  },
];

export function ContentBlockEditorPage({
  initial,
}: {
  initial?: ContentBlockDraft;
}) {
  const router = useRouter();
  const isEditing = Boolean(initial?.id);
  const [block, setBlock] = useState<ContentBlockDraft>(
    initial ?? {
      name: "",
      description: null,
      body: "",
      editorType: null,
      status: "draft",
    },
  );
  const [showDescription, setShowDescription] = useState(Boolean(initial?.description));
  const [showMore, setShowMore] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [dragDropEditorOpen, setDragDropEditorOpen] = useState(false);
  const [htmlEditorOpen, setHtmlEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const liquidTag = contentBlockLiquidTag(block.name);

  async function copyLiquidTag() {
    await navigator.clipboard.writeText(liquidTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function selectEditorMode(mode: EditorMode) {
    setBlock((current) => ({ ...current, editorType: mode }));
  }

  async function saveDraft() {
    const name = block.name.trim();
    if (!name) {
      setNameError("Content block name is required.");
      return;
    }
    if (!isValidContentBlockName(name)) {
      setNameError("Use letters, numbers, hyphens, and underscores only.");
      return;
    }

    setSaving(true);
    setError(null);
    setNameError(null);

    const payload = {
      kind: "content_card",
      name,
      description: block.description,
      body: block.body,
      editorType: block.editorType,
      status: "draft",
      blockType: "content_block",
    };

    const response = await fetch(isEditing ? `/api/content/${initial!.id}` : "/api/content", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      const message = typeof json.error === "string" ? json.error : "Could not save content block";
      if (message.includes("letters, numbers")) {
        setNameError(message);
      } else {
        setError(message);
      }
      return;
    }

    const saved = await response.json();
    if (!isEditing) {
      router.replace(`/content/templates/content-blocks/${saved.id}/edit`);
    }
    router.refresh();
  }

  function closeEditor() {
    router.push("/content/templates/content-blocks");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border bg-surface px-6 pt-3">
        <div className="flex items-center gap-1 text-sm">
          <Link
            href="/content/templates/content-blocks"
            className="rounded-t-lg px-3 py-2 text-muted hover:text-foreground"
          >
            Content Block Templates
          </Link>
          <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-background px-3 py-2 font-medium text-foreground">
            {isEditing ? `Edit '${block.name || "Content Block"}'` : "New Content Block"}
            <button type="button" onClick={closeEditor} className="text-muted hover:text-foreground" aria-label="Close">
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl flex-1 px-8 py-8 pb-28">
        <Card className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Content Block Details</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Lock size={12} />
              Limited access
            </span>
          </div>

          <p className="text-sm text-muted">
            Your Content Block name is used in the Liquid tag and can&apos;t be changed after launch.{" "}
            <a href="#" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Learn more
              <ExternalLink size={12} />
            </a>
          </p>

          <Field label="Content Block Name">
            <input
              className={`${inputClass} ${nameError ? "border-error focus:border-error" : ""}`}
              value={block.name}
              placeholder="Enter Content Block Name"
              onChange={(event) => {
                if (nameError) setNameError(null);
                setBlock({ ...block, name: event.target.value });
              }}
            />
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
              <Info size={14} className="mt-0.5 shrink-0 text-primary" />
              Use letters, numbers, hyphens, and underscores only
            </p>
            {nameError ? <p className="mt-1.5 text-sm text-error">{nameError}</p> : null}
          </Field>

          {showDescription ? (
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-20`}
                value={block.description ?? ""}
                onChange={(event) => setBlock({ ...block, description: event.target.value })}
              />
            </Field>
          ) : (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="text-sm font-medium text-primary hover:underline"
            >
              + Add description
            </button>
          )}

          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              Content Block Liquid tag
              <Info size={14} className="text-primary" />
            </div>
            <div className="mt-2 flex overflow-hidden rounded-lg border border-border">
              <input
                readOnly
                value={liquidTag}
                className="min-w-0 flex-1 border-0 bg-surface px-3 py-2 font-mono text-sm text-muted outline-none"
              />
              <button
                type="button"
                onClick={copyLiquidTag}
                className="inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                <Copy size={14} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <hr className="border-border" />

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary"
          >
            <Tag size={14} />
            Tags
            <ChevronDown size={14} />
          </button>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="text-lg font-semibold text-foreground">Content Block</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {EDITOR_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = block.editorType === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectEditorMode(option.id)}
                  className={`rounded-xl border p-5 text-center transition hover:border-primary/40 hover:shadow-sm ${
                    active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-surface"
                  }`}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-background">
                    <Icon size={28} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-foreground">{option.title}</div>
                  <div className="mt-1 text-xs text-muted">{option.subtitle}</div>
                </button>
              );
            })}
          </div>

          {block.editorType === "html" ? (
            <div className="mt-6 rounded-xl border border-border bg-background p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">HTML code editor</p>
                  <p className="mt-1 text-sm text-muted">
                    {block.body.trim()
                      ? "Your HTML has been saved from the editor."
                      : "Open the editor to write HTML with a live preview."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHtmlEditorOpen(true)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  {block.body.trim() ? "Edit HTML" : "Open editor"}
                </button>
              </div>
            </div>
          ) : null}

          {block.editorType === "drag_drop" ? (
            <div className="mt-6 rounded-xl border border-border bg-background p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Drag-and-drop editor</p>
                  <p className="mt-1 text-sm text-muted">
                    {block.body.trim()
                      ? "Your content block design has been saved from the editor."
                      : "Open the editor to build your content block."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDragDropEditorOpen(true)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  {block.body.trim() ? "Edit design" : "Open editor"}
                </button>
              </div>
            </div>
          ) : null}
        </Card>

        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      </div>

      <footer className="fixed bottom-0 left-[460px] right-0 z-30 border-t border-border bg-surface">
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMore((value) => !value)}
              className="inline-flex items-center gap-2 rounded-lg border border-primary bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              More
              {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showMore ? (
              <div className="absolute bottom-full right-0 mb-2 min-w-[180px] rounded-lg border border-border bg-surface py-1 shadow-lg">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background"
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={saveDraft}
            disabled={saving}
            className="rounded-lg border border-primary bg-surface px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save as draft"}
          </button>
        </div>
      </footer>

      {htmlEditorOpen ? (
        <EmailHtmlEditor
          campaignName={block.name || "Content Block"}
          initialBody={block.body}
          onDone={(html) => {
            setBlock((current) => ({ ...current, body: html, editorType: "html" }));
            setHtmlEditorOpen(false);
          }}
          onClose={() => setHtmlEditorOpen(false)}
        />
      ) : null}

      {dragDropEditorOpen ? (
        <EmailDragDropEditor
          campaignName={block.name || "Content Block"}
          initialBody={block.body}
          onDone={(html) => {
            setBlock((current) => ({ ...current, body: html, editorType: "drag_drop" }));
            setDragDropEditorOpen(false);
          }}
          onClose={() => setDragDropEditorOpen(false)}
        />
      ) : null}
    </div>
  );
}
