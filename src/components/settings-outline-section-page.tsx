"use client";

import { Card, Field, PageHeader, inputClass } from "@/components/ui";
import { SettingsPageShell } from "@/components/settings-page-shell";
import type { SettingsPageKey } from "@/lib/settings-pages/types";
import { getSettingsAreaSectionLabel } from "@/lib/settings-area-sections";

export function SettingsOutlineSectionPage({
  areaId,
  sectionSlug,
  pageKey,
  initial,
  fields,
}: {
  areaId: string;
  sectionSlug: string;
  pageKey: SettingsPageKey;
  initial: Record<string, unknown>;
  fields: string[];
}) {
  const title = getSettingsAreaSectionLabel(areaId, sectionSlug);

  return (
    <SettingsPageShell pageKey={pageKey} title={title} subtitle="Configure this section." initial={initial}>
      {(form, setForm) => (
        <Card className="space-y-4 p-6">
          {fields.map((label) => {
            const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
            const sectionStore = (form.sections as Record<string, Record<string, string>> | undefined) ?? {};
            const value = sectionStore[sectionSlug]?.[key] ?? "";
            return (
              <Field key={key} label={label}>
                <input
                  className={inputClass}
                  value={value}
                  onChange={(event) => {
                    setForm((prev) => {
                      const sections = { ...((prev.sections as object) ?? {}) } as Record<
                        string,
                        Record<string, string>
                      >;
                      sections[sectionSlug] = { ...(sections[sectionSlug] ?? {}), [key]: event.target.value };
                      return { ...prev, sections };
                    });
                  }}
                />
              </Field>
            );
          })}
        </Card>
      )}
    </SettingsPageShell>
  );
}

export function SettingsOutlineSectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <PageHeader title={title} subtitle={subtitle} />;
}
