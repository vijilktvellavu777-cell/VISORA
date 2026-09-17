import { SettingsAreaSectionLayout } from "@/components/settings-area-section-layout";
import { WorkspaceSettingsProvider } from "@/components/workspace-settings-provider";
import { workspaceToWorkspaceSettings } from "@/lib/workspace-settings";
import { getDefaultWorkspace } from "@/lib/workspace";

export default async function WorkspaceSettingsLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getDefaultWorkspace();
  const initial = workspaceToWorkspaceSettings(workspace);

  return (
    <SettingsAreaSectionLayout areaId="workspace">
      <WorkspaceSettingsProvider initial={initial}>{children}</WorkspaceSettingsProvider>
    </SettingsAreaSectionLayout>
  );
}
