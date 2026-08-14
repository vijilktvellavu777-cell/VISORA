import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/types";
import { customerDisplayName } from "@/lib/workspace";
import { Badge, Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      events: { orderBy: { occurredAt: "desc" }, take: 40 },
      sends: { include: { campaign: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!customer) notFound();

  const attributes = parseJson<Record<string, unknown>>(customer.attributes, {});
  const subscriptions = parseJson<Record<string, boolean>>(customer.subscriptions, {});

  return (
    <div>
      <PageHeader
        title={customerDisplayName(customer)}
        subtitle={`${customer.email ?? "No email"} · ${customer.externalId}`}
      />
      <div className="grid grid-cols-3 gap-4 p-8">
        <Card className="p-5">
          <div className="text-sm font-medium">Attributes</div>
          <dl className="mt-3 space-y-2 text-sm">
            {Object.entries(attributes).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4">
                <dt className="text-muted">{key}</dt>
                <dd className="font-mono text-xs">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium">Subscriptions</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(subscriptions).map(([channel, on]) => (
              <Badge key={channel} tone={on ? "ok" : "warn"}>
                {channel} {on ? "on" : "off"}
              </Badge>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted">
            Created {format(customer.createdAt, "MMM d, yyyy")}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium">Message history</div>
          <ul className="mt-3 space-y-2 text-sm">
            {customer.sends.length === 0 ? (
              <li className="text-muted">No sends yet</li>
            ) : (
              customer.sends.map((send) => (
                <li key={send.id} className="flex items-center justify-between">
                  <span>{send.campaign.name}</span>
                  <Badge tone="accent">{send.status}</Badge>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
      <div className="px-8 pb-8">
        <Card>
          <div className="border-b border-border px-5 py-3 text-sm font-medium">Event stream</div>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr className="border-b border-border">
                <th className="px-5 py-2 font-medium">Event</th>
                <th className="px-5 py-2 font-medium">Properties</th>
                <th className="px-5 py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {customer.events.map((event) => (
                <tr key={event.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-2 font-mono text-accent">{event.name}</td>
                  <td className="px-5 py-2 font-mono text-xs text-muted">{event.properties}</td>
                  <td className="px-5 py-2 text-muted">{format(event.occurredAt, "MMM d, HH:mm")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
