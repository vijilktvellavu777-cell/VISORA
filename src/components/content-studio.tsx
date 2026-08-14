"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, EmptyState, Field, PageHeader, inputClass } from "@/components/ui";

const KINDS = [
  { id: "push", label: "Push" },
  { id: "in_app", label: "In-app" },
  { id: "content_card", label: "Content card" },
] as const;

type Template = {
  id: string;
  kind: string;
  name: string;
  title: string | null;
  body: string;
  imageUrl: string | null;
};

export function ContentStudio({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("push");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => templates.filter((item) => item.kind === kind), [templates, kind]);

  async function onSave() {
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, name, title, body, imageUrl }),
    });
    setName("");
    setTitle("");
    setBody("");
    setImageUrl("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Content"
        subtitle="Templates for push, in-app, and content cards."
      />
      <div className="space-y-4 p-8">
        <div className="flex flex-wrap gap-2">
          {KINDS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setKind(item.id)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium ${
                kind === item.id
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-foreground hover:bg-background"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-4 p-5">
            <div className="text-sm font-medium">New {KINDS.find((item) => item.id === kind)?.label} template</div>
            <Field label="Name">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label={kind === "push" ? "Title" : "Headline"}>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Body">
              <textarea className={`${inputClass} min-h-28`} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
            {kind === "content_card" ? (
              <Field label="Image URL">
                <input className={inputClass} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </Field>
            ) : null}
            <Button onClick={onSave}>{saving ? "Saving…" : "Save template"}</Button>
          </Card>
          <Card>
            {filtered.length === 0 ? (
              <EmptyState
                title={`No ${KINDS.find((item) => item.id === kind)?.label.toLowerCase()} templates`}
                body="Save a template on the left to start this library."
              />
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((item) => (
                  <li key={item.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{item.name}</div>
                      <Badge tone="accent">{item.kind.replace("_", " ")}</Badge>
                    </div>
                    {item.title ? <div className="mt-1 text-sm text-foreground">{item.title}</div> : null}
                    <p className="mt-1 text-sm text-muted">{item.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
