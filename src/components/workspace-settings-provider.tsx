"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkspaceSettings } from "@/lib/workspace-settings";

type Ctx = {
  form: WorkspaceSettings;
  setForm: React.Dispatch<React.SetStateAction<WorkspaceSettings>>;
  save: () => Promise<void>;
  message: string | null;
  error: string | null;
  saving: boolean;
  copiedId: boolean;
  copyWorkspaceId: () => void;
};

const WorkspaceSettingsContext = createContext<Ctx | null>(null);

export function WorkspaceSettingsProvider({
  initial,
  children,
}: {
  initial: WorkspaceSettings;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const response = await fetch("/api/settings/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not save.");
      return;
    }
    const data = (await response.json()) as WorkspaceSettings;
    setForm(data);
    setMessage("Workspace settings saved.");
    router.refresh();
  }

  async function copyWorkspaceId() {
    try {
      await navigator.clipboard.writeText(form.workspaceId);
      setCopiedId(true);
      window.setTimeout(() => setCopiedId(false), 2000);
    } catch {
      setError("Could not copy workspace ID.");
    }
  }

  return (
    <WorkspaceSettingsContext.Provider
      value={{ form, setForm, save, message, error, saving, copiedId, copyWorkspaceId }}
    >
      {children}
    </WorkspaceSettingsContext.Provider>
  );
}

export function useWorkspaceSettings() {
  const ctx = useContext(WorkspaceSettingsContext);
  if (!ctx) throw new Error("useWorkspaceSettings must be used within WorkspaceSettingsProvider");
  return ctx;
}
