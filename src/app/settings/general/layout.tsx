import { GeneralSettingsProvider } from "@/components/general-settings-provider";
import { workspaceToGeneralSettings } from "@/lib/general-settings";
import { getDefaultWorkspace } from "@/lib/workspace";

export default async function GeneralSettingsLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getDefaultWorkspace();
  const initial = workspaceToGeneralSettings(workspace);

  return <GeneralSettingsProvider initial={initial}>{children}</GeneralSettingsProvider>;
}
