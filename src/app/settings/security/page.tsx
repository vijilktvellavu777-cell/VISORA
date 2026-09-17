import { SecuritySettingsPage } from "@/components/notifications-security-billing-dev-pages";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

export default async function SettingsSecurityPage() {
  const initial = await loadSettingsPageInitial("security");
  return <SecuritySettingsPage initial={initial} />;
}
