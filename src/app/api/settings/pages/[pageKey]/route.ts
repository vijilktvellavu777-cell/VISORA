import { NextRequest, NextResponse } from "next/server";
import { errorToResponse } from "@/lib/http";
import {
  getSettingsPagePayload,
  listWorkspaceApiKeySummaries,
  saveSettingsPagePayload,
} from "@/lib/settings-pages/store";
import { isSettingsPageKey } from "@/lib/settings-pages/types";
import { getDefaultWorkspace } from "@/lib/workspace";

type RouteParams = { params: Promise<{ pageKey: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { pageKey } = await params;
    if (!isSettingsPageKey(pageKey)) {
      return NextResponse.json({ error: "Unknown settings page" }, { status: 404 });
    }

    const workspace = await getDefaultWorkspace();
    const data = await getSettingsPagePayload(workspace.id, pageKey);

    if (pageKey === "tracking-data" || pageKey === "developer-api" || pageKey === "security") {
      const apiKeys = await listWorkspaceApiKeySummaries(workspace.id);
      return NextResponse.json({ ...data, apiKeys });
    }

    return NextResponse.json(data);
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { pageKey } = await params;
    if (!isSettingsPageKey(pageKey)) {
      return NextResponse.json({ error: "Unknown settings page" }, { status: 404 });
    }

    const workspace = await getDefaultWorkspace();
    const body = await request.json();
    const saved = await saveSettingsPagePayload(workspace.id, pageKey, body);

    if (pageKey === "tracking-data" || pageKey === "developer-api" || pageKey === "security") {
      const apiKeys = await listWorkspaceApiKeySummaries(workspace.id);
      return NextResponse.json({ ...(saved as object), apiKeys });
    }

    return NextResponse.json(saved);
  } catch (error) {
    return errorToResponse(error);
  }
}
