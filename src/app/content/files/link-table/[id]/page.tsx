import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { LinkTableDetailPageClient } from "@/components/link-table-detail-page";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LinkTableDetailPage({ params }: PageProps) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const table = await prisma.linkTable.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      links: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!table) {
    notFound();
  }

  return (
    <LinkTableDetailPageClient
      table={{
        id: table.id,
        name: table.name,
        type: table.type,
        description: table.description,
        status: table.status,
      }}
      links={table.links.map((link) => ({
        id: link.id,
        name: link.name,
        url: link.url,
        status: link.status,
        updatedAt: link.updatedAt.toISOString(),
      }))}
    />
  );
}
