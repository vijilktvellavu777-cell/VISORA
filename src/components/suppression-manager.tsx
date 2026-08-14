"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, EmptyState, Field, PageHeader, inputClass } from "@/components/ui";

type Entry = { id: string; email: string | null; phone: string | null; externalId: string | null };
type List = {
  id: string;
  name: string;
  channel: string;
  entries: Entry[];
};

export function SuppressionManager({ lists }: { lists: List[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("all");
  const [activeId, setActiveId] = useState(lists[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [externalId, setExternalId] = useState("");
  const active = lists.find((list) => list.id === activeId) ?? lists[0];

  async function createList() {
    const response = await fetch("/api/audience/suppression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, channel }),
    });
    const list = await response.json();
    setName("");
    setActiveId(list.id);
    router.refresh();
  }

  async function addEntry() {
    if (!active) return;
    await fetch("/api/audience/suppression/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId: active.id, email, externalId }),
    });
    setEmail("");
    setExternalId("");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Suppression lists"
        subtitle="Users on these lists are excluded from messaging."
      />
      <div className="grid gap-4 p-8 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          <Card className="space-y-3 p-4">
            <Field label="List name">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Channel">
              <select className={inputClass} value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="all">All</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
            </Field>
            <Button onClick={createList}>Create list</Button>
          </Card>
          <Card>
            {lists.length === 0 ? (
              <EmptyState title="No lists" body="Create a suppression list to get started." />
            ) : (
              <ul className="divide-y divide-border">
                {lists.map((list) => (
                  <li key={list.id}>
                    <button
                      type="button"
                      className={`w-full px-4 py-3 text-left text-sm ${
                        active?.id === list.id ? "bg-primary/10 text-primary" : "hover:bg-background"
                      }`}
                      onClick={() => setActiveId(list.id)}
                    >
                      <div className="font-medium">{list.name}</div>
                      <div className="text-xs text-muted">{list.entries.length} entries</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <Card className="p-5">
          {!active ? (
            <EmptyState title="Select a list" body="Add emails or external IDs to suppress." />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{active.name}</h2>
                <Badge>{active.channel}</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input className={inputClass} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input
                  className={inputClass}
                  placeholder="External ID"
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                />
                <Button onClick={addEntry}>Add</Button>
              </div>
              {active.entries.length === 0 ? (
                <EmptyState title="No entries" body="Add an email or external ID to this list." />
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {active.entries.map((entry) => (
                    <li key={entry.id} className="flex justify-between py-3">
                      <span>{entry.email || entry.externalId || entry.phone}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
