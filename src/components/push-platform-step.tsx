"use client";

import { Bell, Monitor, Smartphone } from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import {
  PUSH_PLATFORMS,
  type PushMessagePayload,
  type PushPlatform,
} from "@/lib/campaign-message";

const PLATFORM_ICONS = {
  ios: Smartphone,
  android: Smartphone,
  web: Monitor,
} as const;

type Props = {
  value: PushMessagePayload;
  onChange: (value: PushMessagePayload) => void;
};

export function PushPlatformStep({ value, onChange }: Props) {
  function togglePlatform(platform: PushPlatform) {
    const exists = value.platforms.includes(platform);
    onChange({
      ...value,
      platforms: exists
        ? value.platforms.filter((item) => item !== platform)
        : [...value.platforms, platform],
    });
  }

  return (
    <Card className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Push notification</h2>
        <p className="mt-1 text-sm text-muted">Compose your push message and choose delivery platforms.</p>
      </div>

      <Field label="Notification title">
        <input
          className={inputClass}
          value={value.title}
          onChange={(event) => onChange({ ...value, title: event.target.value })}
          placeholder="Enter notification title"
        />
      </Field>

      <Field label="Notification message">
        <textarea
          className={`${inputClass} min-h-28`}
          value={value.message}
          onChange={(event) => onChange({ ...value, message: event.target.value })}
          placeholder="Enter the message users will see in the push notification"
        />
      </Field>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Push platform</h3>
        </div>
        <p className="mb-4 text-sm text-muted">Select the platforms where this push notification should be delivered.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PUSH_PLATFORMS.map((platform) => {
            const Icon = PLATFORM_ICONS[platform.id];
            const selected = value.platforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <input
                    type="checkbox"
                    readOnly
                    checked={selected}
                    className="mt-1 accent-primary"
                    aria-label={platform.label}
                  />
                </div>
                <div className="mt-4 text-sm font-semibold text-foreground">{platform.label}</div>
                <div className="mt-1 text-xs text-muted">{platform.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
