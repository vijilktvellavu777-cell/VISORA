import Link from "next/link";
import { prisma } from "@/lib/db";
import { customerDisplayName, getDefaultWorkspace } from "@/lib/workspace";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AudiencePage() {
  const workspace = await getDefaultWorkspace();
  const customers = await prisma.customer.findMany({
    where: { workspaceId: workspace.id },
    include: { _count: { select: { events: true } } },
    orderBy: { lastSeenAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Audience"
        subtitle="Identified profiles. Use the REST identify/track APIs to add more."
      />
      <div className="p-8">
        <Card>
          {customers.length === 0 ? (
            <EmptyState
              title="No profiles yet"
              body="Identify a user through the REST API to add the first profile."
            />
          ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-[#8b95a8]">
              <tr className="border-b border-[#262c3a]">
                <th className="px-5 py-3 font-medium">Profile</th>
                <th className="px-5 py-3 font-medium">External ID</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 font-medium">Events</th>
                <th className="px-5 py-3 font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-[#262c3a] last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/audience/${customer.id}`} className="font-medium hover:text-[#8b7dff]">
                      {customerDisplayName(customer)}
                    </Link>
                    <div className="text-xs text-[#8b95a8]">{customer.email}</div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-[#b7afff]">{customer.externalId}</td>
                  <td className="px-5 py-3">{customer.country ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge>{customer._count.events}</Badge>
                  </td>
                  <td className="px-5 py-3 text-[#8b95a8]">
                    {customer.lastSeenAt
                      ? formatDistanceToNow(customer.lastSeenAt, { addSuffix: true })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </Card>
      </div>
    </div>
  );
}
