import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { TargetingFilterGroup } from "@/lib/campaign-targeting";
import {
  countListRuleGroups,
  customerMatchesSegmentGroups,
  listIdsInGroups,
  segmentGroupsAreListOnly,
} from "@/lib/segments";
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

  const listIds = listIdsInGroups([...filterGroups, ...exclusionGroups]);

  if (segmentGroupsAreListOnly(filterGroups, exclusionGroups)) {
    const entries = await prisma.listExtensionEntry.findMany({
      where: { extensionId: { in: listIds } },
      select: { id: true, extensionId: true },
    });
    const entryIdsByList = new Map<string, string[]>();
    for (const entry of entries) {
      const ids = entryIdsByList.get(entry.extensionId) ?? [];
      ids.push(entry.id);
      entryIdsByList.set(entry.extensionId, ids);
    }
    const count = countListRuleGroups(filterGroups, exclusionGroups, entryIdsByList);
    return NextResponse.json({ count, totalUsers: Math.max(customers.length, count) });
  }

  const listMembers = await loadListMembers(listIds);
  const count = customers.filter((customer) =>
    customerMatchesSegmentGroups(customer, filterGroups, exclusionGroups, listMembers),
  ).length;

  return NextResponse.json({ count, totalUsers: customers.length });
}
