import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { customerMatchesRules, listIdsInRules, parseRules } from "@/lib/segments";
import { getDefaultWorkspace, loadListMembers } from "@/lib/workspace";

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  const rules = parseRules(JSON.stringify(body.rules ?? { op: "and", filters: [] }));

  const customers = await prisma.customer.findMany({
    where: { workspaceId: workspace.id },
    include: { events: true },
  });

  const listMembers = await loadListMembers(listIdsInRules(rules));
  const count = customers.filter((customer) => customerMatchesRules(customer, rules, listMembers)).length;
  const totalUsers = customers.length;

  return NextResponse.json({ count, totalUsers });
}
