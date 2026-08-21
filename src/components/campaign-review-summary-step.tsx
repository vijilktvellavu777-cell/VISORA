"use client";

import { Pencil } from "lucide-react";
import { Card } from "@/components/ui";
import type { InAppMessagePayload, PushMessagePayload } from "@/lib/campaign-message";
import { pushPlatformLabels } from "@/lib/campaign-message";
import type { CampaignTargeting, TargetingFilterGroup } from "@/lib/campaign-targeting";

type SegmentOption = { id: string; name: string };

type Props = {
  channel?: "email" | "push" | "in_app";
  campaign: {
    name: string;
    description: string | null;
    fromAddress?: string | null;
    subject: string | null;
    preheader?: string | null;
    body: string;
  };
  targeting: CampaignTargeting;
  segments: SegmentOption[];
  selectedTemplateName?: string | null;
  defaultFrom?: string;
  pushMessage?: PushMessagePayload;
  inAppMessage?: InAppMessagePayload;
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

function EmailMessageSummary({
  campaign,
  selectedTemplateName,
  defaultFrom,
}: {
  campaign: Props["campaign"];
  selectedTemplateName?: string | null;
  defaultFrom: string;
}) {
  const hasBody = campaign.body.trim().length > 0;

  return (
    <>
      <dl className="space-y-4">
        <SummaryField label="Campaign name" value={campaign.name} />
        {campaign.description?.trim() ? (
          <SummaryField label="Description" value={campaign.description} />
        ) : null}
        <SummaryField label="From address" value={campaign.fromAddress || defaultFrom} />
        <SummaryField label="Subject line" value={campaign.subject?.trim() || "No subject yet"} />
        <SummaryField
          label="Preheader"
          value={campaign.preheader?.trim() || "No preheader yet"}
        />
        {selectedTemplateName ? <SummaryField label="Template" value={selectedTemplateName} /> : null}
      </dl>

      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted">Email content</div>
        {hasBody ? (
          <div className="mx-auto mt-2 max-w-3xl overflow-hidden rounded-lg border border-border bg-white">
            <iframe
              title="Email preview"
              srcDoc={campaign.body}
              className="h-[480px] w-full border-0 bg-white"
              sandbox=""
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">No email content added yet.</p>
        )}
      </div>
    </>
  );
}

function PushMessageSummary({
  campaignName,
  pushMessage,
}: {
  campaignName: string;
  pushMessage: PushMessagePayload;
}) {
  return (
    <>
      <dl className="space-y-4">
        <SummaryField label="Campaign name" value={campaignName} />
        <SummaryField
          label="Notification title"
          value={pushMessage.title.trim() || "No title yet"}
        />
        <SummaryField
          label="Notification message"
          value={pushMessage.message.trim() || "No message yet"}
        />
        <SummaryField
          label="Push platform"
          value={
            pushMessage.platforms.length > 0
              ? pushPlatformLabels(pushMessage.platforms)
              : "No platforms selected"
          }
        />
      </dl>

      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted">Push preview</div>
        <div className="mt-2 max-w-md rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">VISORA</div>
          <div className="mt-2 text-sm font-semibold text-foreground">
            {pushMessage.title.trim() || "Notification title"}
          </div>
          <p className="mt-1 text-sm text-muted">
            {pushMessage.message.trim() || "Notification message preview"}
          </p>
        </div>
      </div>
    </>
  );
}

function InAppMessageSummary({
  campaignName,
  inAppMessage,
}: {
  campaignName: string;
  inAppMessage: InAppMessagePayload;
}) {
  return (
    <>
      <dl className="space-y-4">
        <SummaryField label="Campaign name" value={campaignName} />
        <SummaryField label="Message title" value={inAppMessage.title.trim() || "No title yet"} />
        <SummaryField label="Message body" value={inAppMessage.message.trim() || "No message yet"} />
        {inAppMessage.buttonText.trim() ? (
          <SummaryField label="Button text" value={inAppMessage.buttonText} />
        ) : null}
        {inAppMessage.buttonUrl.trim() ? (
          <SummaryField label="Button URL" value={inAppMessage.buttonUrl} />
        ) : null}
      </dl>

      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted">In-app preview</div>
        <div className="mt-2 max-w-md rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="text-sm font-semibold text-foreground">
            {inAppMessage.title.trim() || "Message title"}
          </div>
          <p className="mt-2 text-sm text-muted">
            {inAppMessage.message.trim() || "In-app message preview"}
          </p>
          {inAppMessage.buttonText.trim() ? (
            <button type="button" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
              {inAppMessage.buttonText}
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function CampaignReviewSummaryStep({
  channel = "email",
  campaign,
  targeting,
  segments,
  selectedTemplateName = null,
  defaultFrom = "VISORA <noreply@visora.app>",
  pushMessage,
  inAppMessage,
  onEditStep,
}: Props) {
  const selectedSegments = segments.filter((segment) => targeting.segmentIds.includes(segment.id));
  const hasFilterGroups = targeting.filterGroups.some((group) => group.filters.length > 0);
  const hasExclusionGroups = targeting.exclusionGroups.some((group) => group.filters.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Review summary</h2>
        <p className="mt-2 text-sm text-muted">
          Review your message and audience targeting before scheduling delivery.
        </p>
      </div>

      <SummarySection title="Message" step={1} onEditStep={onEditStep}>
        {channel === "push" && pushMessage ? (
          <PushMessageSummary campaignName={campaign.name} pushMessage={pushMessage} />
        ) : null}
        {channel === "in_app" && inAppMessage ? (
          <InAppMessageSummary campaignName={campaign.name} inAppMessage={inAppMessage} />
        ) : null}
        {channel === "email" ? (
          <EmailMessageSummary
            campaign={campaign}
            selectedTemplateName={selectedTemplateName}
            defaultFrom={defaultFrom}
          />
        ) : null}
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
