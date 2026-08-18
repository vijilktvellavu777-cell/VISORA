import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ListExtensionDetailPage } from "@/components/list-extension-detail-page";
import { resolveExtensionAttributes } from "@/lib/list-extension-attributes";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function ListExtensionDetailRoute({ params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const extension = await prisma.listExtension.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      entries: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!extension) notFound();

  return (
    <ListExtensionDetailPage
      extension={{
        id: extension.id,
        name: extension.name,
        description: extension.description,
        type: extension.type,
        status: extension.status,
        attributes: resolveExtensionAttributes(extension.attributes, extension.type),
        entries: extension.entries.map((entry) => ({
          id: entry.id,
          externalId: entry.externalId,
          email: entry.email,
          phone: entry.phone,
          firstName: entry.firstName,
          lastName: entry.lastName,
          attributes: entry.attributes,
          createdAt: entry.createdAt.toISOString(),
        })),
      }}
    />
  );
}
