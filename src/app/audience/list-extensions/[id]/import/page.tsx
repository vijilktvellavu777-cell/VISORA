import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { ListExtensionImportPageClient } from "@/components/list-extension-import-page";
import { resolveExtensionAttributes } from "@/lib/list-extension-attributes";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function ListExtensionImportRoute({ params }: Params) {
  const { id } = await params;
  const workspace = await getDefaultWorkspace();

  const extension = await prisma.listExtension.findFirst({
    where: { id, workspaceId: workspace.id },
  });

  if (!extension) notFound();

  return (
    <ListExtensionImportPageClient
      attributes={resolveExtensionAttributes(extension.attributes, extension.type)}
    />
  );
}
