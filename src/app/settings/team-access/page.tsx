import { TeamAccessSettingsPage } from "@/components/team-access-settings-page";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

export default async function SettingsTeamAccessPage() {
  const initial = await loadSettingsPageInitial("team-access");
  return <TeamAccessSettingsPage initial={initial} />;
}
