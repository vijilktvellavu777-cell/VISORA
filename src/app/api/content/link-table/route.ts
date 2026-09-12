import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidLinkTableType } from "@/lib/link-table";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getDefaultWorkspace();
  const tables = await prisma.linkTable.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(tables);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() || null : null;

  if (!name) {
    return NextResponse.json({ error: "Link table name is required." }, { status: 400 });
  }
  if (!isValidLinkTableType(type)) {
    return NextResponse.json({ error: "Choose a valid link table type." }, { status: 400 });
  }

  const table = await prisma.linkTable.create({
    data: {
      workspaceId: workspace.id,
      name,
      type,
      description,
      status: typeof body.status === "string" ? body.status : "active",
    },
  });

  return NextResponse.json(table);
}
