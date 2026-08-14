import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const task = await prisma.planTask.create({
    data: {
      projectId: body.projectId,
      title: body.title,
      status: body.status ?? "todo",
    },
  });
  return NextResponse.json(task);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const task = await prisma.planTask.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  return NextResponse.json(task);
}
