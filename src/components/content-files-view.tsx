"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, EmptyState, Field, PageHeader, inputClass } from "@/components/ui";

type ContentFileItem = {
  id: string;
  name: string;
  content: string;
  kind: string;
};

type ContentFilesViewProps = {
  title: string;
  subtitle: string;
  kind: "image" | "html";
  items: ContentFileItem[];
};

export function ContentFilesView({ title, subtitle, kind, items }: ContentFilesViewProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!name.trim() || !content.trim()) return;
    setSaving(true);
    await fetch("/api/content/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, name, content }),
    });
    setName("");
    setContent("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid gap-4 p-8 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <div className="text-sm font-medium">Upload {title.toLowerCase()}</div>
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={kind === "image" ? "Image URL" : "HTML content"}>
            {kind === "html" ? (
              <textarea className={`${inputClass} min-h-40 font-mono text-xs`} value={content} onChange={(e) => setContent(e.target.value)} />
            ) : (
              <input className={inputClass} value={content} onChange={(e) => setContent(e.target.value)} />
            )}
          </Field>
          <Button onClick={onSave}>{saving ? "Saving…" : "Save file"}</Button>
        </Card>
        <Card>
          {items.length === 0 ? (
            <EmptyState
              title={`No ${title.toLowerCase()} yet`}
              body={`Saved ${title.toLowerCase()} will appear here for reuse across campaigns and templates.`}
            />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{item.name}</div>
                    <Badge tone="accent">{item.kind}</Badge>
                  </div>
                  {kind === "image" ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.content} alt={item.name} className="max-h-40 w-full object-cover" />
                    </div>
                  ) : (
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">
                      {item.content}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
