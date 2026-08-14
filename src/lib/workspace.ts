import { prisma } from "./db";
import { customerMatchesRules, parseRules } from "./segments";

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
  return customers.filter((customer) => customerMatchesRules(customer, rules));
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
