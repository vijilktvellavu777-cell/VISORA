import { Card, EmptyState, PageHeader } from "@/components/ui";

export default function DataBuildDesignsPage() {
  return (
    <div>
      <PageHeader
        title="Designs"
        subtitle="Saved chart layouts, dashboards, and report designs for your workspace."
      />
      <div className="p-8">
        <Card>
          <EmptyState
            title="No designs yet"
            body="Create and save report designs to reuse across Analytics and Data build."
          />
        </Card>
      </div>
    </div>
  );
}
