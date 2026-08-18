"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Code,
  ExternalLink,
  Lock,
  MousePointerClick,
  Tag,
  X,
} from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import { EmailDragDropEditor } from "@/components/email-drag-drop-editor";
import { EmailHtmlEditor } from "@/components/email-html-editor";
import { mapEditorTypeForApi, mapEditorTypeFromApi } from "@/lib/email-templates";

type EditorMode = "drag_drop" | "html" | null;

type EmailTemplateDraft = {
  id?: string;
  name: string;
  subject: string | null;
  body: string;
  editorType: EditorMode;
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

export function EmailTemplateEditorPage({ initial }: { initial?: EmailTemplateDraft }) {
  const router = useRouter();
  const isEditing = Boolean(initial?.id);
  const [template, setTemplate] = useState<EmailTemplateDraft>(
    initial ?? {
      name: "",
      subject: null,
      body: "",
      editorType: null,
    },
  );
  const [showMore, setShowMore] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [dragDropEditorOpen, setDragDropEditorOpen] = useState(false);
  const [htmlEditorOpen, setHtmlEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectEditorMode(mode: EditorMode) {
    setTemplate((current) => ({ ...current, editorType: mode }));
  }

  async function saveDraft() {
    const name = template.name.trim();
    if (!name) {
      setNameError("Email template name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setNameError(null);

    const payload = {
      name,
      channel: "email",
      subject: template.subject,
      body: template.body,
      editorType: mapEditorTypeForApi(template.editorType),
      source: "saved",
    };

    const response = await fetch(isEditing ? `/api/templates/${initial!.id}` : "/api/templates", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(typeof json.error === "string" ? json.error : "Could not save email template");
      return;
    }

    router.push("/content/templates/email");
    router.refresh();
  }

  function closeEditor() {
    router.push("/content/templates/email");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border bg-surface px-6 pt-3">
        <div className="flex items-center gap-1 text-sm">
          <Link
            href="/content/templates/email"
            className="rounded-t-lg px-3 py-2 text-muted hover:text-foreground"
          >
            Email Templates
          </Link>
          <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-background px-3 py-2 font-medium text-foreground">
            {isEditing ? `Edit '${template.name || "Email Template"}'` : "New Email Template"}
            <button type="button" onClick={closeEditor} className="text-muted hover:text-foreground" aria-label="Close">
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl flex-1 px-8 py-8 pb-28">
        <Card className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Email Template Details</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Lock size={12} />
              Limited access
            </span>
          </div>

          <p className="text-sm text-muted">
            Your email template name is used to identify this template across campaigns.{" "}
            <a href="#" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Learn more
              <ExternalLink size={12} />
            </a>
          </p>

          <Field label="Email Template Name">
            <input
              className={`${inputClass} ${nameError ? "border-error focus:border-error" : ""}`}
              value={template.name}
              placeholder="Enter Email Template Name"
              onChange={(event) => {
                if (nameError) setNameError(null);
                setTemplate({ ...template, name: event.target.value });
              }}
            />
            {nameError ? <p className="mt-1.5 text-sm text-error">{nameError}</p> : null}
          </Field>

          <Field label="Subject line">
            <input
              className={inputClass}
              value={template.subject ?? ""}
              placeholder="Enter subject line"
              onChange={(event) => setTemplate({ ...template, subject: event.target.value })}
            />
          </Field>

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
          <h2 className="text-lg font-semibold text-foreground">Email Template</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {EDITOR_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = template.editorType === option.id;
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

          {template.editorType === "html" ? (
            <div className="mt-6 rounded-xl border border-border bg-background p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">HTML code editor</p>
                  <p className="mt-1 text-sm text-muted">
                    {template.body.trim()
                      ? "Your HTML has been saved from the editor."
                      : "Open the editor to write HTML with a live preview."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHtmlEditorOpen(true)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  {template.body.trim() ? "Edit HTML" : "Open editor"}
                </button>
              </div>
            </div>
          ) : null}

          {template.editorType === "drag_drop" ? (
            <div className="mt-6 rounded-xl border border-border bg-background p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Drag-and-drop editor</p>
                  <p className="mt-1 text-sm text-muted">
                    {template.body.trim()
                      ? "Your email design has been saved from the editor."
                      : "Open the editor to build your email template."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDragDropEditorOpen(true)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  {template.body.trim() ? "Edit design" : "Open editor"}
                </button>
              </div>
            </div>
          ) : null}
        </Card>

        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      </div>

      <footer className="fixed bottom-0 left-[240px] right-0 z-30 border-t border-border bg-surface">
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
          campaignName={template.name || "Email Template"}
          initialBody={template.body}
          onDone={(html) => {
            setTemplate((current) => ({ ...current, body: html, editorType: "html" }));
            setHtmlEditorOpen(false);
          }}
          onClose={() => setHtmlEditorOpen(false)}
        />
      ) : null}

      {dragDropEditorOpen ? (
        <EmailDragDropEditor
          campaignName={template.name || "Email Template"}
          initialBody={template.body}
          onDone={(html) => {
            setTemplate((current) => ({ ...current, body: html, editorType: "drag_drop" }));
            setDragDropEditorOpen(false);
          }}
          onClose={() => setDragDropEditorOpen(false)}
        />
      ) : null}
    </div>
  );
}
