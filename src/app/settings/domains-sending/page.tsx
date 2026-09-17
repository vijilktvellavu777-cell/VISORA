import { DomainsSendingSettingsPage } from "@/components/domains-audience-settings-pages";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

export default async function SettingsDomainsSendingPage() {
  const initial = await loadSettingsPageInitial("domains-sending");
  return <DomainsSendingSettingsPage initial={initial} />;
}
