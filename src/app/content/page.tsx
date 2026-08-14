import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ContentStudio } from "@/components/content-studio";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const workspace = await getDefaultWorkspace();
  const templates = await prisma.contentTemplate.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });
  return <ContentStudio templates={JSON.parse(JSON.stringify(templates))} />;
}
