"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Field, PageHeader, inputClass } from "@/components/ui";
import type { SegmentFilter, SegmentRules } from "@/lib/types";

const emptyFilter = (): SegmentFilter => ({
  kind: "attribute",
  field: "plan",
  op: "eq",
  value: "",
});

export default function NewSegmentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [op, setOp] = useState<SegmentRules["op"]>("and");
  const [filters, setFilters] = useState<SegmentFilter[]>([emptyFilter()]);
  const [error, setError] = useState<string | null>(null);

  function updateFilter(index: number, next: SegmentFilter) {
    setFilters((current) => current.map((item, i) => (i === index ? next : item)));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, rules: { op, filters } }),
    });
    if (!response.ok) {
      setError("Could not create segment");
      return;
    }
    router.push("/audience/segments");
    router.refresh();
  }

  return (
    <div>
      <PageHeader title="New segment" subtitle="Combine attribute and event filters with AND / OR." />
      <form onSubmit={onSubmit} className="max-w-2xl space-y-4 p-8">
        <Card className="space-y-4 p-5">
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Description">
            <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Match">
            <select className={inputClass} value={op} onChange={(e) => setOp(e.target.value as SegmentRules["op"])}>
              <option value="and">All filters (AND)</option>
              <option value="or">Any filter (OR)</option>
            </select>
          </Field>
        </Card>
        {filters.map((filter, index) => (
          <Card key={index} className="space-y-3 p-5">
            <Field label="Type">
              <select
                className={inputClass}
                value={filter.kind}
                onChange={(e) => {
                  const kind = e.target.value as SegmentFilter["kind"];
                  updateFilter(
                    index,
                    kind === "attribute"
                      ? { kind: "attribute", field: "plan", op: "eq", value: "" }
                      : { kind: "event", name: "purchase", op: "performed", days: 30 },
                  );
                }}
              >
                <option value="attribute">Attribute</option>
                <option value="event">Event</option>
              </select>
            </Field>
            {filter.kind === "attribute" ? (
              <div className="grid grid-cols-3 gap-3">
                <Field label="Field">
                  <input
                    className={inputClass}
                    value={filter.field}
                    onChange={(e) => updateFilter(index, { ...filter, field: e.target.value })}
                  />
                </Field>
                <Field label="Operator">
                  <select
                    className={inputClass}
                    value={filter.op}
                    onChange={(e) =>
                      updateFilter(index, { ...filter, op: e.target.value as typeof filter.op })
                    }
                  >
                    <option value="eq">equals</option>
                    <option value="neq">not equals</option>
                    <option value="contains">contains</option>
                    <option value="gt">greater than</option>
                    <option value="lt">less than</option>
                    <option value="exists">exists</option>
                  </select>
                </Field>
                <Field label="Value">
                  <input
                    className={inputClass}
                    value={String(filter.value ?? "")}
                    onChange={(e) => updateFilter(index, { ...filter, value: e.target.value })}
                  />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <Field label="Event name">
                  <input
                    className={inputClass}
                    list="event-names"
                    value={filter.name}
                    onChange={(e) => updateFilter(index, { ...filter, name: e.target.value })}
                  />
                  <datalist id="event-names">
                    <option value="added_to_cart" />
                    <option value="campaign_sent" />
                    <option value="purchase" />
                    <option value="app_open" />
                    <option value="signup" />
                  </datalist>
                </Field>
                <Field label="Operator">
                  <select
                    className={inputClass}
                    value={filter.op}
                    onChange={(e) =>
                      updateFilter(index, { ...filter, op: e.target.value as typeof filter.op })
                    }
                  >
                    <option value="performed">performed</option>
                    <option value="not_performed">not performed</option>
                  </select>
                </Field>
                <Field label="Lookback days">
                  <input
                    className={inputClass}
                    type="number"
                    value={filter.days ?? ""}
                    onChange={(e) =>
                      updateFilter(index, { ...filter, days: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </Field>
              </div>
            )}
          </Card>
        ))}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setFilters((current) => [...current, emptyFilter()])}>
            Add filter
          </Button>
          <Button type="submit">Save segment</Button>
        </div>
        {error ? <p className="text-sm text-error">{error}</p> : null}
      </form>
    </div>
  );
}
