import { notFound } from "next/navigation";
import { SettingsOutlineSectionPage } from "@/components/settings-outline-section-page";
import { getSectionFieldOutline } from "@/lib/get-section-field-outline";
import { getSettingsAreaPageKey } from "@/lib/settings-area-page-keys";
import { loadSettingsPageInitial } from "@/lib/settings-pages/load-page";

export async function SettingsJsonSectionRoute({
  areaId,
  section,
}: {
  areaId: string;
  section: string;
}) {
  const pageKey = getSettingsAreaPageKey(areaId);
  if (!pageKey) notFound();

  const initial = await loadSettingsPageInitial(pageKey);
  const fields = getSectionFieldOutline(areaId, section);

  return (
    <SettingsOutlineSectionPage
      areaId={areaId}
      sectionSlug={section}
      pageKey={pageKey}
      initial={initial}
      fields={fields}
    />
  );
}
