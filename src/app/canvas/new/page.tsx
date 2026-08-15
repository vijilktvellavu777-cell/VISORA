"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Field, PageHeader, inputClass } from "@/components/ui";

type SegmentOption = { id: string; name: string };

export default function NewCanvasPage() {
  const router = useRouter();
  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/segments")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setSegments(data);
      })
      .catch(() => setError("Could not load segments"));
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/canvas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, segmentId }),
    });
    if (!response.ok) {
      setError("Could not create canvas");
      return;
    }
    const canvas = await response.json();
    router.push(`/canvas/${canvas.id}`);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Start a new canvas"
        subtitle="Build a multi-step journey and enroll users from a segment."
      />
      <form onSubmit={onSubmit} className="max-w-2xl space-y-4 p-8">
        <Card className="space-y-4 p-5">
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Description">
            <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Entry audience">
            <select className={inputClass} value={segmentId} onChange={(e) => setSegmentId(e.target.value)}>
              <option value="">All profiles</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </Field>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <div className="flex gap-2 pt-2">
            <Button type="submit">Create canvas</Button>
            <Button href="/canvas" variant="ghost">
              Cancel
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
