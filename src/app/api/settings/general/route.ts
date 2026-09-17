import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  generalSettingsToWorkspaceData,
  workspaceToGeneralSettings,
} from "@/lib/general-settings";
import { errorToResponse } from "@/lib/http";
import { getDefaultWorkspace } from "@/lib/workspace";

const patchSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  website: z.string().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  organizationTimeZone: z.string().optional(),
  defaultLanguage: z.string().optional(),
  logoUrl: z.string().optional(),
  brandName: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  faviconUrl: z.string().optional(),
  defaultTimeZone: z.string().optional(),
  dateFormat: z.enum(DATE_FORMAT_OPTIONS).optional(),
  timeFormat: z.enum(TIME_FORMAT_OPTIONS).optional(),
  currency: z.string().optional(),
});

export async function GET() {
  const workspace = await getDefaultWorkspace();
  return NextResponse.json(workspaceToGeneralSettings(workspace));
}

export async function PATCH(request: NextRequest) {
  try {
    const workspace = await getDefaultWorkspace();
    const body = patchSchema.parse(await request.json());
    const data = generalSettingsToWorkspaceData({
      ...workspaceToGeneralSettings(workspace),
      ...body,
      paused: workspace.pausedAt != null,
    });

    const updated = await prisma.workspace.update({
      where: { id: workspace.id },
      data,
    });

    return NextResponse.json(workspaceToGeneralSettings(updated));
  } catch (error) {
    return errorToResponse(error);
  }
}
