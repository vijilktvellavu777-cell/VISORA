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

  const secretKey = keys.find((key) => key.keyType === "secret") ?? keys[0];
  const publishableKey = keys.find((key) => key.keyType === "publishable");

  return (
    <div>
      <PageHeader
        title="Developer"
        subtitle="Embed the VISORA SDK in your site or call REST endpoints from your backend."
      />
      <div className="space-y-4 p-8">
        <Card className="p-5">
          <div className="text-sm font-medium">API keys</div>
          <p className="mt-2 text-sm text-muted">
            Use a publishable key in browser SDK embeds. Keep secret keys on your server only.
          </p>
          <ul className="mt-3 space-y-2">
            {keys.map((key) => (
              <li key={key.id} className="rounded-lg border border-border bg-background px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <span>{key.name}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {key.keyType}
                  </span>
                </div>
                <code className="mt-1 block font-mono text-xs text-accent">{key.key}</code>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 text-sm">
          <div className="font-medium">Browser SDK</div>
          <p className="mt-2 text-muted">
            Add the script to your site, initialize with your publishable key, then identify users and track events.
            Anonymous sessions are merged automatically when a user signs in.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-4 font-mono text-xs text-muted">{`<!-- VISORA SDK -->
<script src="/visora.js"></script>
<script>
  Visora.init({
    apiKey: "${publishableKey?.key ?? "visora_pk_local"}",
    autoRegisterDevice: true,
  });

  // After login
  Visora.identify("user_001", {
    email: "user@example.com",
    first_name: "Alex",
    attributes: { plan: "pro" },
  });

  // Custom events
  Visora.track("product_viewed", { sku: "SKU-42", price: 49 });
</script>`}</pre>
          <div className="mt-4 text-xs text-muted">
            SDK methods: <code>init</code>, <code>identify</code>, <code>track</code>,{" "}
            <code>registerDevice</code>, <code>getAnonymousId</code>, <code>flush</code>
          </div>
        </Card>

        <Card className="p-5 text-sm">
          <div className="font-medium">Identify a user (REST)</div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-4 font-mono text-xs text-muted">{`curl -X POST http://localhost:3000/api/v1/users/identify \\
  -H "Authorization: Bearer ${secretKey?.key ?? "visora_sk_local"}" \\
  -H "Content-Type: application/json" \\
  -d '{"external_id":"user_001","email":"user@example.com","first_name":"Alex","attributes":{"plan":"pro"}}'`}</pre>
          <div className="mt-6 font-medium">Track events</div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-4 font-mono text-xs text-muted">{`curl -X POST http://localhost:3000/api/v1/users/track \\
  -H "Authorization: Bearer ${secretKey?.key ?? "visora_sk_local"}" \\
  -H "Content-Type: application/json" \\
  -d '{"external_id":"user_001","events":[{"name":"purchase","properties":{"amount":49}}]}'`}</pre>
          <div className="mt-6 font-medium">Register a device (push foundation)</div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-4 font-mono text-xs text-muted">{`curl -X POST http://localhost:3000/api/v1/devices/register \\
  -H "Authorization: Bearer ${publishableKey?.key ?? "visora_pk_local"}" \\
  -H "Content-Type: application/json" \\
  -d '{"external_id":"user_001","platform":"web","token":"web_device_abc123"}'`}</pre>
        </Card>
      </div>
    </div>
  );
}
