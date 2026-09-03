import { format } from "date-fns";
import { parseJson } from "@/lib/types";

export type CampaignEntryFrequency = "once" | "daily" | "weekly" | "monthly";

export type CampaignSchedule = {
  entryType?: "scheduled" | "action" | "api";
  timeBased?: "on_launch" | "designated_time" | "intelligent_timing";
  startDate?: string;
  startTime?: string;
  entryFrequency?: CampaignEntryFrequency | "";
  localTimeZone?: boolean;
};

export const DEFAULT_CAMPAIGN_SCHEDULE: CampaignSchedule = {
  entryType: "scheduled",
  timeBased: "designated_time",
  startTime: "09:00",
  entryFrequency: "once",
  localTimeZone: false,
};

export const CAMPAIGN_ENTRY_FREQUENCIES: { value: CampaignEntryFrequency; label: string }[] = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export function parseCampaignSchedule(raw: unknown): CampaignSchedule {
  const parsed =
    typeof raw === "string"
      ? parseJson<CampaignSchedule>(raw, {})
      : typeof raw === "object" && raw !== null
        ? (raw as CampaignSchedule)
        : {};

  return { ...DEFAULT_CAMPAIGN_SCHEDULE, ...parsed };
}

export function campaignScheduleFromRecord(
  scheduleConfig: unknown,
  scheduledAt: string | null,
): CampaignSchedule {
  const raw =
    typeof scheduleConfig === "string"
      ? parseJson<Partial<CampaignSchedule>>(scheduleConfig, {})
      : typeof scheduleConfig === "object" && scheduleConfig !== null
        ? (scheduleConfig as Partial<CampaignSchedule>)
        : {};

  if (Object.keys(raw).length > 0) {
    return { ...DEFAULT_CAMPAIGN_SCHEDULE, ...raw };
  }

  if (scheduledAt) {
    const dt = new Date(scheduledAt);
    return {
      ...DEFAULT_CAMPAIGN_SCHEDULE,
      entryType: "scheduled",
      timeBased: "designated_time",
      startDate: format(dt, "yyyy-MM-dd"),
      startTime: format(dt, "HH:mm"),
      entryFrequency: "once",
    };
  }

  return DEFAULT_CAMPAIGN_SCHEDULE;
}

export function resolveCampaignScheduleOutcome(schedule: CampaignSchedule): {
  scheduledAt: string | null;
  status: string;
} {
  if (schedule.entryType !== "scheduled") {
    return { scheduledAt: null, status: "draft" };
  }

  if (schedule.timeBased === "on_launch" || schedule.timeBased === "intelligent_timing") {
    return { scheduledAt: null, status: "scheduled" };
  }

  if (schedule.timeBased === "designated_time" && schedule.startDate) {
    return {
      scheduledAt: new Date(`${schedule.startDate}T${schedule.startTime ?? "09:00"}`).toISOString(),
      status: "scheduled",
    };
  }

  return { scheduledAt: null, status: "draft" };
}

export function formatCampaignNextSendTime(schedule: CampaignSchedule): string {
  if (schedule.entryType !== "scheduled") return "No upcoming messages scheduled.";

  if (schedule.timeBased === "on_launch") {
    return "Users will receive this Campaign when it is launched.";
  }

  if (schedule.timeBased === "intelligent_timing") {
    return "Intelligent Timing will choose the best send time for each user.";
  }

  if (schedule.startDate && schedule.startTime) {
    return `${schedule.startDate} at ${schedule.startTime}`;
  }

  return "No upcoming messages scheduled.";
}

export function formatCampaignScheduleSummary(schedule: CampaignSchedule): string {
  if (schedule.entryType === "action") return "Action-Based";
  if (schedule.entryType === "api") return "API-Triggered";
  if (schedule.timeBased === "on_launch") return "Scheduled — on launch";
  if (schedule.timeBased === "intelligent_timing") return "Scheduled — Intelligent Timing";
  if (schedule.timeBased === "designated_time") return "Scheduled — designated time";
  return "Scheduled";
}
