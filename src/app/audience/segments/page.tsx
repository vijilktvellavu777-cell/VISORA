import { prisma } from "@/lib/db";
import { getDefaultWorkspace, loadSegmentAudience } from "@/lib/workspace";
import { SegmentsPageClient } from "@/components/segments-page";

export const dynamic = "force-dynamic";

export default async function AudienceSegmentsPage() {
  const workspace = await getDefaultWorkspace();
  const segments = await prisma.segment.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
  });

  const withCounts = await Promise.all(
    segments.map(async (segment) => {
      const audience = await loadSegmentAudience(workspace.id, segment.rules);
      return {
        id: segment.id,
        name: segment.name,
        description: segment.description,
        updatedAt: segment.updatedAt.toISOString(),
        createdAt: segment.createdAt.toISOString(),
        count: audience.people.length,
      };
    }),
  );

  return <SegmentsPageClient segments={withCounts} />;
}
