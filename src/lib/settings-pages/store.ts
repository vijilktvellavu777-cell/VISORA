import { prisma } from "@/lib/db";
import { getDefaultSettingsPageData } from "@/lib/settings-pages/defaults";
import type { ApiKeySummary, SettingsPageKey } from "@/lib/settings-pages/types";

function parseSettingsPages(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw || "{}") as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return {};
}

export async function getSettingsPagePayload(workspaceId: string, key: SettingsPageKey) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  const store = parseSettingsPages(workspace?.settingsPages ?? "{}");
  const defaults = getDefaultSettingsPageData(key) as Record<string, unknown>;
  const saved = store[key];
  const merged =
    saved && typeof saved === "object" && !Array.isArray(saved)
      ? { ...defaults, ...(saved as Record<string, unknown>) }
      : defaults;

  return merged;
}

export async function saveSettingsPagePayload(
  workspaceId: string,
  key: SettingsPageKey,
  data: unknown,
) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  const store = parseSettingsPages(workspace?.settingsPages ?? "{}");
  store[key] = data;

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { settingsPages: JSON.stringify(store) },
  });

  return data;
}

export async function listWorkspaceApiKeySummaries(workspaceId: string): Promise<ApiKeySummary[]> {
  const keys = await prisma.apiKey.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
  });

  return keys.map((key) => ({
    id: key.id,
    name: key.name,
    keyPreview: `${key.key.slice(0, 8)}…${key.key.slice(-4)}`,
    kind: key.keyType,
  }));
}
