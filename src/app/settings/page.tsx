import { Card, EmptyState, PageHeader } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage workspace preferences, team access, and platform configuration."
      />
      <div className="grid gap-4 p-8 md:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm font-medium text-foreground">Workspace</div>
          <p className="mt-1 text-sm text-muted">Name, timezone, and default sender settings.</p>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-foreground">Team & access</div>
          <p className="mt-1 text-sm text-muted">Invite teammates and manage roles.</p>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-foreground">API & integrations</div>
          <p className="mt-1 text-sm text-muted">API keys, webhooks, and connected apps.</p>
        </Card>
        <Card className="p-5">
          <EmptyState
            title="More settings coming soon"
            body="Additional workspace controls will appear here."
          />
        </Card>
      </div>
    </div>
  );
}
