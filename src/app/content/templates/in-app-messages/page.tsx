import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { InAppMessagesPageClient } from "@/components/in-app-messages-page";
import { parseJson } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InAppMessagesTemplatesPage() {
  const workspace = await getDefaultWorkspace();
  const messages = await prisma.contentTemplate.findMany({
    where: { workspaceId: workspace.id, kind: "in_app" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <InAppMessagesPageClient
      messages={messages.map((message) => ({
        id: message.id,
        name: message.name,
        title: message.title,
        status: message.status,
        tags: parseJson(message.tags, []),
        updatedAt: message.updatedAt.toISOString(),
      }))}
    />
  );
}
