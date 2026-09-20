"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { parseCsvText } from "@/lib/csv-parse";
import {
  buildInitialColumnMappings,
  type ColumnMappingRow,
} from "@/lib/list-extension-import-map";
import { extensionAttributeLabel } from "@/lib/list-extension-attributes";

type Props = {
  extensionName: string;
  attributes: string[];
};

function buildSampleCsv(attributes: string[]): string {
  const header = attributes.map((attribute) => extensionAttributeLabel(attribute)).join(",");
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
  const [csvText, setCsvText] = useState("");
  const [columnMappings, setColumnMappings] = useState<ColumnMappingRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const backHref = `/audience/list-extensions/${params.id}`;
  const showMapping = file && columnMappings.length > 0;

  const selectedImportCount = useMemo(
    () => columnMappings.filter((mapping) => mapping.import).length,
    [columnMappings],
  );

  const mappedAttributeCount = useMemo(
    () => columnMappings.filter((mapping) => mapping.import && mapping.attribute).length,
    [columnMappings],
  );

  const downloadSample = useCallback(() => {
    const blob = new Blob([buildSampleCsv(attributes)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${extensionName.replace(/\s+/g, "-").toLowerCase()}-sample.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [attributes, extensionName]);

  function resetFile() {
    setFile(null);
    setCsvText("");
    setColumnMappings([]);
    setMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function loadFile(next: File) {
    const text = await next.text();
    const parsed = parseCsvText(text);
    if (parsed.headers.length === 0) {
      setMessage({ tone: "error", text: "This CSV file has no header row." });
      return;
    }

    setFile(next);
    setCsvText(text);
    setColumnMappings(buildInitialColumnMappings(parsed.headers, parsed.rows, attributes));
    setMessage(null);
  }

  async function onFileSelected(next: File | null) {
    if (!next) return;
    if (!next.name.toLowerCase().endsWith(".csv") && next.type !== "text/csv") {
      setMessage({ tone: "error", text: "Please upload a .csv file." });
      return;
    }
    await loadFile(next);
  }

  function updateMapping(index: number, patch: Partial<ColumnMappingRow>) {
    setColumnMappings((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  function setMappingAttribute(index: number, attribute: string) {
    setColumnMappings((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex === index) {
          return { ...row, attribute, import: attribute ? true : row.import };
        }
        if (attribute && row.attribute === attribute) {
          return { ...row, attribute: "" };
        }
        return row;
      }),
    );
  }

  async function runImport() {
    if (!file || !csvText) return;
    if (mappedAttributeCount === 0) {
      setMessage({ tone: "error", text: "Map at least one column to a VISORA attribute before importing." });
      return;
    }

    setBusy(true);
    setMessage(null);

    const response = await fetch(`/api/audience/list-extensions/${params.id}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        csv: csvText,
        mappings: columnMappings.map((mapping) => ({
          csvHeader: mapping.csvHeader,
          attribute: mapping.attribute,
          import: mapping.import,
        })),
      }),
    });
    const json = await response.json();

    setBusy(false);
    if (!response.ok) {
      setMessage({ tone: "error", text: json.error ?? "Import failed. Check your column mapping and try again." });
      return;
    }

    setMessage({
      tone: "ok",
      text: `Successfully imported ${json.imported} record${json.imported === 1 ? "" : "s"}.`,
    });
    resetFile();
    router.refresh();
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
              Upload a CSV, map your file headers to VISORA attributes for{" "}
              <span className="font-medium text-foreground">{extensionName}</span>, then import.
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

      <div className="mx-auto grid max-w-6xl gap-6 px-8 py-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {!showMapping ? (
            <Card className="overflow-hidden p-0">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-base font-semibold text-foreground">Upload CSV</h2>
                <p className="mt-1 text-sm text-muted">
                  After you choose a file, you&apos;ll map each column to a VISORA attribute.
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
                    void onFileSelected(event.dataTransfer.files?.[0] ?? null);
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
                  <p className="mt-4 text-sm font-medium text-foreground">Drag and drop your CSV here</p>
                  <p className="mt-1 text-sm text-muted">or click to browse files</p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={(event) => void onFileSelected(event.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            </Card>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileSpreadsheet size={20} className="shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{file?.name}</p>
                    <p className="text-xs text-muted">
                      {columnMappings.length} columns detected · {mappedAttributeCount} mapped to VISORA
                    </p>
                  </div>
                </div>
                <Button type="button" variant="ghost" onClick={resetFile}>
                  Choose different file
                </Button>
              </div>

              <Card className="overflow-hidden p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Map columns</h2>
                    <p className="mt-1 text-sm text-muted">
                      Match your CSV headers to VISORA attributes for this extension.
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Selected for import: {selectedImportCount}/{columnMappings.length}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-background/60 text-xs font-semibold uppercase tracking-wide text-muted">
                        <th className="px-4 py-3 font-semibold">Import</th>
                        <th className="px-4 py-3 font-semibold">CSV column</th>
                        <th className="px-4 py-3 font-semibold">Mapped</th>
                        <th className="px-4 py-3 font-semibold">VISORA attribute</th>
                        <th className="px-4 py-3 font-semibold">Sample data</th>
                        <th className="px-4 py-3 font-semibold">Data type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columnMappings.map((mapping, index) => (
                        <tr key={mapping.csvHeader} className="border-b border-border last:border-0">
                          <td className="px-4 py-4 align-top">
                            <input
                              type="checkbox"
                              checked={mapping.import}
                              onChange={(event) =>
                                updateMapping(index, { import: event.target.checked })
                              }
                              aria-label={`Import column ${mapping.csvHeader}`}
                              className="h-4 w-4 rounded border-border text-primary"
                            />
                          </td>
                          <td className="px-4 py-4 align-top">
                            <span className="inline-block max-w-[180px] truncate rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground">
                              {mapping.csvHeader}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top">
                            {mapping.import && mapping.attribute ? (
                              <ArrowRight size={18} className="text-success" aria-hidden />
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <select
                              value={mapping.attribute}
                              disabled={!mapping.import}
                              onChange={(event) => setMappingAttribute(index, event.target.value)}
                              className="min-w-[180px] rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                            >
                              <option value="">Don&apos;t import</option>
                              {attributes.map((attribute) => (
                                <option key={attribute} value={attribute}>
                                  {extensionAttributeLabel(attribute)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <ul className="space-y-1 text-xs text-muted">
                              {mapping.samples.filter((sample) => sample.trim()).length > 0 ? (
                                mapping.samples
                                  .filter((sample) => sample.trim())
                                  .slice(0, 3)
                                  .map((sample) => (
                                    <li key={`${mapping.csvHeader}-${sample}`} className="max-w-[220px] truncate">
                                      {sample}
                                    </li>
                                  ))
                              ) : (
                                <li>—</li>
                              )}
                            </ul>
                          </td>
                          <td className="px-4 py-4 align-top text-muted">{mapping.dataType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4">
                  <Button type="button" variant="ghost" onClick={resetFile}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => void runImport()}>
                    {busy ? "Importing…" : "Import mapped rows"}
                  </Button>
                </div>
              </Card>
            </>
          )}

          {message ? (
            <div
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
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

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">Mapping tips</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-muted">
              <li>We auto-match common headers like Email_address and First_name.</li>
              <li>Use the dropdown to map each CSV column to a VISORA attribute.</li>
              <li>Uncheck columns you don&apos;t want to import.</li>
            </ol>
            <Button type="button" variant="ghost" onClick={downloadSample}>
              <span className="inline-flex items-center gap-2">
                <Download size={16} />
                Download sample CSV
              </span>
            </Button>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">VISORA attributes</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {attributes.map((attribute) => (
                <li key={attribute}>{extensionAttributeLabel(attribute)}</li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
