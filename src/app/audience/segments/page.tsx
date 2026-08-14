import Link from "next/link";
import { prisma } from "@/lib/db";
import { parseRules } from "@/lib/segments";
import { getDefaultWorkspace, resolveSegmentMembers } from "@/lib/workspace";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { SegmentPresets } from "@/components/segment-presets";

export const dynamic = "force-dynamic";

export default async function AudienceSegmentsPage() {
  const workspace = await getDefaultWorkspace();
  const segments = await prisma.segment.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  const withCounts = await Promise.all(
    segments.map(async (segment) => {
      const members = await resolveSegmentMembers(workspace.id, segment.id);
      return { ...segment, count: members.length, rules: parseRules(segment.rules) };
    }),
  );

  return (
    <div>
      <PageHeader
        title="Segments"
        subtitle="Live audiences such as added to cart, purchased, or campaign sent."
        action={<Button href="/audience/segments/new">New segment</Button>}
      />
      <div className="space-y-4 p-8">
        <SegmentPresets />
        <div className="grid gap-3">
          {withCounts.length === 0 ? (
            <Card>
              <EmptyState
                title="No segments yet"
                body="Create a custom segment or use a preset like Added to cart."
              />
            </Card>
          ) : (
            withCounts.map((segment) => (
              <Card key={segment.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/audience/segments/${segment.id}`} className="text-base font-medium hover:text-accent">
                      {segment.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted">{segment.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {segment.rules.filters.map((filter, index) => (
                        <Badge key={index} tone="accent">
                          {filter.kind === "attribute"
                            ? `${filter.field} ${filter.op} ${filter.value ?? ""}`
                            : `${filter.name} ${filter.op}${filter.days ? ` ${filter.days}d` : ""}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold">{segment.count}</div>
                    <div className="text-xs text-muted">profiles</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
