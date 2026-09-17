import { AudienceConsentSettingsPage } from "@/components/domains-audience-settings-pages";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

export default async function SettingsAudienceConsentPage() {
  const initial = await loadSettingsPageInitial("audience-consent");
  return <AudienceConsentSettingsPage initial={initial} />;
}
