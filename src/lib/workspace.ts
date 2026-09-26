import { prisma } from "./db";
import { customerMatchesRules, listIdsInRules, parseRules } from "./segments";

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
