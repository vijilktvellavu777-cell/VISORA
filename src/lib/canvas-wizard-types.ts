export type CanvasEntrySchedule = {
  entryType?: "scheduled" | "action" | "api";
  timeBased?: "on_launch" | "designated_time";
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  entryFrequency?: string;
  localTimeZone?: boolean;
};

export type CanvasSendSettings = {
  subscriptionAudience?: string;
  rateLimitEnabled?: boolean;
  quietHoursEnabled?: boolean;
};

export type CanvasBuildVariant = {
  id: string;
  name: string;
  weight: number;
};

export type CanvasBuildLayout = {
  variants?: CanvasBuildVariant[];
  entryRulesExpanded?: boolean;
  sidebarCollapsed?: boolean;
};

export const DEFAULT_ENTRY_SCHEDULE: CanvasEntrySchedule = {
  entryType: "scheduled",
  timeBased: "designated_time",
  startTime: "09:00",
  entryFrequency: "",
  localTimeZone: false,
};

export const DEFAULT_SEND_SETTINGS: CanvasSendSettings = {
  subscriptionAudience: "subscribed_or_opted_in",
  rateLimitEnabled: false,
  quietHoursEnabled: false,
};

export const DEFAULT_BUILD_LAYOUT: CanvasBuildLayout = {
  variants: [{ id: "variant-1", name: "Variant 1", weight: 100 }],
  entryRulesExpanded: true,
  sidebarCollapsed: false,
};

export function formatEntryScheduleSummary(schedule: CanvasEntrySchedule): string {
  if (schedule.entryType === "action") return "Action-Based";
  if (schedule.entryType === "api") return "API-Triggered";
  if (schedule.timeBased === "on_launch") return "Scheduled — on launch";
  return "Scheduled — designated time";
}

export function formatSendSettingsSummary(settings: CanvasSendSettings): string {
  const parts: string[] = [];
  if (settings.subscriptionAudience === "subscribed_or_opted_in") {
    parts.push("Subscribed or opted-in users");
  } else if (settings.subscriptionAudience === "subscribed_only") {
    parts.push("Subscribed users only");
  }
  if (settings.rateLimitEnabled) parts.push("Rate limit on");
  if (settings.quietHoursEnabled) parts.push("Quiet hours on");
  return parts.length ? parts.join(" · ") : "Default send settings";
}
