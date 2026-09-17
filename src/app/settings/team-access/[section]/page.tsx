import { TeamAccessSettingsPage } from "@/components/team-access-settings-page";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

type PageProps = { params: Promise<{ section: string }> };

export default async function Page({ params }: PageProps) {
  const { section } = await params;
  const initial = await loadSettingsPageInitial("team-access");
  return <TeamAccessSettingsPage initial={initial} section={section} />;
}
