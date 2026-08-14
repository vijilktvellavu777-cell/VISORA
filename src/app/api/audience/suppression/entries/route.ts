import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const entry = await prisma.suppressionEntry.create({
    data: {
      listId: body.listId,
      email: body.email || null,
      phone: body.phone || null,
      externalId: body.externalId || null,
    },
  });
  return NextResponse.json(entry);
}
