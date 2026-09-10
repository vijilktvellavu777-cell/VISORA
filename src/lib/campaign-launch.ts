import type { CampaignSchedule } from "@/lib/campaign-schedule";
import { resolveCampaignScheduleOutcome } from "@/lib/campaign-schedule";

export function validateCampaignScheduleForLaunch(schedule: CampaignSchedule): string | null {
  if (schedule.entryType !== "scheduled") {
    return "Choose Scheduled delivery before launching.";
  }

  if (schedule.timeBased === "designated_time" && !schedule.startDate) {
    return "Choose a date before launching.";
  }

  return null;
}

export function shouldSendCampaignOnLaunch(schedule: CampaignSchedule) {
  return schedule.entryType === "scheduled" && schedule.timeBased === "on_launch";
}

export function resolveLaunchOutcome(schedule: CampaignSchedule) {
  return resolveCampaignScheduleOutcome(schedule);
}

export async function sendCampaignNow(campaignId: string) {
  const response = await fetch(`/api/campaigns/${campaignId}/send`, { method: "POST" });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof json.error === "string" ? json.error : "Launch failed");
  }
  return json;
}
