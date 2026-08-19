"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { FolderOpen, Lock } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, inputClass } from "@/components/ui";

type MediaFileItem = {
  id: string;
  name: string;
  content: string;
  kind: string;
  createdAt: string;
  updatedAt: string;
};

function kindLabel(kind: string) {
  if (kind === "html") return "HTML";
  return "Image";
}

export function MediaLibraryPageClient({ files }: { files: MediaFileItem[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"image" | "html">("image");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "html">("all");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return files;
    return files.filter((file) => file.kind === filter);
  }, [files, filter]);

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
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border px-8">
        <div className="inline-flex border-b-2 border-primary py-4 text-sm font-medium text-primary">
          Media Library
        </div>
      </div>

      <div className="border-b border-border px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Media Library</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Lock size={12} />
              Limited access
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          Manage image assets and HTML files in one place for reuse across campaigns and templates.
        </p>
      </div>

      <div className="grid gap-6 p-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="space-y-4 p-5">
          <div className="text-sm font-medium">Add to Media Library</div>
          <Field label="Type">
            <select
              className={inputClass}
              value={kind}
              onChange={(event) => setKind(event.target.value as "image" | "html")}
            >
              <option value="image">Image</option>
              <option value="html">HTML</option>
            </select>
          </Field>
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label={kind === "image" ? "Image URL" : "HTML content"}>
            {kind === "html" ? (
              <textarea
                className={`${inputClass} min-h-40 font-mono text-xs`}
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
            ) : (
              <input className={inputClass} value={content} onChange={(event) => setContent(event.target.value)} />
            )}
          </Field>
          <Button onClick={onSave}>{saving ? "Saving…" : "Save to library"}</Button>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="text-sm font-medium text-foreground">
              {filtered.length} item{filtered.length === 1 ? "" : "s"}
            </div>
            <div className="flex gap-2">
              {(["all", "image", "html"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    filter === value
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted hover:bg-background hover:text-foreground"
                  }`}
                >
                  {value === "all" ? "All" : kindLabel(value)}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No media yet"
              body="Upload images and HTML files to build your shared media library."
            />
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((file) => (
                <li key={file.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-foreground">{file.name}</div>
                      <div className="mt-1 text-xs text-muted">
                        Updated {format(new Date(file.updatedAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    <Badge tone="accent">{kindLabel(file.kind)}</Badge>
                  </div>
                  {file.kind === "image" ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.content} alt={file.name} className="max-h-40 w-full object-cover" />
                    </div>
                  ) : (
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">
                      {file.content}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {files.length === 0 ? (
        <div className="px-8 pb-8">
          <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center">
            <FolderOpen size={32} className="text-primary" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">Your Media Library is empty</h2>
            <p className="mt-2 text-sm text-muted">
              Add images and HTML snippets to reuse them across your content and campaigns.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
