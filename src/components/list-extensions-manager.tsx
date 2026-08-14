"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, EmptyState, Field, PageHeader, inputClass } from "@/components/ui";

type Extension = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  status: string;
};

export function ListExtensionsManager({ items }: { items: Extension[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("email");
  const [description, setDescription] = useState("");

  async function create() {
    await fetch("/api/audience/list-extensions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, description }),
    });
    setName("");
    setDescription("");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="List Extensions"
        subtitle="Extend audience lists with extra membership rules for email, SMS, or custom sources."
      />
      <div className="grid gap-4 p-8 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <div className="text-sm font-medium">New extension</div>
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Type">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="custom">Custom</option>
            </select>
          </Field>
          <Field label="Description">
            <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Button onClick={create}>Create</Button>
        </Card>
        <Card>
          {items.length === 0 ? (
            <EmptyState title="No list extensions" body="Create an extension to attach extra list logic to your audience." />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted">{item.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{item.type}</Badge>
                    <Badge tone="ok">{item.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
