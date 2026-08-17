"use client";

import { Pencil } from "lucide-react";
import { Card } from "@/components/ui";
import type { CampaignTargeting, TargetingFilterGroup } from "@/lib/campaign-targeting";

type SegmentOption = { id: string; name: string };

type Props = {
  campaign: {
    name: string;
    description: string | null;
    fromAddress: string | null;
    subject: string | null;
    body: string;
  };
  targeting: CampaignTargeting;
  segments: SegmentOption[];
  selectedTemplateName: string | null;
  defaultFrom: string;
  onEditStep: (step: number) => void;
};

function SummarySection({
  title,
  step,
  onEditStep,
  children,
}: {
  title: string;
  step: number;
  onEditStep: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={() => onEditStep(step)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>
      <div className="space-y-4 px-6 py-5">{children}</div>
    </Card>
  );
}

function SummaryField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function FilterGroupSummary({ title, group }: { title: string; group: TargetingFilterGroup }) {
  if (group.filters.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</span>
        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary">
          {group.logic}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {group.filters.map((filter) => (
          <li key={filter.id} className="text-sm text-foreground">
            {filter.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CampaignReviewSummaryStep({
  campaign,
  targeting,
  segments,
  selectedTemplateName,
  defaultFrom,
  onEditStep,
}: Props) {
  const selectedSegments = segments.filter((segment) => targeting.segmentIds.includes(segment.id));
  const hasFilterGroups = targeting.filterGroups.some((group) => group.filters.length > 0);
  const hasExclusionGroups = targeting.exclusionGroups.some((group) => group.filters.length > 0);
  const hasBody = campaign.body.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Review summary</h2>
        <p className="mt-2 text-sm text-muted">
          Review your message and audience targeting before scheduling delivery.
        </p>
      </div>

      <SummarySection title="Message" step={1} onEditStep={onEditStep}>
        <dl className="space-y-4">
          <SummaryField label="Campaign name" value={campaign.name} />
          {campaign.description?.trim() ? (
            <SummaryField label="Description" value={campaign.description} />
          ) : null}
          <SummaryField label="From address" value={campaign.fromAddress || defaultFrom} />
          <SummaryField
            label="Subject line"
            value={campaign.subject?.trim() || "No subject yet"}
          />
          {selectedTemplateName ? (
            <SummaryField label="Template" value={selectedTemplateName} />
          ) : null}
        </dl>

        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Email content</div>
          {hasBody ? (
            <div className="mt-2 overflow-hidden rounded-lg border border-border bg-white">
              <iframe
                title="Email preview"
                srcDoc={campaign.body}
                className="h-64 w-full border-0 bg-white"
                sandbox=""
              />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">No email content added yet.</p>
          )}
        </div>
      </SummarySection>

      <SummarySection title="Target" step={2} onEditStep={onEditStep}>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Segments</div>
          {selectedSegments.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSegments.map((segment) => (
                <span
                  key={segment.id}
                  className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {segment.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">No segments selected.</p>
          )}
        </div>

        {hasFilterGroups ? (
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Filter groups</div>
            <div className="mt-2 space-y-3">
              {targeting.filterGroups.map((group, index) => (
                <FilterGroupSummary key={group.id} title={`Filter group ${index + 1}`} group={group} />
              ))}
            </div>
          </div>
        ) : null}

        {hasExclusionGroups ? (
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Exclusion groups</div>
            <div className="mt-2 space-y-3">
              {targeting.exclusionGroups.map((group, index) => (
                <FilterGroupSummary
                  key={group.id}
                  title={`Exclusion group ${index + 1}`}
                  group={group}
                />
              ))}
            </div>
          </div>
        ) : null}

        {!hasFilterGroups && !hasExclusionGroups && selectedSegments.length === 0 ? (
          <p className="text-sm text-muted">No audience targeting configured yet.</p>
        ) : null}
      </SummarySection>
    </div>
  );
}
