"use client";

import { Info } from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import type { CanvasSendSettings } from "@/lib/canvas-wizard-types";

type Props = {
  value: CanvasSendSettings;
  onChange: (value: CanvasSendSettings) => void;
};

export function CanvasSendSettingsStep({ value, onChange }: Props) {
  return (
    <Card className="divide-y divide-border p-0">
      <div className="space-y-5 p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Send Settings</h2>
          <p className="mt-1 text-sm text-muted">
            Set message sending options for all steps within the Canvas.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Subscription Settings</h3>
          <div className="mt-3">
            <Field label="Send to these users:">
              <select
                className={inputClass}
                value={value.subscriptionAudience ?? "subscribed_or_opted_in"}
                onChange={(event) => onChange({ ...value, subscriptionAudience: event.target.value })}
              >
                <option value="subscribed_or_opted_in">users who are subscribed or opted-in</option>
                <option value="subscribed_only">users who are subscribed only</option>
                <option value="all">all users</option>
              </select>
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        <h3 className="text-sm font-semibold text-foreground">Rate Limit</h3>
        <label className="flex items-start gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={value.rateLimitEnabled ?? false}
            onChange={(event) => onChange({ ...value, rateLimitEnabled: event.target.checked })}
            className="mt-0.5 accent-primary"
          />
          <span className="flex items-center gap-1.5">
            Limit the rate at which users will receive messages in this Canvas
            <Info size={14} className="shrink-0 text-primary" />
          </span>
        </label>
      </div>

      <div className="space-y-3 p-6">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          Frequency Capping
          <Info size={14} className="text-primary" />
        </h3>
        <p className="text-sm text-muted">
          You have not created any Frequency Capping rules.{" "}
          <button type="button" className="font-medium text-primary underline hover:no-underline">
            Manage frequency capping rules
          </button>
        </p>
      </div>

      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Quiet hours</h3>
          <p className="mt-1 text-sm text-muted">
            Prevent messages from sending during certain hours (in user&apos;s local time)
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={value.quietHoursEnabled ?? false}
            onChange={(event) => onChange({ ...value, quietHoursEnabled: event.target.checked })}
            className="accent-primary"
          />
          Enable quiet hours
        </label>
      </div>
    </Card>
  );
}
