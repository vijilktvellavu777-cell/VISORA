import { DeveloperApiSettingsPage } from "@/components/notifications-security-billing-dev-pages";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

export default async function SettingsDeveloperApiPage() {
  const initial = await loadSettingsPageInitial("developer-api");
  return <DeveloperApiSettingsPage initial={initial} />;
}
