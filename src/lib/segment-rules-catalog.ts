export type SegmentRuleCategory = "all" | "channels" | "email";

export type SegmentRuleEntry = {
  id: string;
  label: string;
  section: "general" | "channels" | "email";
};

export const SEGMENT_RULE_ENTRIES: SegmentRuleEntry[] = [
  { id: "rule_set", label: "Rule set", section: "general" },
  { id: "email_address", label: "Address", section: "email" },
  { id: "email_subscribe_date", label: "Subscribe date", section: "email" },
  { id: "email_subscribe_status", label: "Subscribe status", section: "email" },
  { id: "email_unsubscribe_date", label: "Unsubscribe date", section: "email" },
  { id: "email_valid_status", label: "Valid status", section: "email" },
];

export function visibleSegmentRules(category: SegmentRuleCategory, query: string) {
  const normalized = query.trim().toLowerCase();
  return SEGMENT_RULE_ENTRIES.filter((rule) => {
    if (category === "email" && rule.section !== "email") return false;
    if (category === "channels" && rule.section === "general") return false;
    if (!normalized) return true;
    return rule.label.toLowerCase().includes(normalized);
  });
}
