"use client";

import { Card, Field, inputClass } from "@/components/ui";
import type { WhatsAppMessagePayload } from "@/lib/campaign-message";

type Props = {
  value: WhatsAppMessagePayload;
  onChange: (value: WhatsAppMessagePayload) => void;
};

export function WhatsAppMessageComposer({ value, onChange }: Props) {
  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">WhatsApp message</h2>
        <p className="mt-1 text-sm text-muted">Compose the message users will receive on WhatsApp.</p>
      </div>
      <Field label="Message">
        <textarea
          className={`${inputClass} min-h-32`}
          value={value.message}
          onChange={(event) => onChange({ ...value, message: event.target.value })}
          placeholder="Hi {{ first_name }}, your update is ready."
        />
      </Field>
    </Card>
  );
}
