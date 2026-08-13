import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { parseRules } from "@/lib/segments";
import { customerDisplayName, resolveSegmentMembers } from "@/lib/workspace";
import { Badge, Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SegmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const segment = await prisma.segment.findUnique({ where: { id } });
  if (!segment) notFound();
  const members = await resolveSegmentMembers(segment.workspaceId, segment.id);
  const rules = parseRules(segment.rules);

  return (
    <div>
      <PageHeader title={segment.name} subtitle={segment.description ?? "Live membership"} />
      <div className="space-y-4 p-8">
        <div className="flex flex-wrap gap-2">
          <Badge>{rules.op}</Badge>
          {rules.filters.map((filter, index) => (
            <Badge key={index} tone="accent">
              {filter.kind === "attribute"
                ? `${filter.field} ${filter.op} ${filter.value ?? ""}`
                : `${filter.name} ${filter.op}`}
            </Badge>
          ))}
        </div>
        <Card>
          <div className="border-b border-[#262c3a] px-5 py-3 text-sm font-medium">
            {members.length} matching profiles
          </div>
          <ul className="divide-y divide-[#262c3a]">
            {members.map((customer) => (
              <li key={customer.id} className="px-5 py-3 text-sm">
                <Link href={`/audience/${customer.id}`} className="hover:text-[#8b7dff]">
                  {customerDisplayName(customer)}
                </Link>
                <span className="ml-2 text-[#8b95a8]">{customer.email}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
