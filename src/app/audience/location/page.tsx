import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LocationPage() {
  const workspace = await getDefaultWorkspace();
  const grouped = await prisma.customer.groupBy({
    by: ["country"],
    where: { workspaceId: workspace.id },
    _count: { _all: true },
    orderBy: { _count: { country: "desc" } },
  });

  const total = grouped.reduce((sum, row) => sum + row._count._all, 0);
  const unknown = grouped.find((row) => !row.country)?._count._all ?? 0;

  return (
    <div>
      <PageHeader
        title="Location"
        subtitle="Audience breakdown by country from profile data."
      />
      <div className="space-y-4 p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Total profiles</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{total}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Countries</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
              {grouped.filter((row) => row.country).length}
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Unknown location</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{unknown}</div>
          </Card>
        </div>

        <Card>
          {grouped.length === 0 ? (
            <EmptyState
              title="No location data"
              body="Set the country field on user profiles to see geographic distribution."
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">Country</th>
                  <th className="px-5 py-3 font-medium">Contacts</th>
                  <th className="px-5 py-3 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((row) => {
                  const label = row.country?.trim() || "Unknown";
                  const count = row._count._all;
                  const share = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
                  return (
                    <tr key={label} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium">{label}</td>
                      <td className="px-5 py-3 tabular-nums">{count}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 max-w-[200px] rounded-full bg-background">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${Math.min(100, share)}%` }}
                            />
                          </div>
                          <span className="tabular-nums text-muted">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
        <p className="text-xs text-muted">
          Need individual profiles? Open the{" "}
          <Link href="/audience/contact-list" className="text-primary hover:underline">
            Contact list
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
