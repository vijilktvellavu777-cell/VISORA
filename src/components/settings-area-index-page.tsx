import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getSettingsArea } from "@/lib/settings-area-sections";

export function SettingsAreaIndexPage({ areaId }: { areaId: string }) {
  const area = getSettingsArea(areaId);
  if (!area) return null;

  return (
    <div className="min-h-full bg-background">
      <PageHeader
        title={area.title}
        subtitle={`Open ${area.title} in the sidebar, then choose a sub-section.`}
      />
      <div className="p-8">
        <p className="mb-4 text-sm text-muted">
          Expand <span className="font-medium text-foreground">{area.title}</span> in the panel beside this
          page, or pick a section below.
        </p>
        <ul className="flex flex-col gap-2">
          {area.sections.map((section) => (
            <li key={section.slug}>
              <Link
                href={`${area.basePath}/${section.slug}`}
                className="inline-flex rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/25 hover:bg-primary/[0.04]"
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
