import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { workspaceToGeneralSettings } from "@/lib/general-settings";
import { errorToResponse } from "@/lib/http";
import { getDefaultWorkspace } from "@/lib/workspace";

const bodySchema = z.object({
  paused: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const workspace = await getDefaultWorkspace();
    const { paused } = bodySchema.parse(await request.json());

    const updated = await prisma.workspace.update({
      where: { id: workspace.id },
      data: { pausedAt: paused ? new Date() : null },
    });

    return NextResponse.json(workspaceToGeneralSettings(updated));
  } catch (error) {
    return errorToResponse(error);
  }
}
