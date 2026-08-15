import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/types";
import { getDefaultWorkspace } from "@/lib/workspace";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

function purchaseAmount(properties: string) {
  const payload = parseJson<Record<string, unknown>>(properties, {});
  const amount = payload.amount ?? payload.revenue ?? payload.value;
  const n = Number(amount);
  return Number.isFinite(n) ? n : 0;
}

export default async function RevenueReportPage() {
  const workspace = await getDefaultWorkspace();
  const events = await prisma.event.findMany({
    where: {
      workspaceId: workspace.id,
      name: { in: ["purchase", "order_completed", "revenue"] },
    },
    select: { name: true, properties: true },
  });

  const totalRevenue = events.reduce((sum, event) => sum + purchaseAmount(event.properties), 0);
  const orderCount = events.length;

  return (
    <div>
      <PageHeader
        title="Revenue report"
        subtitle="Revenue from purchase and order events tracked in your workspace."
      />
      <div className="p-8">
        {orderCount === 0 ? (
          <Card>
            <EmptyState
              title="No revenue data yet"
              body="Track purchase or order_completed events with an amount property to populate revenue reporting."
            />
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-5">
              <div className="text-xs uppercase tracking-wide text-muted">Total revenue</div>
              <div className="mt-2 text-3xl font-semibold text-foreground">${totalRevenue.toLocaleString()}</div>
            </Card>
            <Card className="p-5">
              <div className="text-xs uppercase tracking-wide text-muted">Revenue events</div>
              <div className="mt-2 text-3xl font-semibold text-foreground">{orderCount}</div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
