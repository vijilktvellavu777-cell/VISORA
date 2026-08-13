export const CHANNELS = ["email", "push", "sms", "in_app"] as const;
export type Channel = (typeof CHANNELS)[number];

export const CAMPAIGN_STATUSES = ["draft", "scheduled", "sending", "sent", "paused"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const SEND_STATUSES = ["queued", "sent", "delivered", "opened", "clicked", "bounced", "unsubscribed"] as const;
export type SendStatus = (typeof SEND_STATUSES)[number];

export type AttributeFilter = {
  kind: "attribute";
  field: string;
  op: "eq" | "neq" | "contains" | "gt" | "lt" | "exists";
  value?: string | number | boolean;
};

export type EventFilter = {
  kind: "event";
  name: string;
  op: "performed" | "not_performed";
  days?: number;
};

export type SegmentFilter = AttributeFilter | EventFilter;

export type SegmentRules = {
  op: "and" | "or";
  filters: SegmentFilter[];
};

export function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function interpolate(template: string, vars: Record<string, string | undefined>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key: string) => {
    return vars[key] ?? "";
  });
}
