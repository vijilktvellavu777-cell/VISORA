import { NextResponse } from "next/server";
import { prisma } from "./db";

export type ApiKeyAuth = {
  apiKey: {
    id: string;
    key: string;
    keyType: string;
    workspaceId: string;
    workspace: { id: string; name: string; slug: string };
  };
};

export async function requireApiKey(
  request: Request,
  options?: { allowPublishable?: boolean },
) {
  const header = request.headers.get("authorization") ?? request.headers.get("x-visora-api-key") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (!token) {
    return { error: NextResponse.json({ error: "Missing API key" }, { status: 401 }) };
  }
  const apiKey = await prisma.apiKey.findUnique({
    where: { key: token },
    include: { workspace: true },
  });
  if (!apiKey) {
    return { error: NextResponse.json({ error: "Invalid API key" }, { status: 401 }) };
  }
  if (apiKey.keyType === "publishable" && !options?.allowPublishable) {
    return { error: NextResponse.json({ error: "Publishable key not allowed for this endpoint" }, { status: 403 }) };
  }
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });
  return { apiKey } satisfies ApiKeyAuth;
}
