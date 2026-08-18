"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui";
import { extensionAttributeLabel } from "@/lib/list-extension-attributes";

export function ListExtensionImportPageClient({ attributes }: { attributes: string[] }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const csvColumns = attributes.map((attribute) => attribute).join(",");

  async function onImport(file: File | null) {
    if (!file) return;

    setBusy(true);
    setMessage(null);

    const text = await file.text();
    const response = await fetch(`/api/audience/list-extensions/${params.id}/import`, {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: text,
    });
    const json = await response.json();

    setBusy(false);
    if (!response.ok) {
      setMessage(json.error ?? "Import failed");
      return;
    }

    setMessage(`Imported ${json.imported} records.`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-8 py-8">
        <Link href={`/audience/list-extensions/${params.id}`} className="text-sm text-primary hover:underline">
          ← Back to list
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Import</h1>
        <p className="mt-2 text-sm text-muted">Upload a CSV using the attributes configured for this extension.</p>

        <Card className="mt-8 space-y-3 p-6">
          <div className="font-medium text-foreground">Import CSV</div>
          <p className="text-sm text-muted">
            CSV columns: <code>{csvColumns}</code>
          </p>
          <div className="flex flex-wrap gap-2">
            {attributes.map((attribute) => (
              <span
                key={attribute}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {extensionAttributeLabel(attribute)}
              </span>
            ))}
          </div>
          <input type="file" accept=".csv,text/csv" onChange={(event) => onImport(event.target.files?.[0] ?? null)} />
          <p className="text-sm text-muted">{busy ? "Importing…" : message}</p>
        </Card>
      </div>
    </div>
  );
}
