import Link from "next/link";
import { prisma } from "@/lib/db";
import { customerDisplayName, getDefaultWorkspace } from "@/lib/workspace";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ContactListPage() {
  const workspace = await getDefaultWorkspace();
  const customers = await prisma.customer.findMany({
    where: { workspaceId: workspace.id },
    include: { _count: { select: { events: true } } },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  return (
    <div>
      <PageHeader
        title="Contact list"
        subtitle="All user profiles in this workspace. Open a profile for full details."
      />
      <div className="p-8">
        <Card>
          {customers.length === 0 ? (
            <EmptyState
              title="No contacts yet"
              body="Import users or identify profiles via the SDK to populate your contact list."
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Country</th>
                  <th className="px-5 py-3 font-medium">Events</th>
                  <th className="px-5 py-3 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/audience/${customer.id}`} className="font-medium hover:text-accent">
                        {customerDisplayName(customer)}
                      </Link>
                      <div className="font-mono text-xs text-muted">{customer.externalId}</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{customer.email ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">{customer.phone ?? "—"}</td>
                    <td className="px-5 py-3">{customer.country ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge>{customer._count.events}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted">
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
        {customers.length >= 500 ? (
          <p className="mt-3 text-xs text-muted">Showing the 500 most recently updated contacts.</p>
        ) : null}
      </div>
    </div>
  );
}
