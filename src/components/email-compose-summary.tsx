"use client";

import { useState } from "react";
import { ArrowLeft, LayoutGrid, Pencil } from "lucide-react";
import { Field, inputClass } from "@/components/ui";
import { EmailPreviewTestModal } from "@/components/email-preview-test-modal";

type Props = {
  subject: string;
  fromAddress: string;
  preheader: string;
  bodyHtml: string;
  editorLabel?: string;
  sendingInfoEditing: boolean;
  onSendingInfoEditingChange: (editing: boolean) => void;
  onSubjectChange: (value: string) => void;
  onFromAddressChange: (value: string) => void;
  onPreheaderChange: (value: string) => void;
  onEditMessage: () => void;
  onChooseNewTemplate: () => void;
  subjectPlaceholder?: string;
  fromPlaceholder?: string;
  preheaderPlaceholder?: string;
};

export function EmailComposeSummary({
  subject,
  fromAddress,
  preheader,
  bodyHtml,
  editorLabel = "Drag-And-Drop Editor",
  sendingInfoEditing,
  onSendingInfoEditingChange,
  onSubjectChange,
  onFromAddressChange,
  onPreheaderChange,
  onEditMessage,
  onChooseNewTemplate,
  subjectPlaceholder = "Your email subject",
  fromPlaceholder = "VISORA <noreply@visora.app>",
  preheaderPlaceholder = "Your preheader text",
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <section className="border-b border-border pb-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-foreground">Sending info</h2>
            <button
              type="button"
              onClick={() => onSendingInfoEditingChange(!sendingInfoEditing)}
              className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <Pencil size={14} />
              Edit sending info
            </button>
          </div>

          {sendingInfoEditing ? (
            <div className="mt-4 space-y-4">
              <Field label="From address">
                <input
                  className={inputClass}
                  value={fromAddress}
                  onChange={(event) => onFromAddressChange(event.target.value)}
                  placeholder={fromPlaceholder}
                />
              </Field>
              <Field label="Subject line">
                <input
                  className={inputClass}
                  value={subject}
                  onChange={(event) => onSubjectChange(event.target.value)}
                  placeholder={subjectPlaceholder}
                />
              </Field>
              <Field label="Preheader">
                <input
                  className={inputClass}
                  value={preheader}
                  onChange={(event) => onPreheaderChange(event.target.value)}
                  placeholder={preheaderPlaceholder}
                />
              </Field>
              <button
                type="button"
                onClick={() => onSendingInfoEditingChange(false)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Done editing
              </button>
            </div>
          ) : (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-foreground">Subject:</dt>
                <dd className={subject.trim() ? "text-foreground" : "text-muted"}>
                  {subject.trim() || ""}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-foreground">One-click list-unsubscribe:</dt>
                <dd className="text-foreground">Use workspace default</dd>
              </div>
            </dl>
          )}
        </section>

        <section>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-foreground">Email body</h2>
            <button
              type="button"
              onClick={onEditMessage}
              className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <Pencil size={14} />
              Edit message
            </button>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
            <LayoutGrid size={14} />
            {editorLabel}
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-white">
            {bodyHtml.trim() ? (
              <iframe
                title="Email preview"
                srcDoc={bodyHtml}
                className="h-[420px] w-full border-0"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-sm text-muted">
                No email content yet.
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <button
            type="button"
            onClick={onChooseNewTemplate}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Choose New Template
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Preview and test
          </button>
        </div>
      </div>

      {previewOpen ? (
        <EmailPreviewTestModal bodyHtml={bodyHtml} onClose={() => setPreviewOpen(false)} />
      ) : null}
    </>
  );
}
