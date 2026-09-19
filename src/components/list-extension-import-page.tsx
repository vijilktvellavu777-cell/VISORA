"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { extensionAttributeLabel } from "@/lib/list-extension-attributes";

type Props = {
  extensionName: string;
  attributes: string[];
};

function buildSampleCsv(attributes: string[]): string {
  const header = attributes.join(",");
  const sampleRow = attributes
    .map((attribute) => {
      if (attribute === "email") return "user@example.com";
      if (attribute === "first_name") return "Alex";
      if (attribute === "last_name") return "Rivera";
      if (attribute === "phone") return "+15551234567";
      if (attribute === "external_id") return "user_001";
      return "value";
    })
    .join(",");
  return `${header}\n${sampleRow}\n`;
}

export function ListExtensionImportPageClient({ extensionName, attributes }: Props) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const csvColumns = attributes.join(", ");
  const backHref = `/audience/list-extensions/${params.id}`;

  const downloadSample = useCallback(() => {
    const blob = new Blob([buildSampleCsv(attributes)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${extensionName.replace(/\s+/g, "-").toLowerCase()}-sample.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [attributes, extensionName]);

  async function runImport(selected: File | null) {
    if (!selected) return;

    setBusy(true);
    setMessage(null);

    const text = await selected.text();
    const response = await fetch(`/api/audience/list-extensions/${params.id}/import`, {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: text,
    });
    const json = await response.json();

    setBusy(false);
    if (!response.ok) {
      setMessage({ tone: "error", text: json.error ?? "Import failed. Check your CSV headers and try again." });
      return;
    }

    setMessage({
      tone: "ok",
      text: `Successfully imported ${json.imported} record${json.imported === 1 ? "" : "s"}.`,
    });
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  function onFileSelected(next: File | null) {
    if (!next) return;
    if (!next.name.toLowerCase().endsWith(".csv") && next.type !== "text/csv") {
      setMessage({ tone: "error", text: "Please upload a .csv file." });
      return;
    }
    setFile(next);
    setMessage(null);
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border bg-surface px-8 py-6">
        <nav className="text-sm text-muted">
          <Link href="/audience/list-extensions" className="hover:text-primary">
            List Extensions
          </Link>
          <span className="mx-2">/</span>
          <Link href={backHref} className="hover:text-primary">
            {extensionName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Import</span>
        </nav>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Import</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Add users to <span className="font-medium text-foreground">{extensionName}</span> with a
              CSV that matches your extension attributes.
            </p>
          </div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-background"
          >
            <ArrowLeft size={16} />
            Back to list
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-8 py-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Upload CSV</h2>
              <p className="mt-1 text-sm text-muted">
                First row must be column headers. Required columns for this extension:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {attributes.map((attribute) => (
                  <Badge key={attribute} tone="accent">
                    {extensionAttributeLabel(attribute)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="px-6 py-6">
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(false);
                  onFileSelected(event.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() => inputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/40 hover:bg-background/80"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload size={28} />
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">
                  Drag and drop your CSV here
                </p>
                <p className="mt-1 text-sm text-muted">or click to browse files</p>
                <p className="mt-3 text-xs text-muted">Accepts .csv up to your browser limit</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(event) => onFileSelected(event.target.files?.[0] ?? null)}
                />
              </div>

              {file ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileSpreadsheet size={20} className="shrink-0 text-primary" />
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setFile(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                    >
                      Remove
                    </Button>
                    <Button type="button" onClick={() => void runImport(file)}>
                      {busy ? "Importing…" : "Import file"}
                    </Button>
                  </div>
                </div>
              ) : null}

              {message ? (
                <div
                  className={`mt-4 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                    message.tone === "ok"
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-warning/30 bg-warning/10 text-warning"
                  }`}
                >
                  {message.tone === "ok" ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground">Expected header row</h3>
            <p className="mt-2 text-sm text-muted">
              Use these exact column names in the first line of your file (comma-separated):
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-background px-4 py-3 font-mono text-xs text-foreground">
              {csvColumns}
            </pre>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">Quick tips</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-muted">
              <li>Download the sample CSV and replace rows with your data.</li>
              <li>Keep one user per row; do not skip the header row.</li>
              <li>Include at least one identifier column (email, phone, or external ID).</li>
            </ol>
            <Button type="button" variant="ghost" onClick={downloadSample} >
              <span className="inline-flex items-center gap-2">
                <Download size={16} />
                Download sample CSV
              </span>
            </Button>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">After import</h3>
            <p className="mt-2 text-sm text-muted">
              New rows appear on the extension list immediately. Use counts to verify audience size.
            </p>
            <Link href={`${backHref}/counts`} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
              View counts →
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
