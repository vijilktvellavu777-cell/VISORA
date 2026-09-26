import type { SegmentRules } from "./types";

export type TargetingFilterItem = {
  id: string;
  filterId: string;
  label: string;
};

export type TargetingFilterGroup = {
  id: string;
  logic: "and" | "or";
  filters: TargetingFilterItem[];
};

export type CampaignTargeting = {
  segmentIds: string[];
  filterGroups: TargetingFilterGroup[];
  exclusionGroups: TargetingFilterGroup[];
};

export type PrebuiltFilter = {
  id: string;
  label: string;
  description: string;
  rules: SegmentRules;
};

export const PREBUILT_TARGETING_FILTERS: PrebuiltFilter[] = [
  {
    id: "added_to_cart",
    label: "Added to cart",
    description: "Performed added_to_cart",
    rules: { op: "and", filters: [{ kind: "event", name: "added_to_cart", op: "performed" }] },
  },
  {
    id: "campaign_sent",
    label: "Campaign sent",
    description: "Received a campaign_sent event",
    rules: { op: "and", filters: [{ kind: "event", name: "campaign_sent", op: "performed" }] },
  },
  {
    id: "purchase",
    label: "Purchased",
    description: "Performed purchase",
    rules: { op: "and", filters: [{ kind: "event", name: "purchase", op: "performed" }] },
  },
  {
    id: "abandoned_cart",
    label: "Abandoned cart",
    description: "Added to cart but has not purchased",
    rules: {
      op: "and",
      filters: [
        { kind: "event", name: "added_to_cart", op: "performed" },
        { kind: "event", name: "purchase", op: "not_performed" },
      ],
    },
  },
  {
    id: "email_exists",
    label: "Has email address",
    description: "Profile has an email attribute",
    rules: { op: "and", filters: [{ kind: "attribute", field: "email", op: "exists" }] },
  },
  {
    id: "country_us",
    label: "Country is United States",
    description: "Country attribute equals US",
    rules: { op: "and", filters: [{ kind: "attribute", field: "country", op: "eq", value: "US" }] },
  },
  {
    id: "signup",
    label: "Signed up",
    description: "Performed signup event",
    rules: { op: "and", filters: [{ kind: "event", name: "signup", op: "performed" }] },
  },
  {
    id: "rule_set",
    label: "Rule set",
    description: "Start a reusable rule set",
    rules: { op: "and", filters: [] },
  },
  {
    id: "email_address",
    label: "Address",
    description: "Profile has an email address",
    rules: { op: "and", filters: [{ kind: "attribute", field: "email", op: "exists" }] },
  },
  {
    id: "email_subscribe_date",
    label: "Subscribe date",
    description: "Email subscribe date is set",
    rules: { op: "and", filters: [{ kind: "attribute", field: "emailSubscribedAt", op: "exists" }] },
  },
  {
    id: "email_subscribe_status",
    label: "Subscribe status",
    description: "Email subscription is active",
    rules: { op: "and", filters: [{ kind: "attribute", field: "emailSubscribed", op: "eq", value: "true" }] },
  },
  {
    id: "email_unsubscribe_date",
    label: "Unsubscribe date",
    description: "Email unsubscribe date is set",
    rules: { op: "and", filters: [{ kind: "attribute", field: "emailUnsubscribedAt", op: "exists" }] },
  },
  {
    id: "email_valid_status",
    label: "Valid status",
    description: "Email address is marked valid",
    rules: { op: "and", filters: [{ kind: "attribute", field: "emailValid", op: "eq", value: "true" }] },
  },
];

export function emptyTargeting(): CampaignTargeting {
  return {
    segmentIds: [],
    filterGroups: [createFilterGroup("or")],
    exclusionGroups: [],
  };
}

export function parseCampaignTargeting(raw: string | null | undefined): CampaignTargeting {
  if (!raw) return emptyTargeting();
  try {
    const parsed = JSON.parse(raw) as CampaignTargeting;
    return {
      segmentIds: Array.isArray(parsed.segmentIds) ? parsed.segmentIds : [],
      filterGroups: Array.isArray(parsed.filterGroups) ? parsed.filterGroups : [],
      exclusionGroups: Array.isArray(parsed.exclusionGroups) ? parsed.exclusionGroups : [],
    };
  } catch {
    return emptyTargeting();
  }
}

export function serializeCampaignTargeting(targeting: CampaignTargeting) {
  return JSON.stringify(targeting);
}

export function createFilterGroup(logic: "and" | "or" = "or"): TargetingFilterGroup {
  return { id: crypto.randomUUID(), logic, filters: [] };
}

export function createFilterItem(filterId: string, label: string): TargetingFilterItem {
  return { id: crypto.randomUUID(), filterId, label };
}

export function getPrebuiltFilter(id: string) {
  return PREBUILT_TARGETING_FILTERS.find((filter) => filter.id === id);
}
