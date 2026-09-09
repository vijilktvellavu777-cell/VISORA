"use client";

import { useRef, useState } from "react";
import {
  ChevronDown,
  Info,
  Monitor,
  Pencil,
  Plus,
  Smartphone,
  User,
} from "lucide-react";
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

const PERSONALIZATION_TOKENS = ["{{ first_name }}", "{{ last_name }}", "{{ email }}"];

const IOS_DEVICES = ["Phone", "Tablet"] as const;
const IOS_STATES = ["Lock screen", "Banner", "Notification Center"] as const;

type Props = {
  value: PushMessagePayload;
  onChange: (value: PushMessagePayload) => void;
};

type ComposeTab = "compose" | "settings" | "test";

function insertAtCursor(
  element: HTMLInputElement | HTMLTextAreaElement | null,
  currentValue: string,
  token: string,
) {
  if (!element) return `${currentValue}${token}`;
  const start = element.selectionStart ?? currentValue.length;
  const end = element.selectionEnd ?? currentValue.length;
  return `${currentValue.slice(0, start)}${token}${currentValue.slice(end)}`;
}

function previewTitle(title: string) {
  return title.trim() || "Notification Title";
}

function previewMessage(message: string) {
  return message.trim() || "Here's notification text.";
}

function IosPreview({
  title,
  message,
  device,
  notificationState,
}: {
  title: string;
  message: string;
  device: (typeof IOS_DEVICES)[number];
  notificationState: (typeof IOS_STATES)[number];
}) {
  const isLockScreen = notificationState === "Lock screen";

  return (
    <div
      className={`overflow-hidden rounded-[28px] border border-border bg-[#1c1c1e] ${
        device === "Tablet" ? "mx-auto max-w-[320px]" : "max-w-[280px]"
      }`}
    >
      <div className="bg-gradient-to-b from-[#5b6cff] to-[#7b5cff] px-4 pb-6 pt-5 text-white">
        <div className="text-[10px] font-medium opacity-80">9:41</div>
        {isLockScreen ? (
          <div className="mt-8 text-center">
            <div className="text-5xl font-light">9:41</div>
            <div className="mt-1 text-sm opacity-80">Tuesday, September 9</div>
          </div>
        ) : null}
      </div>
      <div className={`px-3 ${isLockScreen ? "pb-4" : "py-4"}`}>
        <div className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5c542] text-xs font-bold text-[#7a5b00]">
              V
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-[#111]">{previewTitle(title)}</span>
                <span className="shrink-0 text-[10px] text-[#666]">now</span>
              </div>
              <p className="mt-0.5 line-clamp-3 text-xs text-[#444]">{previewMessage(message)}</p>
            </div>
          </div>
        </div>
        {!isLockScreen ? (
          <div className="mt-2 text-center text-[10px] text-white/50">{notificationState} preview</div>
        ) : null}
      </div>
    </div>
  );
}

function AndroidPreview({ title, message }: { title: string; message: string }) {
  return (
    <div className="max-w-[320px] overflow-hidden rounded-2xl border border-border bg-[#f3f3f3]">
      <div className="bg-[#6750a4] px-4 py-3 text-sm font-medium text-white">Notifications</div>
      <div className="p-3">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5c542] text-[10px] font-bold text-[#7a5b00]">
              V
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-xs font-semibold text-[#111]">
                <span className="truncate">{previewTitle(title)}</span>
                <span className="shrink-0 text-[#666]">· 9m</span>
                <ChevronDown size={14} className="ml-auto shrink-0 text-[#666]" />
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-[#555]">{previewMessage(message)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PushPlatformStep({ value, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<ComposeTab>("compose");
  const [iosDevice, setIosDevice] = useState<(typeof IOS_DEVICES)[number]>("Phone");
  const [iosState, setIosState] = useState<(typeof IOS_STATES)[number]>("Lock screen");
  const titleRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function togglePlatform(platform: PushPlatform) {
    const exists = value.platforms.includes(platform);
    onChange({
      ...value,
      platforms: exists
        ? value.platforms.filter((item) => item !== platform)
        : [...value.platforms, platform],
    });
  }

  function insertToken(field: "title" | "message", token: string) {
    if (field === "title") {
      onChange({ ...value, title: insertAtCursor(titleRef.current, value.title, token) });
      titleRef.current?.focus();
      return;
    }
    onChange({ ...value, message: insertAtCursor(messageRef.current, value.message, token) });
    messageRef.current?.focus();
  }

  const tabs: { id: ComposeTab; label: string }[] = [
    { id: "compose", label: "Compose" },
    { id: "settings", label: "Settings" },
    { id: "test", label: "Test" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Compose push notification</h2>
        <div className="mt-4 flex gap-6 border-b border-border">
          <span className="border-b-2 border-primary pb-3 text-sm font-semibold text-foreground">iOS</span>
          <span className="pb-3 text-sm font-medium text-muted">Android</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card className="space-y-8 p-6">
          <div>
            <div className="mb-4 text-sm font-semibold text-foreground">iOS</div>
            <div className="mb-4 flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm text-muted">
                <span>Device</span>
                <select
                  className={`${inputClass} w-auto min-w-[120px] py-1.5`}
                  value={iosDevice}
                  onChange={(event) => setIosDevice(event.target.value as (typeof IOS_DEVICES)[number])}
                >
                  {IOS_DEVICES.map((device) => (
                    <option key={device} value={device}>
                      {device}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                <span>Notification State</span>
                <select
                  className={`${inputClass} w-auto min-w-[160px] py-1.5`}
                  value={iosState}
                  onChange={(event) => setIosState(event.target.value as (typeof IOS_STATES)[number])}
                >
                  {IOS_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <IosPreview
              title={value.title}
              message={value.message}
              device={iosDevice}
              notificationState={iosState}
            />
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold text-foreground">Android</div>
            <AndroidPreview title={value.title} message={value.message} />
          </div>

          <p className="text-xs text-muted">
            Always test your message on a real device, as actual rendering may vary.
          </p>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-6 p-6">
            {activeTab === "compose" ? (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <span className="text-sm font-medium text-foreground">Language</span>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    + Add languages
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">Content</h3>

                  <div className="mt-4 space-y-5">
                    <Field label="Title">
                      <div className="relative">
                        <input
                          ref={titleRef}
                          className={`${inputClass} pr-10`}
                          value={value.title}
                          onChange={(event) => onChange({ ...value, title: event.target.value })}
                          placeholder="Notification Title"
                        />
                        <button
                          type="button"
                          onClick={() => insertToken("title", PERSONALIZATION_TOKENS[0])}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-primary hover:bg-primary/10"
                          aria-label="Insert personalization"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </Field>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-sm text-muted">Message</span>
                        <div className="flex items-center gap-2 text-muted">
                          <span className="text-xs">{value.message.length} characters</span>
                          <button type="button" className="rounded p-1 hover:bg-background" aria-label="Message info">
                            <Info size={14} />
                          </button>
                          <button type="button" className="rounded p-1 hover:bg-background" aria-label="Edit message">
                            <Pencil size={14} />
                          </button>
                          <button type="button" className="rounded p-1 hover:bg-background" aria-label="Personalization">
                            <User size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <textarea
                          ref={messageRef}
                          className={`${inputClass} min-h-32 pr-10`}
                          value={value.message}
                          onChange={(event) => onChange({ ...value, message: event.target.value })}
                          placeholder="Here's notification text."
                        />
                        <button
                          type="button"
                          onClick={() => insertToken("message", PERSONALIZATION_TOKENS[0])}
                          className="absolute right-2 top-3 rounded p-1 text-primary hover:bg-primary/10"
                          aria-label="Insert personalization"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {activeTab === "settings" ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Push platform</h3>
                <p className="mt-1 text-sm text-muted">
                  Select the platforms where this push notification should be delivered.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
                            : "border-border bg-background hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
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
            ) : null}

            {activeTab === "test" ? (
              <div className="rounded-xl border border-dashed border-border bg-background px-5 py-8 text-center">
                <div className="text-sm font-medium text-foreground">Test push notification</div>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                  Send a test notification to a registered device after you finish composing your message.
                </p>
                <button
                  type="button"
                  className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                >
                  Send test
                </button>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
