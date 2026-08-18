"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, X } from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";

type InAppMessageDraft = {
  id: string;
  name: string;
  title: string | null;
  body: string;
  status: string;
};

export function InAppMessageEditorPage({ initial }: { initial: InAppMessageDraft }) {
  const router = useRouter();
  const [message, setMessage] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveDraft() {
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/content/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: message.name,
        title: message.title,
        body: message.body,
        status: "draft",
      }),
    });

    setSaving(false);
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(typeof json.error === "string" ? json.error : "Could not save in-app message");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border bg-surface px-6 pt-3">
        <div className="flex items-center gap-1 text-sm">
          <Link
            href="/content/templates/in-app-messages"
            className="rounded-t-lg px-3 py-2 text-muted hover:text-foreground"
          >
            In-app Messages
          </Link>
          <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-background px-3 py-2 font-medium text-foreground">
            Edit &apos;{message.name}&apos;
            <button
              type="button"
              onClick={() => router.push("/content/templates/in-app-messages")}
              className="text-muted hover:text-foreground"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 px-8 py-8 pb-28">
        <Card className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">In-app Message Details</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Lock size={12} />
              Limited access
            </span>
          </div>

          <Field label="Name">
            <input
              className={inputClass}
              value={message.name}
              onChange={(event) => setMessage({ ...message, name: event.target.value })}
            />
          </Field>
          <Field label="Title">
            <input
              className={inputClass}
              value={message.title ?? ""}
              onChange={(event) => setMessage({ ...message, title: event.target.value })}
            />
          </Field>
          <Field label="Message">
            <textarea
              className={`${inputClass} min-h-32`}
              value={message.body}
              onChange={(event) => setMessage({ ...message, body: event.target.value })}
            />
          </Field>
          {error ? <p className="text-sm text-error">{error}</p> : null}
        </Card>
      </div>

      <footer className="fixed bottom-0 left-[240px] right-0 z-30 border-t border-border bg-surface">
        <div className="flex items-center justify-end gap-3 px-6 py-4">
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
    </div>
  );
}
