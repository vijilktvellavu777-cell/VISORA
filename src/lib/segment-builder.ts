import { getPrebuiltFilter } from "@/lib/campaign-targeting";
import type { TargetingFilterGroup } from "@/lib/campaign-targeting";
import type { SegmentFilter, SegmentRules } from "@/lib/types";

export type SegmentBuilderMetadata = {
  appsTarget: string;
  specificApps: string[];
  analyticsTracking: boolean;
  filterGroups: TargetingFilterGroup[];
  exclusionGroups: TargetingFilterGroup[];
};

export function flattenFilterGroups(groups: TargetingFilterGroup[]): SegmentFilter[] {
  const filters: SegmentFilter[] = [];

  for (const group of groups) {
    for (const item of group.filters) {
      const prebuilt = getPrebuiltFilter(item.filterId);
      if (prebuilt) filters.push(...prebuilt.rules.filters);
    }
  }

  return filters;
}

export function buildSegmentRulesPayload(metadata: SegmentBuilderMetadata): SegmentRules & SegmentBuilderMetadata {
  return {
    op: "and",
    filters: flattenFilterGroups(metadata.filterGroups),
    ...metadata,
  };
}
