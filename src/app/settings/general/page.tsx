import { GeneralSettingsPage } from "@/components/general-settings-page";
import { workspaceToGeneralSettings } from "@/lib/general-settings";
import { getDefaultWorkspace } from "@/lib/workspace";

export default async function SettingsGeneralPage() {
  const workspace = await getDefaultWorkspace();
  const initial = workspaceToGeneralSettings(workspace);

  return <GeneralSettingsPage initial={initial} />;
}
