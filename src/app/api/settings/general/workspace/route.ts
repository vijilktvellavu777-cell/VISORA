import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorToResponse } from "@/lib/http";
import { getDefaultWorkspace } from "@/lib/workspace";

const bodySchema = z.object({
  confirmName: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  try {
    const workspace = await getDefaultWorkspace();
    const { confirmName } = bodySchema.parse(await request.json());

    if (confirmName.trim() !== workspace.name) {
      return NextResponse.json(
        { error: "Organization name does not match. Workspace was not deleted." },
        { status: 400 },
      );
    }

    await prisma.workspace.delete({ where: { id: workspace.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorToResponse(error);
  }
}
