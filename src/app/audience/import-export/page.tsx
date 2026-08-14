"use client";

import { useState } from "react";
import { Button, Card, PageHeader } from "@/components/ui";

export default function ImportExportPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onImport(file: File | null) {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    const text = await file.text();
    const response = await fetch("/api/audience/import", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: text,
    });
    const json = await response.json();
    setBusy(false);
    setMessage(response.ok ? `Imported ${json.upserted} users.` : json.error ?? "Import failed");
  }

  return (
    <div>
      <PageHeader
        title="Import and export users"
        subtitle="Upload a CSV into VISORA or download the current audience."
      />
      <div className="grid gap-4 p-8 md:grid-cols-2">
        <Card className="space-y-3 p-5">
          <div className="font-medium">Import</div>
          <p className="text-sm text-muted">
            CSV columns: <code>external_id,email,first_name,last_name,country</code>
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => onImport(e.target.files?.[0] ?? null)}
          />
          <p className="text-sm text-muted">{busy ? "Importing…" : message}</p>
        </Card>
        <Card className="space-y-3 p-5">
          <div className="font-medium">Export</div>
          <p className="text-sm text-muted">Download all profiles in this workspace as CSV.</p>
          <Button href="/api/audience/export">Export CSV</Button>
        </Card>
      </div>
    </div>
  );
}
