"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, EmptyState, Field, PageHeader, inputClass } from "@/components/ui";

type ContentTemplateItem = {
  id: string;
  name: string;
  title?: string | null;
  subject?: string | null;
  body: string;
};

type ContentTemplatesViewProps = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyBody: string;
  items: ContentTemplateItem[];
  showSubject?: boolean;
  headlineLabel?: string;
  apiPath: string;
  payloadKind?: string;
};

export function ContentTemplatesView({
  title,
  subtitle,
  emptyTitle,
  emptyBody,
  items,
  showSubject = false,
  headlineLabel = "Title",
  apiPath,
  payloadKind,
}: ContentTemplatesViewProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!name.trim()) return;
    setSaving(true);
    await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(payloadKind ? { kind: payloadKind } : {}),
        name,
        title: headline,
        subject,
        body,
        channel: payloadKind ?? "email",
      }),
    });
    setName("");
    setHeadline("");
    setSubject("");
    setBody("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid gap-4 p-8 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <div className="text-sm font-medium">New {title.toLowerCase()} template</div>
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          {showSubject ? (
            <Field label="Subject">
              <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
          ) : (
            <Field label={headlineLabel}>
              <input className={inputClass} value={headline} onChange={(e) => setHeadline(e.target.value)} />
            </Field>
          )}
          <Field label="Body">
            <textarea className={`${inputClass} min-h-28`} value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <Button onClick={onSave}>{saving ? "Saving…" : "Save template"}</Button>
        </Card>
        <Card>
          {items.length === 0 ? (
            <EmptyState title={emptyTitle} body={emptyBody} />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <div className="font-medium">{item.name}</div>
                  {item.subject ? <div className="mt-1 text-sm text-muted">{item.subject}</div> : null}
                  {item.title ? <div className="mt-1 text-sm text-foreground">{item.title}</div> : null}
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
