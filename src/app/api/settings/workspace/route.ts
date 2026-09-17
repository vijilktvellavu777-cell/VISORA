import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorToResponse } from "@/lib/http";
import { getDefaultWorkspace } from "@/lib/workspace";
import {
  workspaceSettingsToWorkspaceData,
  workspaceToWorkspaceSettings,
} from "@/lib/workspace-settings";

const environmentSchema = z.object({
  enabled: z.boolean(),
  active: z.boolean(),
});

const workspaceTypeValues = ["standard", "enterprise", "sandbox", "partner"] as const;
const dataRegionValues = ["US", "EU", "India"] as const;

const patchSchema = z.object({
  workspaceName: z.string().min(1, "Workspace name is required"),
  workspaceType: z.enum(workspaceTypeValues),
  environments: z.object({
    development: environmentSchema,
    staging: environmentSchema,
    production: environmentSchema,
  }),
    dataRegion: z.enum(dataRegionValues),
  dataRetentionDays: z.number().int().min(30).optional(),
  defaultDataPolicy: z.string().optional(),
});

export async function GET() {
  const workspace = await getDefaultWorkspace();
  return NextResponse.json(workspaceToWorkspaceSettings(workspace));
}

export async function PATCH(request: NextRequest) {
  try {
    const workspace = await getDefaultWorkspace();
    const body = patchSchema.parse(await request.json());

    const activeCount = (
      ["development", "staging", "production"] as const
    ).filter((key) => body.environments[key].active).length;

    if (activeCount !== 1) {
      return NextResponse.json({ error: "Select exactly one active environment." }, { status: 400 });
    }

    const activeKey = (["development", "staging", "production"] as const).find(
      (key) => body.environments[key].active,
    )!;

    if (!body.environments[activeKey].enabled) {
      return NextResponse.json(
        { error: "The active environment must be enabled." },
        { status: 400 },
      );
    }

    const data = workspaceSettingsToWorkspaceData({
      ...workspaceToWorkspaceSettings(workspace),
      ...body,
      workspaceId: workspace.id,
    });

    const updated = await prisma.workspace.update({
      where: { id: workspace.id },
      data,
    });

    return NextResponse.json(workspaceToWorkspaceSettings(updated));
  } catch (error) {
    return errorToResponse(error);
  }
}
