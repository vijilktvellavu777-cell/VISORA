import { NextResponse } from "next/server";
import { sendCampaign } from "@/lib/campaigns";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const result = await sendCampaign(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send" },
      { status: 400 },
    );
  }
}
