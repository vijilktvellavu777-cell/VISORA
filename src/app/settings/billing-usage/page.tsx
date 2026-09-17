import { BillingUsageSettingsPage } from "@/components/notifications-security-billing-dev-pages";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

export default async function SettingsBillingUsagePage() {
  const initial = await loadSettingsPageInitial("billing-usage");
  return <BillingUsageSettingsPage initial={initial} />;
}
