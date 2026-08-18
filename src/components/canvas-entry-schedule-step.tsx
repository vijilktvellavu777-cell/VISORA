"use client";

import {
  ChevronDown,
  Clock,
  Info,
  Settings,
  Target,
} from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import type { CanvasEntrySchedule } from "@/lib/canvas-wizard-types";

type Props = {
  value: CanvasEntrySchedule;
  onChange: (value: CanvasEntrySchedule) => void;
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

function nextSendTimeLabel(schedule: CanvasEntrySchedule): string {
  if (schedule.entryType !== "scheduled") return "No upcoming messages scheduled.";
  if (schedule.timeBased === "on_launch") return "Users will enter when the Canvas launches.";
  if (schedule.startDate && schedule.startTime) {
    return `${schedule.startDate} at ${schedule.startTime}`;
  }
  return "No upcoming messages scheduled.";
}

export function CanvasEntryScheduleStep({ value, onChange }: Props) {
  const entryType = value.entryType ?? "scheduled";
  const timeBased = value.timeBased ?? "designated_time";
  const nextSend = nextSendTimeLabel(value);
  const hasUpcoming = nextSend !== "No upcoming messages scheduled.";

  return (
    <Card className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Entry Schedule</h2>
        <p className="mt-1 text-sm text-muted">Decide when users should enter the Canvas.</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Choose a Type</h3>
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
              Time-Based Options
            </div>
            <div className="mt-3 space-y-3 rounded-lg bg-background p-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="time-based"
                  checked={timeBased === "on_launch"}
                  onChange={() => onChange({ ...value, timeBased: "on_launch" })}
                  className="mt-1"
                />
                <span>Enter users as soon as Canvas is launched</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="time-based"
                  checked={timeBased === "designated_time"}
                  onChange={() => onChange({ ...value, timeBased: "designated_time" })}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-foreground">Enter users at a designated time</span>
                  <span className="mt-1 block text-xs text-muted">
                    Choose an optimal time for users to be entered into this Canvas.
                  </span>
                </span>
              </label>
            </div>

            {timeBased === "designated_time" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Start date">
                  <input
                    type="date"
                    className={inputClass}
                    value={value.startDate ?? ""}
                    onChange={(event) => onChange({ ...value, startDate: event.target.value })}
                  />
                </Field>
                <Field label="Start time">
                  <input
                    type="time"
                    className={inputClass}
                    value={value.startTime ?? "09:00"}
                    onChange={(event) => onChange({ ...value, startTime: event.target.value })}
                  />
                </Field>
              </div>
            ) : null}
          </div>

          <Field label="Entry Frequency">
            <div className="relative">
              <select
                className={`${inputClass} appearance-none pr-8 ${!value.entryFrequency ? "text-muted italic" : ""}`}
                value={value.entryFrequency ?? ""}
                onChange={(event) => onChange({ ...value, entryFrequency: event.target.value })}
              >
                <option value="">Select…</option>
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
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
            Enter users into this Canvas in their local time zone
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
          Use the Canvas Trigger API to enter users into this Canvas on demand.
        </div>
      ) : null}

      <p className="text-sm">
        <span className="font-semibold text-foreground">Next Send Time: </span>
        <span className={hasUpcoming ? "text-foreground" : "text-error"}>{nextSend}</span>
      </p>
    </Card>
  );
}
