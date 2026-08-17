"use client";

import { MessageSquare } from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";
import type { InAppMessagePayload } from "@/lib/campaign-message";

type Props = {
  value: InAppMessagePayload;
  onChange: (value: InAppMessagePayload) => void;
};

export function InAppMessageComposer({ value, onChange }: Props) {
  return (
    <Card className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Message composer</h2>
        </div>
        <p className="mt-1 text-sm text-muted">Create the in-app message your users will see inside your product.</p>
      </div>

      <Field label="Message title">
        <input
          className={inputClass}
          value={value.title}
          onChange={(event) => onChange({ ...value, title: event.target.value })}
          placeholder="Enter message title"
        />
      </Field>

      <Field label="Message body">
        <textarea
          className={`${inputClass} min-h-32`}
          value={value.message}
          onChange={(event) => onChange({ ...value, message: event.target.value })}
          placeholder="Write the in-app message content"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Button text">
          <input
            className={inputClass}
            value={value.buttonText}
            onChange={(event) => onChange({ ...value, buttonText: event.target.value })}
            placeholder="Optional call-to-action label"
          />
        </Field>
        <Field label="Button URL">
          <input
            className={inputClass}
            value={value.buttonUrl}
            onChange={(event) => onChange({ ...value, buttonUrl: event.target.value })}
            placeholder="https://"
          />
        </Field>
      </div>

      <div className="rounded-xl border border-border bg-background p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">Preview</div>
        <div className="mt-3 max-w-md rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="text-sm font-semibold text-foreground">
            {value.title.trim() || "Message title"}
          </div>
          <p className="mt-2 text-sm text-muted">{value.message.trim() || "Your in-app message will appear here."}</p>
          {value.buttonText.trim() ? (
            <button
              type="button"
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              {value.buttonText}
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
