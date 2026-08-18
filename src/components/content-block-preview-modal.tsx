"use client";

import { format } from "date-fns";
import { X } from "lucide-react";
import { contentBlockTypeLabel } from "@/lib/content-blocks";
import type { ContentBlockRow } from "@/components/content-blocks-page";

type Props = {
  block: ContentBlockRow;
  onClose: () => void;
};

export function ContentBlockPreviewModal({ block, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Preview: {block.name}</h2>
            <p className="mt-1 text-sm text-muted">{contentBlockTypeLabel(block.blockType)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="min-h-0 flex-1 overflow-auto bg-background px-6 py-8">
            <div className="mx-auto flex min-h-full max-w-3xl items-start justify-center">
              <div className="w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                {block.body.trim() ? (
                  <iframe
                    title={`Preview ${block.name}`}
                    srcDoc={block.body}
                    className="h-[min(720px,60vh)] w-full border-0 bg-white"
                    sandbox=""
                  />
                ) : block.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={block.imageUrl}
                    alt={block.name}
                    className="max-h-[min(720px,60vh)] w-full object-contain"
                  />
                ) : (
                  <div className="flex h-[min(420px,50vh)] items-center justify-center px-6 text-sm text-muted">
                    No content available for preview.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="w-full shrink-0 border-t border-border bg-surface px-6 py-6 lg:w-[280px] lg:border-l lg:border-t-0">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-muted">Status</dt>
                <dd className="mt-1 capitalize text-foreground">{block.status}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Inclusion count</dt>
                <dd className="mt-1 text-foreground">{block.inclusionCount}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Last edited</dt>
                <dd className="mt-1 text-foreground">{format(new Date(block.updatedAt), "MMM d, yyyy")}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
