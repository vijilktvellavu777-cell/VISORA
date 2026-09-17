"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export function SettingsPageChrome({
  breadcrumbs,
  title,
  description,
  onSave,
  saving,
  saveLabel = "Save Changes",
  children,
}: {
  breadcrumbs: { label: string; href?: string }[];
  title: string;
  description: string;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[#f4f5f7]">
      <div className="border-b border-border bg-surface px-8 py-6">
        <nav className="mb-3 text-xs text-muted">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.label}>
              {index > 0 ? <span className="mx-1.5">›</span> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted">{description}</p>
          </div>
          {onSave ? (
            <Button type="button" onClick={onSave}>
              {saving ? "Saving…" : saveLabel}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="mb-1.5 block text-sm text-muted">
      {label}
      {required ? <span className="text-destructive"> *</span> : null}
    </span>
  );
}

export function SettingsFormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <FieldLabel label={label} required={required} />
      {children}
    </label>
  );
}

export function SettingsInfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm text-foreground">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
        i
      </span>
      <p>{children}</p>
    </div>
  );
}
