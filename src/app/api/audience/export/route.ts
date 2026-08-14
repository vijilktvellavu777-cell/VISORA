import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function GET() {
  const workspace = await getDefaultWorkspace();
  const customers = await prisma.customer.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "asc" },
  });
  const header = "external_id,email,first_name,last_name,country";
  const lines = customers.map((c) =>
    [c.externalId, c.email ?? "", c.firstName ?? "", c.lastName ?? "", c.country ?? ""]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );
  const csv = [header, ...lines].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=visora-users.csv",
    },
  });
}
