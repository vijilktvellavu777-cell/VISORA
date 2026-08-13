import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";
import { Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DeveloperPage() {
  const workspace = await getDefaultWorkspace();
  const keys = await prisma.apiKey.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Developer"
        subtitle="REST endpoints for identify and track. Send Authorization: Bearer <key>."
      />
      <div className="space-y-4 p-8">
        <Card className="p-5">
          <div className="text-sm font-medium">API keys</div>
          <ul className="mt-3 space-y-2">
            {keys.map((key) => (
              <li key={key.id} className="rounded-lg border border-[#262c3a] bg-[#0b0d12] px-4 py-3">
                <div className="text-sm">{key.name}</div>
                <code className="mt-1 block font-mono text-xs text-[#b7afff]">{key.key}</code>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 text-sm">
          <div className="font-medium">Identify a user</div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-[#0b0d12] p-4 font-mono text-xs text-[#c5cbd8]">{`curl -X POST http://localhost:3000/api/v1/users/identify \\
  -H "Authorization: Bearer visora_demo_sk_live_replace_me" \\
  -H "Content-Type: application/json" \\
  -d '{"external_id":"usr_maya","email":"maya@northwind.example","first_name":"Maya","attributes":{"plan":"pro"}}'`}</pre>
          <div className="mt-6 font-medium">Track events</div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-[#0b0d12] p-4 font-mono text-xs text-[#c5cbd8]">{`curl -X POST http://localhost:3000/api/v1/users/track \\
  -H "Authorization: Bearer visora_demo_sk_live_replace_me" \\
  -H "Content-Type: application/json" \\
  -d '{"external_id":"usr_maya","events":[{"name":"purchase","properties":{"amount":49}}]}'`}</pre>
        </Card>
      </div>
    </div>
  );
}
