import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function GET() {
  const workspace = await getDefaultWorkspace();
  const links = await prisma.linkTableEntry.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const urlInput = typeof body.url === "string" ? body.url.trim() : "";
  const url = normalizeUrl(urlInput);

  if (!name) {
    return NextResponse.json({ error: "Link name is required." }, { status: 400 });
  }
  if (!url) {
    return NextResponse.json({ error: "Link URL is required." }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Enter a valid link URL." }, { status: 400 });
  }

  const link = await prisma.linkTableEntry.create({
    data: {
      workspaceId: workspace.id,
      name,
      url,
      status: typeof body.status === "string" ? body.status : "draft",
    },
  });

  return NextResponse.json(link);
}
