import Link from "next/link";
import { prisma } from "@/lib/db";
import { customerDisplayName, getDefaultWorkspace } from "@/lib/workspace";
import { Badge, Button, Card, EmptyState, PageHeader, inputClass } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function FindUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const workspace = await getDefaultWorkspace();
  const query = q.trim();
  const customers = await prisma.customer.findMany({
    where: {
      workspaceId: workspace.id,
      ...(query
        ? {
            OR: [
              { email: { contains: query } },
              { externalId: { contains: query } },
              { firstName: { contains: query } },
              { lastName: { contains: query } },
              { phone: { contains: query } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { events: true } } },
    orderBy: { lastSeenAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Find Users"
        subtitle="Search profiles by email, name, phone, or external ID."
      />
      <div className="space-y-4 p-8">
        <form className="flex gap-2">
          <input
            className={inputClass}
            name="q"
            defaultValue={q}
            placeholder="Search users…"
          />
          <Button type="submit">Search</Button>
        </form>
        <Card>
          {customers.length === 0 ? (
            <EmptyState
              title={query ? "No matching users" : "No profiles yet"}
              body={query ? "Try a different email or external ID." : "Identify a user or import a CSV to add profiles."}
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">Profile</th>
                  <th className="px-5 py-3 font-medium">External ID</th>
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
                      <div className="text-xs text-muted">{customer.email}</div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-accent">{customer.externalId}</td>
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
      </div>
    </div>
  );
}
