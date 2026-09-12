import { EmptyState } from "@/components/ui";

export function LinkTablePage() {
  return (
    <div className="min-h-screen bg-surface px-8 py-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Link Table</h1>
        <p className="mt-2 text-sm text-muted">
          Create and manage tracked links with consistent aliases across email and other channels.
        </p>
      </div>

      <div className="mt-10">
        <EmptyState
          title="No links yet"
          body="Add links to your table to reuse short aliases and track clicks in campaigns."
        />
      </div>
    </div>
  );
}
