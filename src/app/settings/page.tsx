import { getPushConfig } from "@/lib/push-delivery";
import { Card, PageHeader } from "@/components/ui";

export default function SettingsPage() {
  const push = getPushConfig();

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage workspace preferences, team access, and platform configuration."
      />
      <div className="grid gap-4 p-8 md:grid-cols-2">
        <Card className="p-5 md:col-span-2">
          <div className="text-sm font-medium text-foreground">Push notifications</div>
          <p className="mt-1 text-sm text-muted">
            Configure provider credentials in your <code>.env</code> file. Without credentials, VISORA
            simulates delivery and logs sends for local development.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <span>Web Push (VAPID)</span>
              <span className={push.webPushEnabled ? "text-success" : "text-muted"}>
                {push.webPushEnabled ? "Configured" : "Not configured"}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <span>Firebase Cloud Messaging (Android)</span>
              <span className={push.fcmEnabled ? "text-success" : "text-muted"}>
                {push.fcmEnabled ? "Configured" : "Not configured"}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <span>Apple Push Notification service (iOS)</span>
              <span className={push.apnsEnabled ? "text-success" : "text-muted"}>
                {push.apnsEnabled ? "Configured" : "Not configured"}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <span>Simulation mode</span>
              <span className={push.simulationMode ? "text-muted" : "text-success"}>
                {push.simulationMode ? "On (no live providers)" : "Off"}
              </span>
            </li>
          </ul>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-background p-4 font-mono text-xs text-muted">{`# Web Push
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:you@example.com"

# Android
FCM_SERVER_KEY="..."

# Optional: force simulation even with credentials
# PUSH_SIMULATION_MODE="true"`}</pre>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-foreground">Workspace</div>
          <p className="mt-1 text-sm text-muted">Name, timezone, and default sender settings.</p>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-foreground">Team & access</div>
          <p className="mt-1 text-sm text-muted">Invite teammates and manage roles.</p>
        </Card>
      </div>
    </div>
  );
}
