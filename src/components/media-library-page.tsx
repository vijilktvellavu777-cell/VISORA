"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Folder, FolderOpen, Lock } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, inputClass } from "@/components/ui";

type MediaFileItem = {
  id: string;
  name: string;
  content: string;
  kind: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
};

type MediaFolderItem = {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
};

type LibraryItem =
  | { type: "folder"; item: MediaFolderItem }
  | { type: "file"; item: MediaFileItem };

type AddType = "image" | "html" | "folder";
type FilterType = "all" | "folder" | "image" | "html";

function kindLabel(kind: string) {
  if (kind === "html") return "HTML";
  if (kind === "folder") return "Folder";
  return "Image";
}

export function MediaLibraryPageClient({
  files,
  folders,
}: {
  files: MediaFileItem[];
  folders: MediaFolderItem[];
}) {
  const router = useRouter();
  const [addType, setAddType] = useState<AddType>("image");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [saving, setSaving] = useState(false);

  const libraryItems = useMemo<LibraryItem[]>(() => {
    const folderItems: LibraryItem[] = folders.map((folder) => ({ type: "folder", item: folder }));
    const fileItems: LibraryItem[] = files.map((file) => ({ type: "file", item: file }));
    return [...folderItems, ...fileItems].sort(
      (a, b) => new Date(getUpdatedAt(b)).getTime() - new Date(getUpdatedAt(a)).getTime(),
    );
  }, [files, folders]);

  const filtered = useMemo(() => {
    if (filter === "all") return libraryItems;
    if (filter === "folder") return libraryItems.filter((entry) => entry.type === "folder");
    return libraryItems.filter((entry) => entry.type === "file" && entry.item.kind === filter);
  }, [libraryItems, filter]);

  async function onSave() {
    if (!name.trim()) return;
    if (addType !== "folder" && !content.trim()) return;

    setSaving(true);

    if (addType === "folder") {
      await fetch("/api/content/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } else {
      await fetch("/api/content/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: addType, name, content }),
      });
    }

    setName("");
    setContent("");
    setSaving(false);
    router.refresh();
  }

  const isEmpty = files.length === 0 && folders.length === 0;

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
          Manage folders, image assets, and HTML files in one place for reuse across campaigns and templates.
        </p>
      </div>

      <div className="grid gap-6 p-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="space-y-4 p-5">
          <div className="text-sm font-medium">Add to Media Library</div>
          <Field label="Type">
            <select
              className={inputClass}
              value={addType}
              onChange={(event) => setAddType(event.target.value as AddType)}
            >
              <option value="folder">Folder</option>
              <option value="image">Image</option>
              <option value="html">HTML</option>
            </select>
          </Field>
          <Field label={addType === "folder" ? "Folder name" : "Name"}>
            <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          {addType !== "folder" ? (
            <Field label={addType === "image" ? "Image URL" : "HTML content"}>
              {addType === "html" ? (
                <textarea
                  className={`${inputClass} min-h-40 font-mono text-xs`}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              ) : (
                <input className={inputClass} value={content} onChange={(event) => setContent(event.target.value)} />
              )}
            </Field>
          ) : null}
          <Button onClick={onSave}>
            {saving ? "Saving…" : addType === "folder" ? "Create folder" : "Save to library"}
          </Button>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="text-sm font-medium text-foreground">
              {filtered.length} item{filtered.length === 1 ? "" : "s"}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "folder", "image", "html"] as const).map((value) => (
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
              body="Create folders or upload images and HTML files to build your shared media library."
            />
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((entry) =>
                entry.type === "folder" ? (
                  <li key={`folder-${entry.item.id}`} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Folder size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{entry.item.name}</div>
                          <div className="mt-1 text-xs text-muted">
                            {entry.item.fileCount} file{entry.item.fileCount === 1 ? "" : "s"} · Updated{" "}
                            {format(new Date(entry.item.updatedAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                      <Badge tone="accent">Folder</Badge>
                    </div>
                  </li>
                ) : (
                  <li key={`file-${entry.item.id}`} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">{entry.item.name}</div>
                        <div className="mt-1 text-xs text-muted">
                          Updated {format(new Date(entry.item.updatedAt), "MMM d, yyyy")}
                        </div>
                      </div>
                      <Badge tone="accent">{kindLabel(entry.item.kind)}</Badge>
                    </div>
                    {entry.item.kind === "image" ? (
                      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-background">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={entry.item.content} alt={entry.item.name} className="max-h-40 w-full object-cover" />
                      </div>
                    ) : (
                      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">
                        {entry.item.content}
                      </pre>
                    )}
                  </li>
                ),
              )}
            </ul>
          )}
        </Card>
      </div>

      {isEmpty ? (
        <div className="px-8 pb-8">
          <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center">
            <FolderOpen size={32} className="text-primary" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">Your Media Library is empty</h2>
            <p className="mt-2 text-sm text-muted">
              Create folders or add images and HTML snippets to organize your reusable media.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getUpdatedAt(entry: LibraryItem) {
  return entry.type === "folder" ? entry.item.updatedAt : entry.item.updatedAt;
}
