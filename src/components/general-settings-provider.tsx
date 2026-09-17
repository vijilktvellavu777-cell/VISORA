"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import type { GeneralSettingsContextValue } from "@/components/general-settings-context-types";
import type { GeneralSettings } from "@/lib/general-settings";

const GeneralSettingsContext = createContext<GeneralSettingsContextValue | null>(null);

export function GeneralSettingsProvider({
  initial,
  children,
}: {
  initial: GeneralSettings;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [form, setForm] = useState<GeneralSettings>(initial);
  const [paused, setPaused] = useState(initial.paused);
  const [saving, setSaving] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/settings/general", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not save settings.");
      return false;
    }

    const data = (await response.json()) as GeneralSettings;
    setForm(data);
    setMessage("Settings saved.");
    router.refresh();
    return true;
  }

  async function togglePause() {
    setPauseLoading(true);
    setError(null);
    setMessage(null);

    const nextPaused = !paused;
    const response = await fetch("/api/settings/general/pause", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paused: nextPaused }),
    });

    setPauseLoading(false);
    if (!response.ok) {
      setError("Could not update workspace pause state.");
      return;
    }

    const data = (await response.json()) as GeneralSettings;
    setPaused(data.paused);
    setForm((prev) => ({ ...prev, paused: data.paused }));
    setMessage(data.paused ? "Workspace paused." : "Workspace resumed.");
    router.refresh();
  }

  async function deleteWorkspace() {
    setDeleteLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/settings/general/workspace", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmName: deleteConfirm }),
    });

    setDeleteLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not delete workspace.");
      return;
    }

    window.location.href = "/";
  }

  const value: GeneralSettingsContextValue = {
    form,
    setForm,
    save,
    message,
    error,
    saving,
    paused,
    setPaused,
    pauseLoading,
    togglePause,
    deleteLoading,
    deleteConfirm,
    setDeleteConfirm,
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleteWorkspace,
  };

  return (
    <GeneralSettingsContext.Provider value={value}>{children}</GeneralSettingsContext.Provider>
  );
}

export function useGeneralSettings() {
  const ctx = useContext(GeneralSettingsContext);
  if (!ctx) throw new Error("useGeneralSettings must be used within GeneralSettingsProvider");
  return ctx;
}
