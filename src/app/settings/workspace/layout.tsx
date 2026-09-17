import { WorkspaceSettingsProvider } from "@/components/workspace-settings-provider";
import { workspaceToWorkspaceSettings } from "@/lib/workspace-settings";
import { getDefaultWorkspace } from "@/lib/workspace";

export default async function WorkspaceSettingsLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getDefaultWorkspace();
  const initial = workspaceToWorkspaceSettings(workspace);

  return <WorkspaceSettingsProvider initial={initial}>{children}</WorkspaceSettingsProvider>;
}
