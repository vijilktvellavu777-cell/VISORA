"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Field, PageHeader, inputClass } from "@/components/ui";

type SegmentOption = { id: string; name: string };

export default function NewCampaignPage() {
  const router = useRouter();
  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState("email");
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
      setError("Could not create campaign");
      return;
    }
    const campaign = await response.json();
    router.push(`/campaigns/${campaign.id}`);
    router.refresh();
  }

  return (
    <div>
      <PageHeader title="New campaign" subtitle="Use {{ first_name }} and {{ custom.plan }} in copy." />
      <form onSubmit={onSubmit} className="max-w-2xl space-y-4 p-8">
        <Card className="space-y-4 p-5">
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Description">
            <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Channel">
              <select className={inputClass} value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="email">Email</option>
                <option value="push">Push</option>
                <option value="sms">SMS</option>
                <option value="in_app">In-app</option>
              </select>
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
          </div>
          {channel === "email" ? (
            <Field label="Subject">
              <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
          ) : null}
          <Field label="Body">
            <textarea
              className={`${inputClass} min-h-40 font-mono text-xs`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </Field>
        </Card>
        <Button type="submit">Create draft</Button>
        {error ? <p className="text-sm text-[#f5c14a]">{error}</p> : null}
      </form>
    </div>
  );
}
