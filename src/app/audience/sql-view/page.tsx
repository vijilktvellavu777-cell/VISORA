"use client";

import { useState } from "react";
import { Button, Card, PageHeader } from "@/components/ui";

const DEFAULT_SQL = `SELECT external_id, email, first_name, last_name, country
FROM customers
WHERE country IS NOT NULL
ORDER BY last_seen_at DESC
LIMIT 100;`;

export default function SqlViewPage() {
  const [sql, setSql] = useState(DEFAULT_SQL);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function runQuery() {
    setBusy(true);
    setResult(null);
    const response = await fetch("/api/audience/sql-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) {
      setResult(json.error ?? "Query failed.");
      return;
    }
    setResult(JSON.stringify(json.rows, null, 2));
  }

  return (
    <div>
      <PageHeader
        title="SQL view"
        subtitle="Run read-only queries against audience profile data in this workspace."
      />
      <div className="space-y-4 p-8">
        <Card className="space-y-3 p-5">
          <label className="block text-sm font-medium text-foreground">Query</label>
          <textarea
            value={sql}
            onChange={(event) => setSql(event.target.value)}
            rows={8}
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void runQuery()}>
              {busy ? "Running…" : "Run query"}
            </Button>
            <p className="text-xs text-muted">Only SELECT statements on customer fields are supported.</p>
          </div>
        </Card>
        {result ? (
          <Card className="overflow-x-auto p-5">
            <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">{result}</pre>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
