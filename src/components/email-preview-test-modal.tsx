"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { EmailDragDropPreviewPanel, DEFAULT_PREVIEW_USER, type PreviewUserProfile } from "@/components/email-drag-drop-preview-panel";

export function EmailPreviewTestModal({
  bodyHtml,
  onClose,
}: {
  bodyHtml: string;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<PreviewUserProfile>(DEFAULT_PREVIEW_USER);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#1a1d24]">
      <div className="flex shrink-0 items-center justify-end border-b border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Close preview"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex min-h-0 flex-1">
        <EmailDragDropPreviewPanel
          blocks={[]}
          profile={profile}
          onProfileChange={setProfile}
          htmlOverride={bodyHtml}
        />
      </div>
    </div>
  );
}
