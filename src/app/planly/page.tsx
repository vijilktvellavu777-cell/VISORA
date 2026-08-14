import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { PlanlyBoard } from "@/components/planly-board";

export const dynamic = "force-dynamic";

export default async function PlanlyPage() {
  const workspace = await getDefaultWorkspace();
  const projects = await prisma.planProject.findMany({
    where: { workspaceId: workspace.id },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return <PlanlyBoard projects={JSON.parse(JSON.stringify(projects))} />;
}
