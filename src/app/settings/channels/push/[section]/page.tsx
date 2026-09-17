import { SettingsJsonSectionRoute } from "@/components/settings-json-section-route";
import { PageHeader } from "@/components/ui";
import { PushSettingsPanel } from "@/components/push-settings-panel";
import { getSettingsAreaSectionLabel } from "@/lib/settings-area-sections";
import { getPushConfig } from "@/lib/push-delivery";

type PageProps = { params: Promise<{ section: string }> };

export default async function Page({ params }: PageProps) {
  const { section } = await params;

  if (section === "providers") {
    const push = getPushConfig();
    return (
      <div className="min-h-full bg-background">
        <PageHeader
          title={getSettingsAreaSectionLabel("channels-push", section)}
          subtitle="Firebase FCM and Apple APNs configuration."
        />
        <div className="p-8">
          <PushSettingsPanel push={push} />
        </div>
      </div>
    );
  }

  return <SettingsJsonSectionRoute areaId="channels-push" section={section} />;
}
