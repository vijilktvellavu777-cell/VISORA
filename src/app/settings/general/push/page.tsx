import { getPushConfig } from "@/lib/push-delivery";
import { PageHeader } from "@/components/ui";
import { PushSettingsPanel } from "@/components/push-settings-panel";

export default function SettingsPushPage() {
  const push = getPushConfig();

  return (
    <div className="min-h-full bg-background">
      <PageHeader
        title="Push settings"
        subtitle="Web, iOS, and Android push provider configuration."
      />
      <div className="p-8">
        <PushSettingsPanel push={push} />
      </div>
    </div>
  );
}
