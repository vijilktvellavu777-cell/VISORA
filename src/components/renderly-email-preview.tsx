"use client";

import { prepareEmailHtmlForPreview } from "@/lib/email-render";

export type RenderlyPreviewMode = "desktop" | "mobile";

export function RenderlyEmailPreviewFrame({
  html,
  title,
  viewMode = "desktop",
  className = "",
}: {
  html: string;
  title: string;
  viewMode?: RenderlyPreviewMode;
  className?: string;
}) {
  const srcDoc = prepareEmailHtmlForPreview(html);

  return (
    <div
      className={`overflow-hidden rounded-md border border-border bg-white ${
        viewMode === "mobile" ? "max-w-[375px]" : "w-full"
      } ${className}`}
    >
      {srcDoc ? (
        <iframe
          title={title}
          srcDoc={srcDoc}
          className="h-full min-h-[48px] w-full border-0 bg-white"
          sandbox="allow-same-origin"
        />
      ) : (
        <div className="flex min-h-[48px] items-center justify-center px-3 text-xs text-muted">
          No preview
        </div>
      )}
    </div>
  );
}
