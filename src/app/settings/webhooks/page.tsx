import { WebhooksSettingsPage } from "@/components/tracking-webhooks-settings-pages";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

export default async function SettingsWebhooksPage() {
  const initial = await loadSettingsPageInitial("webhooks");
  return <WebhooksSettingsPage initial={initial} />;
}
