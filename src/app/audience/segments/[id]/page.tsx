import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { loadSegmentAudience } from "@/lib/workspace";
import { Badge, Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SegmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const segment = await prisma.segment.findUnique({ where: { id } });
  if (!segment) notFound();

  const audience = await loadSegmentAudience(segment.workspaceId, segment.rules);
  const groups = [
    ...audience.filterGroups.map((group, index) => ({
      title: `Filter group ${index + 1}`,
      logic: group.logic,
      filters: group.filters,
    })),
    ...audience.exclusionGroups.map((group, index) => ({
      title: `Exclusion group ${index + 1}`,
      logic: group.logic,
      filters: group.filters,
    })),
  ].filter((group) => group.filters.length > 0);

  return (
    <div>
      <PageHeader
        title={segment.name}
        subtitle={segment.description ?? "People who match this segment."}
        action={
          <Link
            href={`/audience/segments/${segment.id}/edit`}
            className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Edit
          </Link>
        }
      />
      <div className="space-y-4 p-8">
        <Card className="p-5">
          <div className="text-sm text-muted">Count</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
            {audience.people.length.toLocaleString()}
          </div>
        </Card>

        {groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map((group) => (
              <Card key={group.title} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-foreground">{group.title}</h2>
                  <Badge tone="accent">{group.logic}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.filters.map((filter) => (
                    <Badge key={filter.id}>{filter.label}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        <Card>
          <div className="border-b border-border px-5 py-3 text-sm font-medium">
            {audience.people.length.toLocaleString()} matching profiles
          </div>
          {audience.people.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">No matching profiles for these rules.</p>
          ) : (
            <ul className="divide-y divide-border">
              {audience.people.map((person) => (
                <li key={person.id} className="px-5 py-3 text-sm">
                  <div className="font-medium text-foreground">{person.name}</div>
                  <div className="text-muted">
                    {[person.email, person.detail].filter(Boolean).join(" · ") || "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
