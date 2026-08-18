"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Calculator } from "lucide-react";
import { Card } from "@/components/ui";

export default function ListExtensionCountsPage() {
  const params = useParams<{ id: string }>();
  const [count, setCount] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runCounts() {
    setRunning(true);
    setError(null);

    const response = await fetch(`/api/audience/list-extensions/${params.id}/counts`);
    setRunning(false);

    if (!response.ok) {
      setError("Could not load record counts");
      return;
    }

    const data = await response.json();
    setCount(typeof data.count === "number" ? data.count : 0);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-8 py-8">
        <Link href="/audience/list-extensions" className="text-sm text-primary hover:underline">
          ← List Extensions
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Record counts</h1>
        <p className="mt-2 text-sm text-muted">Run counts to see how many records are in this extension list.</p>

        <Card className="mt-8 space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calculator size={18} />
            </div>
            <div>
              <div className="text-sm text-muted">Total records</div>
              <div className="text-2xl font-semibold text-foreground">
                {count === null ? "—" : count.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={runCounts}
            disabled={running}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {running ? "Running…" : "Run counts"}
          </button>

          {error ? <p className="text-sm text-error">{error}</p> : null}
        </Card>
      </div>
    </div>
  );
}
