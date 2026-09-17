import { SETTINGS_SECTION_FIELD_OUTLINES } from "@/lib/settings-section-field-outlines";

export function getSectionFieldOutline(areaId: string, sectionSlug: string): string[] {
  return SETTINGS_SECTION_FIELD_OUTLINES[areaId]?.[sectionSlug] ?? [sectionSlug.replace(/-/g, " ")];
}
