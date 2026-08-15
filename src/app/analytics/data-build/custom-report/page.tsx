import { Card, EmptyState, PageHeader } from "@/components/ui";

export default function DataBuildCustomReportPage() {
  return (
    <div>
      <PageHeader
        title="Custom report"
        subtitle="Build bespoke reports with custom metrics, filters, and visualizations."
      />
      <div className="p-8">
        <Card>
          <EmptyState
            title="No custom reports yet"
            body="Configure dimensions, metrics, and chart types to create a custom report. Saved reports will appear here."
          />
        </Card>
      </div>
    </div>
  );
}
