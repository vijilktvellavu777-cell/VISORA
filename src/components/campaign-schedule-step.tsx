"use client";

import { Calendar, ChevronDown, Clock, Info, Settings, Target } from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import {
  CAMPAIGN_ENTRY_FREQUENCIES,
  formatCampaignNextSendTime,
  type CampaignSchedule,
} from "@/lib/campaign-schedule";

type Props = {
  value: CampaignSchedule;
  onChange: (value: CampaignSchedule) => void;
};

const ENTRY_TYPES = [
  {
    id: "scheduled" as const,
    title: "Scheduled",
    description: "Enter users at designated times",
    icon: Clock,
  },
  {
    id: "action" as const,
    title: "Action-Based",
    description: "Enter user when they perform actions",
    icon: Target,
  },
  {
    id: "api" as const,
    title: "API-Triggered",
    description: "Enter users via API request",
    icon: Settings,
  },
];

export function CampaignScheduleStep({ value, onChange }: Props) {
  const entryType = value.entryType ?? "scheduled";
  const timeBased = value.timeBased ?? "designated_time";
  const nextSend = formatCampaignNextSendTime(value);
  const hasUpcoming = nextSend !== "No upcoming messages scheduled.";

  return (
    <Card className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Delivery</h2>
        <h3 className="mt-4 text-sm font-semibold text-foreground">Choose a Type</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {ENTRY_TYPES.map((type) => {
            const Icon = type.icon;
            const selected = entryType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onChange({ ...value, entryType: type.id })}
                className={`relative rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/30"
                }`}
              >
                <span
                  className={`absolute right-3 top-3 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                    selected ? "border-primary bg-primary" : "border-border bg-surface"
                  }`}
                >
                  {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </span>
                <Icon size={18} className="text-primary" />
                <div className="mt-3 text-sm font-semibold text-foreground">{type.title}</div>
                <p className="mt-1 text-xs text-muted">{type.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {entryType === "scheduled" ? (
        <>
          <hr className="border-border" />

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock size={16} className="text-primary" />
              Time-Based Scheduling Options
            </div>
            <div className="mt-3 space-y-3 rounded-lg bg-background p-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="campaign-time-based"
                  checked={timeBased === "on_launch"}
                  onChange={() => onChange({ ...value, timeBased: "on_launch" })}
                  className="mt-1 accent-primary"
                />
                <span>Send as soon as Campaign is launched</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="campaign-time-based"
                  checked={timeBased === "designated_time"}
                  onChange={() => onChange({ ...value, timeBased: "designated_time" })}
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="font-medium text-foreground">Send at a designated time</span>
                  <span className="mt-1 block text-xs text-muted">
                    Choose a time for users to receive this message.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="campaign-time-based"
                  checked={timeBased === "intelligent_timing"}
                  onChange={() => onChange({ ...value, timeBased: "intelligent_timing" })}
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="font-medium text-foreground">Intelligent Timing</span>
                  <span className="mt-1 block text-xs text-muted">
                    Each user will receive the Campaign at the time they are most likely to engage.{" "}
                    <button type="button" className="font-medium text-primary hover:underline">
                      Learn more.
                    </button>
                  </span>
                </span>
              </label>
            </div>

            {timeBased === "designated_time" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Start Time">
                  <div className="relative">
                    <input
                      type="time"
                      className={`${inputClass} pr-10`}
                      value={value.startTime ?? "09:00"}
                      onChange={(event) => onChange({ ...value, startTime: event.target.value })}
                    />
                    <Clock size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                  </div>
                </Field>
                <Field label="On date">
                  <div className="relative">
                    <input
                      type="date"
                      className={`${inputClass} pr-10`}
                      value={value.startDate ?? ""}
                      onChange={(event) => onChange({ ...value, startDate: event.target.value })}
                    />
                    <Calendar size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                  </div>
                </Field>
              </div>
            ) : null}
          </div>

          <Field label="Entry Frequency">
            <div className="relative">
              <select
                className={`${inputClass} appearance-none pr-8`}
                value={value.entryFrequency ?? "once"}
                onChange={(event) =>
                  onChange({
                    ...value,
                    entryFrequency: event.target.value as CampaignSchedule["entryFrequency"],
                  })
                }
              >
                {CAMPAIGN_ENTRY_FREQUENCIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </Field>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={value.localTimeZone ?? false}
              onChange={(event) => onChange({ ...value, localTimeZone: event.target.checked })}
              className="accent-primary"
            />
            Enter users into this Campaign in their local time zone
          </label>
        </>
      ) : null}

      {entryType === "action" ? (
        <div className="rounded-lg border border-dashed border-border bg-background px-4 py-6 text-sm text-muted">
          Configure action triggers after saving. Users enter when they perform selected events.
        </div>
      ) : null}

      {entryType === "api" ? (
        <div className="rounded-lg border border-dashed border-border bg-background px-4 py-6 text-sm text-muted">
          Use the Campaign Trigger API to enter users into this Campaign on demand.
        </div>
      ) : null}

      <hr className="border-border" />

      <p className="text-sm">
        <span className="font-semibold text-foreground">Next Send Time: </span>
        <span className={hasUpcoming ? "text-foreground" : "text-error"}>{nextSend}</span>
        {!hasUpcoming ? (
          <Info size={14} className="ml-1 inline align-text-bottom text-error" aria-hidden="true" />
        ) : null}
      </p>
    </Card>
  );
}
