"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Info,
  Laptop,
  Monitor,
  Plus,
  Smartphone,
  Sparkles,
  Tablet,
  X,
} from "lucide-react";
import { Button, Card, Field, inputClass } from "@/components/ui";
import type { PushMessagePayload, PushPlatform, PushPlatformCategory } from "@/lib/campaign-message";

const PERSONALIZATION_TOKEN = "{{ first_name }}";

type Props = {
  value: PushMessagePayload;
  onChange: (value: PushMessagePayload) => void;
};

type ComposePhase = "platform" | "message";
type MessageTab = "compose" | "design" | "settings" | "test";
type PreviewDevice = "phone" | "tablet" | "laptop";

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

function FieldActions({
  onInsert,
}: {
  onInsert: () => void;
}) {
  return (
    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
      <button
        type="button"
        className="rounded p-1 text-muted hover:bg-background hover:text-primary"
        aria-label="AI assist"
      >
        <Sparkles size={15} />
      </button>
      <button
        type="button"
        onClick={onInsert}
        className="rounded p-1 text-primary hover:bg-primary/10"
        aria-label="Insert personalization"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

function TextareaFieldActions({ onInsert }: { onInsert: () => void }) {
  return (
    <div className="absolute right-2 top-2 flex items-center gap-1">
      <button type="button" className="rounded p-1 text-muted hover:bg-background hover:text-primary" aria-label="AI assist">
        <Sparkles size={15} />
      </button>
      <button type="button" onClick={onInsert} className="rounded p-1 text-primary hover:bg-primary/10" aria-label="Insert personalization">
        <Plus size={15} />
      </button>
    </div>
  );
}

function PushPreview({
  value,
  previewDevice,
}: {
  value: PushMessagePayload;
  previewDevice: PreviewDevice;
}) {
  const title = value.title.trim() || "Your message...";
  const message = value.message.trim() || "Notification body preview";
  const widthClass =
    previewDevice === "tablet" ? "max-w-[360px]" : previewDevice === "laptop" ? "max-w-[420px]" : "max-w-[280px]";

  return (
    <div className={`mx-auto ${widthClass}`}>
      <div className="overflow-hidden rounded-[24px] border border-border bg-[#2f2f33] p-4 shadow-lg">
        <div className="rounded-xl bg-white p-4 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#111]">{title}</div>
              <p className="mt-1 text-sm text-[#555]">{message}</p>
              {value.button1Text.trim() ? (
                <div className="mt-3 inline-flex rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  {value.button1Text}
                </div>
              ) : null}
              {value.button2Text.trim() ? (
                <div className="mt-2 inline-flex rounded-md border border-border px-3 py-1.5 text-xs font-medium text-[#444]">
                  {value.button2Text}
                </div>
              ) : null}
            </div>
            <button type="button" className="text-[#999]" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PushPlatformSelect({
  value,
  onChange,
  onConfirm,
}: {
  value: PushMessagePayload;
  onChange: (value: PushMessagePayload) => void;
  onConfirm: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const mobileSelected = value.platformCategory === "mobile";
  const webSelected = value.platformCategory === "web";
  const iosSelected = value.platforms.includes("ios");
  const androidSelected = value.platforms.includes("android");
  const multipleMobileDevices = iosSelected && androidSelected;

  function selectCategory(category: PushPlatformCategory) {
    if (category === "mobile") {
      onChange({
        ...value,
        platformCategory: "mobile",
        platforms: value.platforms.filter((p) => p !== "web").length
          ? value.platforms.filter((p) => p === "ios" || p === "android")
          : ["ios", "android"],
      });
      return;
    }
    onChange({
      ...value,
      platformCategory: "web",
      platforms: ["web"],
    });
  }

  function toggleMobileDevice(platform: PushPlatform) {
    const exists = value.platforms.includes(platform);
    const next = exists
      ? value.platforms.filter((item) => item !== platform)
      : [...value.platforms.filter((item) => item !== "web"), platform];
    onChange({ ...value, platformCategory: "mobile", platforms: next });
  }

  function handleConfirm() {
    if (!value.platformCategory) {
      setError("Select Mobile or Web to continue.");
      return;
    }
    if (value.platformCategory === "mobile" && !iosSelected && !androidSelected) {
      setError("Select at least one mobile device.");
      return;
    }
    setError(null);
    onChange({ ...value, platformsConfirmed: true });
    onConfirm();
  }

  return (
    <Card className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Push platforms</h2>
        <p className="mt-1 text-sm text-muted">Decide which platforms to send this push notification to.</p>
      </div>

      <div>
        <div className="mb-3 text-sm font-medium text-foreground">Select platform</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => selectCategory("mobile")}
            className={`rounded-xl border p-5 text-left transition ${
              mobileSelected
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-surface hover:border-primary/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background">
                <Smartphone size={24} className="text-primary" />
              </div>
              {mobileSelected ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                  <Check size={14} />
                </span>
              ) : (
                <span className="h-5 w-5 rounded border border-border" />
              )}
            </div>
            <div className="mt-4 text-base font-semibold text-foreground">Mobile</div>
          </button>

          <button
            type="button"
            onClick={() => selectCategory("web")}
            className={`rounded-xl border p-5 text-left transition ${
              webSelected
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-surface hover:border-primary/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background">
                <Monitor size={24} className="text-primary" />
              </div>
              {webSelected ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                  <Check size={14} />
                </span>
              ) : (
                <span className="h-5 w-5 rounded border border-border" />
              )}
            </div>
            <div className="mt-4 text-base font-semibold text-foreground">Web</div>
          </button>
        </div>
      </div>

      {mobileSelected ? (
        <div>
          <div className="mb-3 text-sm font-medium text-foreground">Select mobile devices</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["ios", "android"] as const).map((platform) => {
              const selected = value.platforms.includes(platform);
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => toggleMobileDevice(platform)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
                    selected ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm font-medium capitalize text-foreground">{platform}</span>
                  {selected ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check size={12} />
                    </span>
                  ) : (
                    <span className="h-4 w-4 rounded border border-border" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {multipleMobileDevices ? (
        <div className="flex items-start gap-2 rounded-lg bg-background px-4 py-3 text-sm text-muted">
          <Info size={16} className="mt-0.5 shrink-0 text-primary" />
          Multivariate testing is not supported when multiple devices are selected.
        </div>
      ) : null}

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="flex justify-end border-t border-border pt-4">
        <Button onClick={handleConfirm}>Confirm</Button>
      </div>
    </Card>
  );
}

function PushMessageCompose({
  value,
  onChange,
  onChangePlatforms,
}: {
  value: PushMessagePayload;
  onChange: (value: PushMessagePayload) => void;
  onChangePlatforms: () => void;
}) {
  const [activeTab, setActiveTab] = useState<MessageTab>("compose");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("phone");
  const [showBodyError, setShowBodyError] = useState(false);
  const headerRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const button1Ref = useRef<HTMLInputElement>(null);
  const button2Ref = useRef<HTMLInputElement>(null);

  const tabs: { id: MessageTab; label: string }[] = [
    { id: "compose", label: "Compose" },
    { id: "design", label: "Design" },
    { id: "settings", label: "Settings" },
    { id: "test", label: "Test" },
  ];

  const previewIcons: { id: PreviewDevice; icon: typeof Smartphone; label: string }[] = [
    { id: "phone", icon: Smartphone, label: "Phone" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "laptop", icon: Laptop, label: "Laptop" },
  ];

  function updateField<K extends keyof PushMessagePayload>(key: K, next: PushMessagePayload[K]) {
    if (key === "message" && typeof next === "string" && next.trim()) {
      setShowBodyError(false);
    }
    onChange({ ...value, [key]: next });
  }

  function insertToken(
    field: "title" | "message" | "button1Text" | "button2Text",
    ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
  ) {
    const current = value[field];
    updateField(field, insertAtCursor(ref.current, current, PERSONALIZATION_TOKEN));
    ref.current?.focus();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Compose push notification</h2>
        <button type="button" onClick={onChangePlatforms} className="text-sm font-medium text-primary hover:underline">
          Change platforms
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="p-6">
          <div className="mb-4 text-sm font-semibold text-foreground">Preview</div>
          <div className="mb-6 flex items-center gap-2">
            {previewIcons.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreviewDevice(id)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  previewDevice === id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted hover:text-foreground"
                }`}
                aria-label={label}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
          <PushPreview value={value} previewDevice={previewDevice} />
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

          <div className="space-y-5 p-6">
            {activeTab === "compose" ? (
              <>
                <Field label="Header">
                  <div className="relative">
                    <input
                      ref={headerRef}
                      className={`${inputClass} pr-16`}
                      value={value.title}
                      onChange={(event) => updateField("title", event.target.value)}
                      placeholder="Notification header"
                    />
                    <FieldActions onInsert={() => insertToken("title", headerRef)} />
                  </div>
                </Field>

                <div>
                  <Field label="Body">
                    <div className="relative">
                      <textarea
                        ref={bodyRef}
                        className={`${inputClass} min-h-28 pr-16 ${
                          showBodyError && !value.message.trim() ? "border-error focus:border-error" : ""
                        }`}
                        value={value.message}
                        onChange={(event) => updateField("message", event.target.value)}
                        onBlur={() => setShowBodyError(true)}
                        placeholder="Your message..."
                      />
                      <TextareaFieldActions onInsert={() => insertToken("message", bodyRef)} />
                    </div>
                  </Field>
                  {showBodyError && !value.message.trim() ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-error">
                      <AlertCircle size={14} />
                      This field is incomplete
                    </p>
                  ) : null}
                </div>

                <Field label="Button 1 text">
                  <div className="relative">
                    <input
                      ref={button1Ref}
                      className={`${inputClass} pr-16`}
                      value={value.button1Text}
                      onChange={(event) => updateField("button1Text", event.target.value)}
                      placeholder="Primary action"
                    />
                    <FieldActions onInsert={() => insertToken("button1Text", button1Ref)} />
                  </div>
                </Field>

                <Field label="Button 2 text">
                  <div className="relative">
                    <input
                      ref={button2Ref}
                      className={`${inputClass} pr-16`}
                      value={value.button2Text}
                      onChange={(event) => updateField("button2Text", event.target.value)}
                      placeholder="Secondary action"
                    />
                    <FieldActions onInsert={() => insertToken("button2Text", button2Ref)} />
                  </div>
                </Field>

                <div className="border-t border-border pt-4">
                  <div className="text-sm font-semibold text-foreground">Device options</div>
                  <p className="mt-1 text-sm text-muted">
                    Sending to{" "}
                    {value.platformCategory === "web"
                      ? "Web"
                      : value.platforms.map((platform) => platform.toUpperCase()).join(" and ") || "mobile devices"}
                    .
                  </p>
                </div>
              </>
            ) : null}

            {activeTab === "design" ? (
              <div className="rounded-xl border border-dashed border-border bg-background px-5 py-8 text-center text-sm text-muted">
                Design options for rich push layouts will appear here.
              </div>
            ) : null}

            {activeTab === "settings" ? (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-foreground">Platform category</div>
                  <div className="mt-1 capitalize text-muted">{value.platformCategory ?? "Not selected"}</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Delivery targets</div>
                  <div className="mt-1 text-muted">{value.platforms.join(", ") || "None"}</div>
                </div>
                <button type="button" onClick={onChangePlatforms} className="font-medium text-primary hover:underline">
                  Change platform selection
                </button>
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

export function PushPlatformStep({ value, onChange }: Props) {
  const [phase, setPhase] = useState<ComposePhase>(value.platformsConfirmed ? "message" : "platform");

  function goToMessage() {
    setPhase("message");
  }

  function goToPlatform() {
    onChange({ ...value, platformsConfirmed: false });
    setPhase("platform");
  }

  if (phase === "platform") {
    return <PushPlatformSelect value={value} onChange={onChange} onConfirm={goToMessage} />;
  }

  return <PushMessageCompose value={value} onChange={onChange} onChangePlatforms={goToPlatform} />;
}
