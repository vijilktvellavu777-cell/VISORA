import Link from "next/link";
import { prisma } from "@/lib/db";
import { customerDisplayName, getDefaultWorkspace } from "@/lib/workspace";
import { Badge, Button, Card, EmptyState, PageHeader, inputClass } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

const RESULT_LIMIT = 2000;

type FindRecord = {
  key: string;
  href: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  externalId: string | null;
  source: string;
  addedAt: Date;
};

function entryName(entry: {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  externalId: string | null;
}) {
  const name = [entry.firstName, entry.lastName].filter(Boolean).join(" ");
  return name || entry.email || entry.externalId || "Untitled record";
}

export default async function FindUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const workspace = await getDefaultWorkspace();
  const query = q.trim();
  const textMatch = query
    ? {
        OR: [
          { email: { contains: query } },
          { externalId: { contains: query } },
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { phone: { contains: query } },
        ],
      }
    : {};

  const [customers, entries] = await Promise.all([
    prisma.customer.findMany({
      where: {
        workspaceId: workspace.id,
        ...textMatch,
      },
      orderBy: { createdAt: "desc" },
      take: RESULT_LIMIT,
    }),
    prisma.listExtensionEntry.findMany({
      where: {
        extension: { workspaceId: workspace.id },
        ...textMatch,
      },
      include: { extension: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: RESULT_LIMIT,
    }),
  ]);

  const records: FindRecord[] = [
    ...customers.map((customer) => ({
      key: `profile:${customer.id}`,
      href: `/audience/${customer.id}`,
      name: customerDisplayName(customer),
      email: customer.email,
      phone: customer.phone,
      externalId: customer.externalId,
      source: "Profile",
      addedAt: customer.createdAt,
    })),
    ...entries.map((entry) => ({
      key: `upload:${entry.id}`,
      href: `/audience/list-extensions/${entry.extension.id}`,
      name: entryName(entry),
      email: entry.email,
      phone: entry.phone,
      externalId: entry.externalId,
      source: entry.extension.name,
      addedAt: entry.createdAt,
    })),
  ].sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());

  const truncated = customers.length >= RESULT_LIMIT || entries.length >= RESULT_LIMIT;

  return (
    <div>
      <PageHeader
        title="Find Users"
        subtitle="Search uploaded list records and profiles by email, name, phone, or external ID."
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
          {records.length === 0 ? (
            <EmptyState
              title={query ? "No matching records" : "No records yet"}
              body={
                query
                  ? "Try a different email, name, phone, or external ID."
                  : "Import a list or identify a user to add records."
              }
            />
          ) : (
            <div>
              <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm text-muted">
                <span>
                  {records.length.toLocaleString()} record{records.length === 1 ? "" : "s"}
                  {truncated ? ` (showing the latest ${RESULT_LIMIT.toLocaleString()} per source)` : ""}
                </span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted">
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 font-medium">Record</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">External ID</th>
                    <th className="px-5 py-3 font-medium">Source</th>
                    <th className="px-5 py-3 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.key} className="border-b border-border last:border-0">
                      <td className="px-5 py-3">
                        {record.href ? (
                          <Link href={record.href} className="font-medium hover:text-accent">
                            {record.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{record.name}</span>
                        )}
                        <div className="text-xs text-muted">{record.email || "—"}</div>
                      </td>
                      <td className="px-5 py-3">{record.phone || "—"}</td>
                      <td className="px-5 py-3 font-mono text-xs text-accent">
                        {record.externalId || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={record.source === "Profile" ? "accent" : "neutral"}>
                          {record.source}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {formatDistanceToNow(record.addedAt, { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
