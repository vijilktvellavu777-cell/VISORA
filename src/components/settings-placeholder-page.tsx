import { Card, PageHeader } from "@/components/ui";

export function SettingsPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-full bg-background">
      <PageHeader title={title} subtitle={description} />
      <div className="p-8">
        <Card className="p-6">
          <p className="text-sm text-muted">
            Configuration for this section is coming next. Share the fields and behavior you want here and
            we&apos;ll wire them up.
          </p>
        </Card>
      </div>
    </div>
  );
}
