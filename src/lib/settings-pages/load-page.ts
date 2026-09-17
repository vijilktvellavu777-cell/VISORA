import { getSettingsPagePayload, listWorkspaceApiKeySummaries } from "@/lib/settings-pages/store";
import type { SettingsPageKey } from "@/lib/settings-pages/types";
import { getDefaultWorkspace } from "@/lib/workspace";

const API_KEY_PAGES: SettingsPageKey[] = ["tracking-data", "developer-api", "security"];

export async function loadSettingsPageInitial(key: SettingsPageKey): Promise<Record<string, unknown>> {
  const workspace = await getDefaultWorkspace();
  const data = (await getSettingsPagePayload(workspace.id, key)) as Record<string, unknown>;

  if (API_KEY_PAGES.includes(key)) {
    return {
      ...data,
      apiKeys: await listWorkspaceApiKeySummaries(workspace.id),
    };
  }

  return data;
}
