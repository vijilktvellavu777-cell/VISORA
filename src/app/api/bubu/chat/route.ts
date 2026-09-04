import { NextRequest, NextResponse } from "next/server";
import { getBubuWorkspaceContext } from "@/lib/bubu-context";
import { generateBubuReply, type BubuChatMessage } from "@/lib/bubu";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const message = String(body.message ?? "").trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (item: unknown): item is BubuChatMessage =>
            typeof item === "object" &&
            item !== null &&
            (item as BubuChatMessage).role !== undefined &&
            typeof (item as BubuChatMessage).content === "string",
        )
        .slice(-12)
    : [];

  const workspace = await getDefaultWorkspace();
  const context = await getBubuWorkspaceContext(workspace.id);
  const result = await generateBubuReply(message, history, context);

  return NextResponse.json(result);
}
