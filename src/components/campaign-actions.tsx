"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { channelLabel } from "@/lib/messaging";

type Send = {
  id: string;
  status: string;
  sentAt: string | null;
  customer: { firstName: string | null; lastName: string | null; email: string | null; externalId: string };
};

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  channel: string;
  status: string;
  subject: string | null;
  body: string;
  segment: { name: string } | null;
  sends: Send[];
};

export function CampaignActions({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setMessage(null);
    const response = await fetch(`/api/campaigns/${campaign.id}/send`, { method: "POST" });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(json.error ?? "Send failed");
      return;
    }
    setMessage(json.alreadySent ? "Already sent" : `Sent to ${json.count} profiles`);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title={campaign.name}
        subtitle={campaign.description ?? channelLabel(campaign.channel)}
        action={
          <Button onClick={send}>
            {busy ? "Sending…" : campaign.status === "sent" ? "Already sent" : "Send now"}
          </Button>
        }
      />
      {message ? <p className="px-8 pt-4 text-sm text-success">{message}</p> : null}
      <div className="grid grid-cols-3 gap-4 p-8">
        <Card className="p-5">
          <div className="text-xs uppercase text-muted">Channel</div>
          <div className="mt-1">{channelLabel(campaign.channel)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase text-muted">Audience</div>
          <div className="mt-1">{campaign.segment?.name ?? "All profiles"}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase text-muted">Status</div>
          <div className="mt-1">
            <Badge tone={campaign.status === "sent" ? "ok" : "neutral"}>{campaign.status}</Badge>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4 px-8 pb-8">
        <Card className="p-5">
          <div className="text-sm font-medium">Message</div>
          {campaign.subject ? <div className="mt-2 text-sm text-muted">{campaign.subject}</div> : null}
          <pre className="mt-3 whitespace-pre-wrap font-mono text-xs text-muted">{campaign.body}</pre>
        </Card>
        <Card>
          <div className="border-b border-border px-5 py-3 text-sm font-medium">Delivery log</div>
          <ul className="divide-y divide-border text-sm">
            {campaign.sends.length === 0 ? (
              <li className="px-5 py-3 text-muted">No sends yet</li>
            ) : (
              campaign.sends.map((send) => (
                <li key={send.id} className="flex items-center justify-between px-5 py-3">
                  <span>
                    {[send.customer.firstName, send.customer.lastName].filter(Boolean).join(" ") ||
                      send.customer.email ||
                      send.customer.externalId}
                  </span>
                  <span className="text-xs text-muted">
                    {send.status}
                    {send.sentAt ? ` · ${format(new Date(send.sentAt), "MMM d HH:mm")}` : ""}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
