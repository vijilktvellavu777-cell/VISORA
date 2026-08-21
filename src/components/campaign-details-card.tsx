"use client";

import { useState } from "react";
import { Copy, Info, Pencil, Tag, ChevronDown } from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";

type Props = {
  campaign: {
    id: string;
    name: string;
    description: string | null;
  };
  showDescription: boolean;
  nameError: string | null;
  copied: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onShowDescription: () => void;
  onCopyId: () => void;
};

export function CampaignDetailsCard({
  campaign,
  showDescription,
  nameError,
  copied,
  onNameChange,
  onDescriptionChange,
  onShowDescription,
  onCopyId,
}: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Campaign Details</h2>
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
          aria-label="Edit campaign details"
        >
          <Pencil size={16} />
        </button>
      </div>

      {editing ? (
        <div className="mt-4 space-y-4">
          <Field label="Campaign Name">
            <input
              className={`${inputClass} ${nameError ? "border-error focus:border-error" : ""}`}
              value={campaign.name}
              onChange={(event) => onNameChange(event.target.value)}
            />
            {nameError ? <p className="mt-1.5 text-sm text-error">{nameError}</p> : null}
          </Field>
          {showDescription ? (
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-20`}
                value={campaign.description ?? ""}
                onChange={(event) => onDescriptionChange(event.target.value)}
              />
            </Field>
          ) : (
            <button
              type="button"
              onClick={onShowDescription}
              className="text-sm font-medium text-primary hover:underline"
            >
              + Add description
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary"
          >
            <Tag size={14} />
            Tags
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Done editing
          </button>
        </div>
      ) : (
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Campaign Name</dt>
            <dd className="mt-1 text-foreground">{campaign.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Description</dt>
            <dd className={`mt-1 ${campaign.description?.trim() ? "text-foreground" : "text-muted"}`}>
              {campaign.description?.trim() || "No description"}
            </dd>
          </div>
        </dl>
      )}

      <hr className="my-5 border-border" />

      <div>
        <div className="text-sm font-semibold text-foreground">Campaign ID</div>
        <div className="mt-2 flex overflow-hidden rounded-lg border border-border">
          <input
            readOnly
            value={campaign.id}
            className="min-w-0 flex-1 border-0 bg-surface px-3 py-2 text-sm text-muted outline-none"
          />
          <button
            type="button"
            onClick={onCopyId}
            className="inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <Copy size={14} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
          <Info size={14} className="mt-0.5 shrink-0 text-primary" />
          This is the unique key for this Campaign. Use it to identify which Campaign to send in a request to the
          Campaign Trigger API.
        </p>
      </div>
    </Card>
  );
}
