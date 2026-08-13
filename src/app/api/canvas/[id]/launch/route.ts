import { NextResponse } from "next/server";
import { enrollCanvas } from "@/lib/campaigns";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const result = await enrollCanvas(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to launch" },
      { status: 400 },
    );
  }
}
