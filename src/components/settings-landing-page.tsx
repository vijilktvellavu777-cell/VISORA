import { PageHeader } from "@/components/ui";

export function SettingsLandingPage() {
  return (
    <div className="min-h-full bg-background">
      <PageHeader
        title="Settings"
        subtitle="Choose a category in the menu to configure your workspace."
      />
      <div className="p-8">
        <p className="text-sm text-muted">
          Select General, Workspace, Channels, or another section on the left to get started. Sub-sections
          such as Organization or Branding appear after you open that category.
        </p>
      </div>
    </div>
  );
}
