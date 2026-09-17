import { TrackingDataSettingsPage } from "@/components/tracking-webhooks-settings-pages";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

export default async function SettingsTrackingDataPage() {
  const initial = await loadSettingsPageInitial("tracking-data");
  return <TrackingDataSettingsPage initial={initial} />;
}
