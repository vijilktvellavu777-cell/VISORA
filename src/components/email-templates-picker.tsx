"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  Eye,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  Upload,
  X,
} from "lucide-react";

export type EmailTemplateItem = {
  id: string;
  name: string;
  subject: string | null;
  body: string;
  editorType: string;
  createdBy: string;
  updatedAt: string;
};

type Props = {
  onSelect: (template: EmailTemplateItem) => void;
  onClose: () => void;
  onBuildFromScratch?: (mode: "drag-drop" | "html") => void;
};

type Tab = "saved" | "visora";
type ViewMode = "list" | "grid";
type SortKey = "name" | "type" | "updatedAt";
type SortDir = "asc" | "desc";

function editorTypeLabel(type: string) {
  return type === "drag-drop" ? "Drag-and-drop" : "HTML";
}

function TemplateThumbnail({ template }: { template: EmailTemplateItem }) {
  return (
    <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-background">
      <div className="w-full px-1.5 py-1">
        <div className="mb-1 h-1.5 w-8 rounded bg-primary/30" />
        <div className="mb-1 h-1 w-full rounded bg-border" />
        <div className="mb-1 h-1 w-4/5 rounded bg-border" />
        <div className={`mt-1 h-2 rounded ${template.editorType === "drag-drop" ? "bg-primary/20" : "bg-muted/30"}`} />
      </div>
    </div>
  );
}

function TemplatePreviewPane({ template }: { template: EmailTemplateItem }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-foreground">{template.name}</h2>
        <p className="text-sm text-muted">
          {editorTypeLabel(template.editorType)} · Last edited{" "}
          {format(new Date(template.updatedAt), "MMM d, yyyy, h:mm a")} · Created by {template.createdBy}
        </p>
      </div>

      {template.subject ? (
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Subject line</div>
          <p className="mt-1 text-sm text-foreground">{template.subject}</p>
        </div>
      ) : null}

      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted">Email preview</div>
        <div className="mx-auto mt-2 max-w-3xl overflow-hidden rounded-lg border border-border bg-white">
          {template.body.trim() ? (
            <iframe
              title={`Preview ${template.name}`}
              srcDoc={template.body}
              className="h-[480px] w-full border-0 bg-white"
              sandbox=""
            />
          ) : (
            <div className="flex h-[480px] items-center justify-center px-6 text-sm text-muted">
              No content available for preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmailTemplatesPicker({ onSelect, onClose, onBuildFromScratch }: Props) {
  const [tab, setTab] = useState<Tab>("saved");
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateItem | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [buildOpen, setBuildOpen] = useState(false);
  const buildRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const source = tab === "saved" ? "saved" : "visora";
      const response = await fetch(`/api/templates?channel=email&source=${source}`);
      const data = await response.json();
      setTemplates(Array.isArray(data) ? data : []);
      setSelectedId(null);
      setPreviewTemplate(null);
      setLoading(false);
    }
    load().catch(() => {
      setTemplates([]);
      setLoading(false);
    });
  }, [tab]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!buildRef.current?.contains(event.target as Node)) setBuildOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    let rows = templates.filter((template) => {
      if (typeFilter !== "all" && template.editorType !== typeFilter) return false;
      if (search && !template.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      if (sortKey === "type") cmp = a.editorType.localeCompare(b.editorType);
      if (sortKey === "updatedAt") cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [templates, typeFilter, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "updatedAt" ? "desc" : "asc");
  }

  function resetFilters() {
    setStatusFilter("all");
    setTypeFilter("all");
    setSearch("");
  }

  function handleSelectTemplate() {
    const template = previewTemplate ?? filtered.find((item) => item.id === selectedId);
    if (!template) return;
    onSelect(template);
    onClose();
  }

  function openPreview(template: EmailTemplateItem) {
    setSelectedId(template.id);
    setPreviewTemplate(template);
  }

  function closePreview() {
    setPreviewTemplate(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      <header className="flex shrink-0 items-start justify-between border-b border-border px-8 py-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Email templates</h1>
        <div className="flex items-center gap-2">
          <div ref={buildRef} className="relative">
            <button
              type="button"
              onClick={() => setBuildOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Build from scratch
              <ChevronDown size={14} />
            </button>
            {buildOpen ? (
              <div className="absolute right-0 top-full z-10 mt-1 min-w-[180px] rounded-lg border border-border bg-surface py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setBuildOpen(false);
                    onBuildFromScratch?.("drag-drop");
                    onClose();
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-background"
                >
                  Drag-and-drop editor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBuildOpen(false);
                    onBuildFromScratch?.("html");
                    onClose();
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-background"
                >
                  HTML code editor
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted hover:bg-background"
            aria-label="Upload template"
          >
            <Upload size={18} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
      </header>

      <div className="border-b border-border px-8">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => setTab("saved")}
            className={`border-b-2 py-4 text-sm font-medium ${
              tab === "saved" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Saved templates
          </button>
          <button
            type="button"
            onClick={() => setTab("visora")}
            className={`border-b-2 py-4 text-sm font-medium ${
              tab === "visora" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Visora Templates
          </button>
        </div>
      </div>

      <div className="border-b border-border px-8 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-muted">Status</span>
              <div className="relative">
                <select
                  className="min-w-[140px] appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted">Type</span>
              <div className="relative">
                <select
                  className="min-w-[160px] appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All editor types</option>
                  <option value="drag-drop">Drag-and-drop</option>
                  <option value="html">HTML</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </label>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="pb-2 text-sm font-medium text-primary hover:underline"
            >
              Reset filters
            </button>
          </div>
          <label className="relative block min-w-[280px]">
            <input
              className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-10 text-sm outline-none focus:border-primary"
              placeholder="Search email template name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </label>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-b border-border px-8 py-3">
        {previewTemplate ? (
          <button
            type="button"
            onClick={closePreview}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft size={16} />
            Back to templates
          </button>
        ) : (
          <p className="text-sm font-semibold text-foreground">{filtered.length} Results</p>
        )}
        {!previewTemplate ? (
          <div className="inline-flex overflow-hidden rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`inline-flex h-9 w-9 items-center justify-center ${
              viewMode === "list" ? "bg-background text-foreground" : "text-muted hover:bg-background"
            }`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`inline-flex h-9 w-9 items-center justify-center border-l border-border ${
              viewMode === "grid" ? "bg-background text-foreground" : "text-muted hover:bg-background"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-8 py-2">
        {previewTemplate ? (
          <TemplatePreviewPane template={previewTemplate} />
        ) : loading ? (
          <p className="py-12 text-center text-sm text-muted">Loading templates…</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">No templates found.</p>
        ) : viewMode === "list" ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
                <th className="w-10 py-3 pr-3" />
                <th className="w-24 py-3 pr-4 font-medium"> </th>
                <th className="py-3 pr-4 font-medium">
                  <button type="button" onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 hover:text-foreground">
                    Name
                    <ArrowDownUp size={12} />
                  </button>
                </th>
                <th className="py-3 pr-4 font-medium">
                  <button type="button" onClick={() => toggleSort("type")} className="inline-flex items-center gap-1 hover:text-foreground">
                    Type
                    <ArrowDownUp size={12} />
                  </button>
                </th>
                <th className="py-3 pr-4 font-medium">
                  <button type="button" onClick={() => toggleSort("updatedAt")} className="inline-flex items-center gap-1 hover:text-foreground">
                    Last edited
                    <ChevronDown size={12} className={sortKey === "updatedAt" && sortDir === "desc" ? "" : "opacity-40"} />
                  </button>
                </th>
                <th className="py-3 pr-4 font-medium">Created by</th>
                <th className="w-12 py-3 text-right font-medium" aria-label="Preview" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((template) => {
                const selected = selectedId === template.id;
                return (
                  <tr
                    key={template.id}
                    onClick={() => openPreview(template)}
                    className={`cursor-pointer border-b border-border last:border-0 ${
                      selected ? "bg-primary/5" : "hover:bg-background"
                    }`}
                  >
                    <td className="py-4 pr-3">
                      <input type="radio" readOnly checked={selected} className="accent-primary" aria-label={`Select ${template.name}`} />
                    </td>
                    <td className="py-4 pr-4">
                      <TemplateThumbnail template={template} />
                    </td>
                    <td className="py-4 pr-4 font-medium text-foreground">{template.name}</td>
                    <td className="py-4 pr-4 text-muted">{editorTypeLabel(template.editorType)}</td>
                    <td className="py-4 pr-4 text-muted">
                      {format(new Date(template.updatedAt), "MMM d, yyyy, h:mm a")}
                    </td>
                    <td className="py-4 pr-4 text-muted">{template.createdBy}</td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openPreview(template);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-primary"
                        aria-label={`Preview ${template.name}`}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="grid gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((template) => {
              const selected = selectedId === template.id;
              return (
                <div
                  key={template.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openPreview(template)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openPreview(template);
                    }
                  }}
                  className={`relative cursor-pointer rounded-xl border p-4 text-left transition ${
                    selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openPreview(template);
                    }}
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-primary"
                    aria-label={`Preview ${template.name}`}
                  >
                    <Eye size={18} />
                  </button>
                  <div className="mb-3 flex justify-center">
                    <TemplateThumbnail template={template} />
                  </div>
                  <div className="font-medium text-foreground">{template.name}</div>
                  <div className="mt-1 text-xs text-muted">{editorTypeLabel(template.editorType)}</div>
                  <div className="mt-2 text-xs text-muted">
                    {format(new Date(template.updatedAt), "MMM d, yyyy, h:mm a")}
                  </div>
                  <div className="mt-1 text-xs text-muted">{template.createdBy}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-8 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-primary px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSelectTemplate}
          disabled={!selectedId && !previewTemplate}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-muted disabled:text-white/80"
        >
          Select template
        </button>
      </footer>
    </div>
  );
}
