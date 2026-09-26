import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { TargetingFilterGroup } from "@/lib/campaign-targeting";
import { customerMatchesSegmentGroups, listIdsInGroups } from "@/lib/segments";
import { getDefaultWorkspace, loadListMembers } from "@/lib/workspace";

function asGroups(value: unknown): TargetingFilterGroup[] {
  return Array.isArray(value) ? (value as TargetingFilterGroup[]) : [];
}

export async function POST(request: NextRequest) {
  const workspace = await getDefaultWorkspace();
  const body = await request.json();
  const payload = (body.rules ?? {}) as {
    filterGroups?: TargetingFilterGroup[];
    exclusionGroups?: TargetingFilterGroup[];
  };
  const filterGroups = asGroups(payload.filterGroups);
  const exclusionGroups = asGroups(payload.exclusionGroups);

  const customers = await prisma.customer.findMany({
    where: { workspaceId: workspace.id },
    include: { events: true },
  });

  const listMembers = await loadListMembers(listIdsInGroups([...filterGroups, ...exclusionGroups]));
  const count = customers.filter((customer) =>
    customerMatchesSegmentGroups(customer, filterGroups, exclusionGroups, listMembers),
  ).length;

  return NextResponse.json({ count, totalUsers: customers.length });
}
