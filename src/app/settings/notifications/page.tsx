import { NotificationsSettingsPage } from "@/components/notifications-security-billing-dev-pages";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

export default async function SettingsNotificationsPage() {
  const initial = await loadSettingsPageInitial("notifications");
  return <NotificationsSettingsPage initial={initial} />;
}
