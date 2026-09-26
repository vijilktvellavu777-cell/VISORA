import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { CreateSegmentPage } from "@/components/create-segment-page";

export const dynamic = "force-dynamic";

export default async function EditSegmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();
  const segment = await prisma.segment.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!segment) notFound();

  return (
    <CreateSegmentPage
      segmentId={segment.id}
      initial={{
        name: segment.name,
        description: segment.description,
        rules: segment.rules,
      }}
    />
  );
}
