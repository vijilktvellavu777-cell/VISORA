"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui";
import { ListExtensionRowMenu } from "@/components/list-extension-row-menu";
import {
  extensionAttributeLabel,
  getEntryAttributeValue,
  type ListExtensionEntryValues,
} from "@/lib/list-extension-attributes";

type ExtensionDetail = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  attributes: string[];
  entries: (ListExtensionEntryValues & { id: string; createdAt: string })[];
};

function typeLabel(type: string) {
  if (type === "sms") return "SMS";
  if (type === "custom") return "Custom";
  return "Email";
}

export function ListExtensionDetailPage({ extension }: { extension: ExtensionDetail }) {
  const columns = extension.attributes;

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/audience/list-extensions" className="text-sm text-primary hover:underline">
              ← List Extensions
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{extension.name}</h1>
            {extension.description ? <p className="mt-2 text-sm text-muted">{extension.description}</p> : null}
          </div>
          <ListExtensionRowMenu extensionId={extension.id} extensionName={extension.name} />
        </div>
      </div>

      <div className="border-b border-border px-8 py-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-muted">Type</span>
            <div className="mt-1 font-medium text-foreground">{typeLabel(extension.type)}</div>
          </div>
          <div>
            <span className="text-muted">Status</span>
            <div className="mt-1">
              <Badge tone={extension.status === "active" ? "ok" : "neutral"}>{extension.status}</Badge>
            </div>
          </div>
          <div>
            <span className="text-muted">Attributes</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {columns.map((attribute) => (
                <span
                  key={attribute}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {extensionAttributeLabel(attribute)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-muted">Records</span>
            <div className="mt-1 font-medium text-foreground">{extension.entries.length.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="px-8 py-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
              {columns.map((attribute) => (
                <th key={attribute} className="py-3 pr-4 font-medium">
                  {extensionAttributeLabel(attribute)}
                </th>
              ))}
              <th className="py-3 font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {extension.entries.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-16 text-center text-sm text-muted">
                  No records yet. Use Import to add list members.
                </td>
              </tr>
            ) : (
              extension.entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-background">
                  {columns.map((attribute) => (
                    <td key={attribute} className="py-4 pr-4 text-muted">
                      {getEntryAttributeValue(entry, attribute) ?? "—"}
                    </td>
                  ))}
                  <td className="py-4 text-muted">{format(new Date(entry.createdAt), "MMM d, yyyy")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
