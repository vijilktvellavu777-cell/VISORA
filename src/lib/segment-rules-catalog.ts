export type SegmentRuleEntry = {
  id: string;
  label: string;
  groupId: string;
};

export type SegmentRuleGroup = {
  id: string;
  label: string;
  emptyMessage?: string;
  rules: { id: string; label: string }[];
};

export const SEGMENT_RULE_GROUPS: SegmentRuleGroup[] = [
  {
    id: "profile",
    label: "Profile Attributes",
    emptyMessage: "Profile attributes will come from the user profile.",
    rules: [],
  },
  {
    id: "email_recency",
    label: "Email Recency Attributes",
    rules: [
      { id: "email_last_sent_date", label: "Last sent date" },
      { id: "email_last_bounce_date", label: "Last bounce date" },
      { id: "email_last_open_date", label: "Last open date" },
      { id: "email_last_click_date", label: "Last click date" },
      { id: "email_last_conversion_date", label: "Last conversion date" },
      { id: "email_last_modified_date", label: "Last modified date" },
    ],
  },
  {
    id: "email_interaction",
    label: "Email Interaction Attributes",
    rules: [
      { id: "email_sent", label: "Sent" },
      { id: "email_skipped", label: "Skipped" },
      { id: "email_bounced", label: "Bounced" },
      { id: "email_opened", label: "Opened" },
      { id: "email_clicked", label: "Clicked" },
      { id: "email_converted", label: "Converted" },
      { id: "email_purchased", label: "Purchased" },
      { id: "email_cumulatively_purchased", label: "Cumulatively Purchased" },
      { id: "email_viewed_form", label: "Viewed Form" },
      { id: "email_submitted_form", label: "Submitted Form" },
      { id: "email_in_program", label: "In Program" },
    ],
  },
  {
    id: "web_recency",
    label: "Web Recency Attributes",
    emptyMessage: "Web recency attributes will be added here.",
    rules: [],
  },
  {
    id: "device_targeting",
    label: "Device Targeting Attributes",
    rules: [
      { id: "device_last_clicked_on", label: "Last clicked on" },
      { id: "device_last_opened_on", label: "Last opened on" },
    ],
  },
  {
    id: "sms_recency",
    label: "SMS Recency Attributes",
    emptyMessage: "SMS recency attributes will be added here.",
    rules: [],
  },
  {
    id: "sms_interaction",
    label: "SMS Interaction Attributes",
    emptyMessage: "SMS interaction attributes will be added here.",
    rules: [],
  },
  {
    id: "import",
    label: "Import Attributes",
    rules: [
      { id: "import_list", label: "Import a list" },
      { id: "import_user", label: "Import a user" },
    ],
  },
  {
    id: "enclosures",
    label: "Enclosures",
    emptyMessage: "Enclosure rules will be added here.",
    rules: [],
  },
];

export function segmentRulesForGroup(groupId: string, query: string): SegmentRuleEntry[] {
  const normalized = query.trim().toLowerCase();
  const groups =
    groupId === "all" ? SEGMENT_RULE_GROUPS : SEGMENT_RULE_GROUPS.filter((group) => group.id === groupId);

  return groups.flatMap((group) =>
    group.rules
      .filter((rule) => !normalized || rule.label.toLowerCase().includes(normalized) || group.label.toLowerCase().includes(normalized))
      .map((rule) => ({ id: rule.id, label: rule.label, groupId: group.id })),
  );
}
