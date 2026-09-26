import { prisma } from "./db";
import {
  customerMatchesRules,
  customerMatchesSegmentGroups,
  includedListEntryIds,
  listIdsInGroups,
  listIdsInRules,
  parseRules,
  readSegmentGroups,
  segmentGroupsAreListOnly,
} from "./segments";

export async function getDefaultWorkspace() {
  const existing = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return prisma.workspace.create({
    data: { name: "VISORA", slug: "default" },
  });
}

export async function resolveSegmentMembers(workspaceId: string, segmentId: string | null | undefined) {
  const customers = await prisma.customer.findMany({
    where: { workspaceId },
    include: { events: true },
  });
  if (!segmentId) return customers;
  const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
  if (!segment) return [];
  const rules = parseRules(segment.rules);
  const listMembers = await loadListMembers(listIdsInRules(rules));
  return customers.filter((customer) => customerMatchesRules(customer, rules, listMembers));
}

export type SegmentAudiencePerson = {
  id: string;
  name: string;
  email: string | null;
  detail: string | null;
};

export async function loadSegmentAudience(workspaceId: string, rulesRaw: string) {
  const { filterGroups, exclusionGroups } = readSegmentGroups(rulesRaw);

  if (segmentGroupsAreListOnly(filterGroups, exclusionGroups)) {
    const listIds = listIdsInGroups([...filterGroups, ...exclusionGroups]);
    const entries = await prisma.listExtensionEntry.findMany({
      where: { extensionId: { in: listIds } },
      include: { extension: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    const entryIdsByList = new Map<string, string[]>();
    for (const entry of entries) {
      const ids = entryIdsByList.get(entry.extensionId) ?? [];
      ids.push(entry.id);
      entryIdsByList.set(entry.extensionId, ids);
    }
    const included = includedListEntryIds(filterGroups, exclusionGroups, entryIdsByList);
    const people: SegmentAudiencePerson[] = entries
      .filter((entry) => included.has(entry.id))
      .map((entry) => {
        const name = [entry.firstName, entry.lastName].filter(Boolean).join(" ");
        return {
          id: entry.id,
          name: name || entry.email || entry.externalId || "List record",
          email: entry.email,
          detail: entry.extension.name,
        };
      });
    return { filterGroups, exclusionGroups, people };
  }

  const customers = await prisma.customer.findMany({
    where: { workspaceId },
    include: { events: true },
    orderBy: { updatedAt: "desc" },
  });
  const listMembers = await loadListMembers(listIdsInGroups([...filterGroups, ...exclusionGroups]));
  const matched =
    filterGroups.some((group) => group.filters.length > 0) ||
    exclusionGroups.some((group) => group.filters.length > 0)
      ? customers.filter((customer) =>
          customerMatchesSegmentGroups(customer, filterGroups, exclusionGroups, listMembers),
        )
      : customers.filter((customer) => customerMatchesRules(customer, parseRules(rulesRaw), listMembers));

  return {
    filterGroups,
    exclusionGroups,
    people: matched.map((customer) => ({
      id: customer.id,
      name: customerDisplayName(customer),
      email: customer.email,
      detail: customer.externalId,
    })),
  };
}

export async function loadListMembers(listIds: string[]) {
  const members = new Map<string, Set<string>>();
  if (listIds.length === 0) return members;

  const entries = await prisma.listExtensionEntry.findMany({
    where: { extensionId: { in: listIds } },
    select: { extensionId: true, email: true, externalId: true },
  });

  for (const entry of entries) {
    const keys = members.get(entry.extensionId) ?? new Set<string>();
    if (entry.email) keys.add(entry.email.toLowerCase());
    if (entry.externalId) keys.add(entry.externalId.toLowerCase());
    members.set(entry.extensionId, keys);
  }

  return members;
}

export function customerDisplayName(customer: {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  externalId: string;
}) {
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
  return name || customer.email || customer.externalId;
}
