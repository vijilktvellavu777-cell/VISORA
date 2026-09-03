"use client";

import { useMemo, useState } from "react";
import { ChevronUp, Lightbulb, Link2, Monitor, Smartphone } from "lucide-react";
import { type CanvasBlock, blocksToHtml } from "@/lib/email-drag-drop-blocks";

export type PreviewUserProfile = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  city: string;
  language: string;
  phoneNumber: string;
  gender: string;
  timeZone: string;
};

export const DEFAULT_PREVIEW_USER: PreviewUserProfile = {
  userId: "",
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  city: "",
  language: "",
  phoneNumber: "",
  gender: "",
  timeZone: "",
};

const PROFILE_FIELDS: { key: keyof PreviewUserProfile; label: string; type?: "select" }[] = [
  { key: "userId", label: "User ID" },
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "email", label: "Email" },
  { key: "country", label: "Country" },
  { key: "city", label: "City" },
  { key: "language", label: "Language" },
  { key: "phoneNumber", label: "Phone number" },
  { key: "gender", label: "Gender", type: "select" },
  { key: "timeZone", label: "Time Zone", type: "select" },
];

const GENDER_OPTIONS = ["", "Male", "Female", "Other", "Prefer not to say"];
const TIME_ZONE_OPTIONS = [
  "",
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

const PERSONALIZATION_KEYS: Record<keyof PreviewUserProfile, string[]> = {
  userId: ["user_id", "external_id"],
  firstName: ["first_name", "firstname"],
  lastName: ["last_name", "lastname"],
  email: ["email"],
  country: ["country"],
  city: ["city"],
  language: ["language"],
  phoneNumber: ["phone_number", "phone"],
  gender: ["gender"],
  timeZone: ["time_zone", "timezone"],
};

type PreviewTab = "preview_user" | "test_send";
type PreviewView = "desktop" | "mobile" | "plaintext";

const CONTENT_TEST_GROUPS = [
  { id: "marketing", label: "Marketing Team" },
  { id: "qa", label: "QA Testers" },
  { id: "internal", label: "Internal Review" },
  { id: "stakeholders", label: "Stakeholders" },
];

type TestSendState = {
  selectedGroups: string[];
  individualEmails: string;
  overrideWithPreviewUser: boolean;
};

const DEFAULT_TEST_SEND_STATE: TestSendState = {
  selectedGroups: [],
  individualEmails: "",
  overrideWithPreviewUser: false,
};

function InfoIcon({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-bold leading-none ${className ?? "border-muted text-muted"}`}
      aria-hidden="true"
    >
      i
    </span>
  );
}

function TestSendPanel({
  testSend,
  onTestSendChange,
}: {
  testSend: TestSendState;
  onTestSendChange: (state: TestSendState) => void;
}) {
  const [sendStatus, setSendStatus] = useState<"idle" | "sent">("idle");

  const hasRecipients =
    testSend.selectedGroups.length > 0 || testSend.individualEmails.trim().length > 0;

  const availableGroups = CONTENT_TEST_GROUPS.filter(
    (group) => !testSend.selectedGroups.includes(group.id),
  );

  function update(partial: Partial<TestSendState>) {
    onTestSendChange({ ...testSend, ...partial });
    setSendStatus("idle");
  }

  function addGroup(groupId: string) {
    if (!groupId || testSend.selectedGroups.includes(groupId)) return;
    update({ selectedGroups: [...testSend.selectedGroups, groupId] });
  }

  function removeGroup(groupId: string) {
    update({ selectedGroups: testSend.selectedGroups.filter((id) => id !== groupId) });
  }

  function handleSendTest() {
    if (!hasRecipients) return;
    setSendStatus("sent");
  }

  return (
    <div className="flex h-full flex-col p-4">
      <h3 className="text-sm font-semibold text-foreground">Test Recipients</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Select at least one Content Test Group or individual user to receive this test message. Messages will be
        customized with recipients&apos; attributes by default.
      </p>

      <div className="mt-6">
        <label className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          Add content test group
          <InfoIcon />
        </label>
        <select
          value=""
          onChange={(event) => addGroup(event.target.value)}
          className="mt-2 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm italic text-muted outline-none focus:border-primary"
        >
          <option value="" disabled>
            *Select Content Test Groups*
          </option>
          {availableGroups.map((group) => (
            <option key={group.id} value={group.id} className="not-italic text-foreground">
              {group.label}
            </option>
          ))}
        </select>
        {testSend.selectedGroups.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {testSend.selectedGroups.map((groupId) => {
              const group = CONTENT_TEST_GROUPS.find((item) => item.id === groupId);
              if (!group) return null;
              return (
                <span
                  key={groupId}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {group.label}
                  <button
                    type="button"
                    onClick={() => removeGroup(groupId)}
                    className="text-primary/70 hover:text-primary"
                    aria-label={`Remove ${group.label}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium text-foreground">Add individual users</label>
        <input
          type="text"
          value={testSend.individualEmails}
          onChange={(event) => update({ individualEmails: event.target.value })}
          placeholder="Add emails"
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-primary"
        />
      </div>

      <label className="mt-6 flex items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={testSend.overrideWithPreviewUser}
          onChange={(event) => update({ overrideWithPreviewUser: event.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span className="inline-flex items-start gap-1.5 leading-relaxed">
          Override recipients&apos; attributes with current preview user&apos;s attributes
          <InfoIcon className="border-primary text-primary" />
        </span>
      </label>

      <div className="mt-auto pt-8">
        {sendStatus === "sent" ? (
          <p className="mb-3 text-sm text-primary">Test message sent successfully.</p>
        ) : null}
        <button
          type="button"
          onClick={handleSendTest}
          disabled={!hasRecipients}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            hasRecipients
              ? "bg-primary text-white hover:bg-primary/90"
              : "cursor-not-allowed bg-[#d1d5db] text-white"
          }`}
        >
          Send Test
        </button>
      </div>
    </div>
  );
}

type Props = {
  blocks: CanvasBlock[];
  profile: PreviewUserProfile;
  onProfileChange: (profile: PreviewUserProfile) => void;
};

function applyPersonalization(html: string, profile: PreviewUserProfile) {
  return html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) => {
    const normalized = key.toLowerCase();
    for (const [field, aliases] of Object.entries(PERSONALIZATION_KEYS) as [keyof PreviewUserProfile, string[]][]) {
      if (aliases.includes(normalized)) {
        return profile[field] || "";
      }
    }
    return match;
  });
}

function htmlToPlainText(html: string) {
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-border"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

function PreviewConfigSidebar({
  profile,
  onProfileChange,
  activeTab,
  onTabChange,
  testSend,
  onTestSendChange,
}: {
  profile: PreviewUserProfile;
  onProfileChange: (profile: PreviewUserProfile) => void;
  activeTab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  testSend: TestSendState;
  onTestSendChange: (state: TestSendState) => void;
}) {
  const [profileOpen, setProfileOpen] = useState(true);

  function updateField(key: keyof PreviewUserProfile, value: string) {
    onProfileChange({ ...profile, [key]: value });
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex border-b border-border">
        {(
          [
            { id: "preview_user" as const, label: "Preview as a User" },
            { id: "test_send" as const, label: "Test Send" },
          ] as const
        ).map(({ id, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`flex-1 px-3 py-3 text-sm font-medium ${
                active ? "border-b-2 border-primary text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === "preview_user" ? (
          <div className="p-4">
            <label className="text-sm text-foreground">Preview message as user</label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
              <option>Custom user</option>
            </select>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Profile</h3>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {profileOpen ? "Collapse" : "Expand"}
                  <ChevronUp size={14} className={profileOpen ? "" : "rotate-180"} />
                </button>
              </div>

              {profileOpen ? (
                <div className="mt-4 space-y-3">
                  {PROFILE_FIELDS.map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="mb-1.5 block text-sm text-foreground">{label}</label>
                      {type === "select" ? (
                        <select
                          value={profile[key]}
                          onChange={(event) => updateField(key, event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        >
                          {(key === "gender" ? GENDER_OPTIONS : TIME_ZONE_OPTIONS).map((option) => (
                            <option key={option || "empty"} value={option}>
                              {option || `Select ${label.toLowerCase()}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={profile[key]}
                          onChange={(event) => updateField(key, event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <TestSendPanel testSend={testSend} onTestSendChange={onTestSendChange} />
        )}
      </div>
    </aside>
  );
}

function PreviewMainArea({
  blocks,
  profile,
  previewView,
  onPreviewViewChange,
  darkMode,
  onDarkModeChange,
}: {
  blocks: CanvasBlock[];
  profile: PreviewUserProfile;
  previewView: PreviewView;
  onPreviewViewChange: (view: PreviewView) => void;
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
}) {
  const personalizedHtml = useMemo(() => applyPersonalization(blocksToHtml(blocks), profile), [blocks, profile]);
  const plainText = useMemo(() => htmlToPlainText(personalizedHtml), [personalizedHtml]);

  function handleCopyPreviewLink() {
    const link = `${window.location.origin}/preview/custom-user`;
    void navigator.clipboard.writeText(link);
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[#e8ebf0]">
      <div className="border-b border-[#f0d58c] bg-[#fff8e6] px-4 py-2.5">
        <div className="flex items-start gap-2 text-sm text-[#7a5b00]">
          <Lightbulb size={16} className="mt-0.5 shrink-0" />
          <p>
            You&apos;re previewing this message as a custom user since you don&apos;t have permission to search for
            users.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-4">
          {(
            [
              { id: "desktop" as const, label: "Desktop", icon: Monitor },
              { id: "mobile" as const, label: "Mobile", icon: Smartphone },
              { id: "plaintext" as const, label: "Plaintext" },
            ] as const
          ).map((tab) => {
            const active = previewView === tab.id;
            const Icon = "icon" in tab ? tab.icon : null;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onPreviewViewChange(tab.id)}
                className={`inline-flex items-center gap-2 border-b-2 pb-2 text-sm font-medium ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {Icon ? <Icon size={15} /> : null}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <span>Dark Mode Preview</span>
            <ToggleSwitch checked={darkMode} onChange={onDarkModeChange} />
          </label>
          <button
            type="button"
            onClick={handleCopyPreviewLink}
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            <Link2 size={14} />
            Copy preview link
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-auto p-6">
        <div
          className={`mx-auto flex w-full flex-1 flex-col rounded-lg border border-border bg-white shadow-sm ${
            previewView === "mobile" ? "max-w-[375px]" : "max-w-[900px]"
          } ${darkMode ? "bg-[#111827] text-white" : ""}`}
        >
          <div className="flex-1 overflow-auto p-6">
            {previewView === "plaintext" ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-inherit">{plainText}</pre>
            ) : blocks.length === 0 ? (
              <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-muted">
                Add content blocks in the editor to preview your message.
              </div>
            ) : (
              <iframe
                title="Email preview"
                srcDoc={personalizedHtml}
                className={`h-full min-h-[420px] w-full border-0 ${darkMode ? "invert hue-rotate-180" : ""}`}
                sandbox="allow-same-origin"
              />
            )}
          </div>
          <p className="border-t border-border px-6 py-4 text-center text-xs text-muted">
            Actual rendering may not be identical to this preview depending on the user&apos;s environment.
          </p>
        </div>
      </div>
    </main>
  );
}

export function EmailDragDropPreviewPanel({ blocks, profile, onProfileChange }: Props) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("preview_user");
  const [previewView, setPreviewView] = useState<PreviewView>("desktop");
  const [darkMode, setDarkMode] = useState(false);
  const [testSend, setTestSend] = useState<TestSendState>(DEFAULT_TEST_SEND_STATE);

  return (
    <>
      <PreviewConfigSidebar
        profile={profile}
        onProfileChange={onProfileChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        testSend={testSend}
        onTestSendChange={setTestSend}
      />
      <PreviewMainArea
        blocks={blocks}
        profile={profile}
        previewView={previewView}
        onPreviewViewChange={setPreviewView}
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
      />
    </>
  );
}
