"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Field, PageHeader, inputClass } from "@/components/ui";
import { channelLabel } from "@/lib/messaging";

type SegmentOption = { id: string; name: string };

const TYPES = ["email", "push", "in_app", "content_card"] as const;

export default function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") ?? "email";
  const channel = TYPES.includes(initialType as (typeof TYPES)[number]) ? initialType : "email";

  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("Hi {{ first_name }},\n\n");
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
    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, channel, segmentId, subject, body }),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(typeof json.error === "string" ? json.error : "Could not create campaign");
      return;
    }
    const campaign = await response.json();
    router.push(`/campaigns/${campaign.id}`);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title={`Create ${channelLabel(channel)} campaign`}
        subtitle="Configure your campaign and save as a draft."
      />
      <form onSubmit={onSubmit} className="max-w-2xl space-y-4 p-8">
        <Card className="space-y-4 p-5">
          <Field label="Name">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              required
            />
          </Field>
          <Field label="Description">
            <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Segment">
            <select className={inputClass} value={segmentId} onChange={(e) => setSegmentId(e.target.value)}>
              <option value="">All profiles</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </Field>
          {channel === "email" ? (
            <Field label="Subject">
              <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
          ) : null}
          <Field label={channel === "content_card" ? "Card body" : "Message body"}>
            <textarea
              className={`${inputClass} min-h-40 font-mono text-xs`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </Field>
        </Card>
        <Button type="submit">Save draft</Button>
        {error ? <p className="text-sm text-error">{error}</p> : null}
      </form>
    </div>
  );
}
