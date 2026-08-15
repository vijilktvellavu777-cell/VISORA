import { Card, EmptyState, PageHeader } from "@/components/ui";

export default function ReportBuilderPage() {
  return (
    <div>
      <PageHeader
        title="Report builder"
        subtitle="Create custom reports from profiles, events, campaigns, and canvas data."
      />
      <div className="p-8">
        <Card>
          <EmptyState
            title="No reports yet"
            body="Build a report by choosing metrics, dimensions, and date ranges. Saved reports will appear here."
          />
        </Card>
      </div>
    </div>
  );
}
