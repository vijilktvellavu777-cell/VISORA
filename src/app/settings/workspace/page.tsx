import { WorkspaceSettingsPage } from "@/components/workspace-settings-page";
import { workspaceToWorkspaceSettings } from "@/lib/workspace-settings";
import { getDefaultWorkspace } from "@/lib/workspace";

export default async function SettingsWorkspacePage() {
  const workspace = await getDefaultWorkspace();
  const initial = workspaceToWorkspaceSettings(workspace);

  return <WorkspaceSettingsPage initial={initial} />;
}
