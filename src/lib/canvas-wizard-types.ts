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

export type CanvasFlowStep = {
  id: string;
  componentType: string;
  label: string;
  tone: string;
};

export type CanvasBuildVariant = {
  id: string;
  name: string;
  weight: number;
};

export type CanvasBuildLayout = {
  variants?: CanvasBuildVariant[];
  variantSteps?: Record<string, CanvasFlowStep[]>;
  entryRulesExpanded?: boolean;
  sidebarCollapsed?: boolean;
  zoom?: number;
  viewMode?: "detailed" | "compact";
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
  variantSteps: {},
  entryRulesExpanded: true,
  sidebarCollapsed: false,
  zoom: 100,
  viewMode: "detailed",
};

export function canvasStepsFromLayout(layout: CanvasBuildLayout) {
  const steps: { type: string; name: string; config: string }[] = [];
  for (const variant of layout.variants ?? []) {
    for (const step of layout.variantSteps?.[variant.id] ?? []) {
      steps.push({
        type: step.componentType,
        name: step.label,
        config: JSON.stringify({ variantId: variant.id, tone: step.tone }),
      });
    }
  }
  return steps;
}

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
