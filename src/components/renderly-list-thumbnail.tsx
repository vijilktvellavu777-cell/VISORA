"use client";

import { Bell, Mail, MessageCircle, Smartphone } from "lucide-react";
import { isEmailHtmlBody } from "@/lib/renderly-body";
import { prepareEmailHtmlForPreview } from "@/lib/email-render";

type Props = {
  body: string;
  name: string;
  className?: string;
};

function PlaceholderThumb({ label, icon: Icon }: { label: string; icon: typeof Mail }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-background px-1 text-center">
      <Icon size={16} className="text-muted" />
      <span className="text-[9px] font-medium leading-tight text-muted">{label}</span>
    </div>
  );
}

export function RenderlyListThumbnail({ body, name, className = "" }: Props) {
  const trimmed = body.trim();
  const showEmailFrame = isEmailHtmlBody(body);
  const srcDoc = showEmailFrame ? prepareEmailHtmlForPreview(body) : "";

  let placeholder: { label: string; icon: typeof Mail } = { label: "Email", icon: Mail };
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as { platforms?: string[]; platformCategory?: string };
      if (parsed.platformCategory === "mobile" || parsed.platforms?.length) {
        placeholder = { label: "Push", icon: Bell };
      } else {
        placeholder = { label: "In-app", icon: Smartphone };
      }
    } catch {
      placeholder = { label: "Message", icon: MessageCircle };
    }
  } else if (!trimmed) {
    placeholder = { label: "Empty", icon: Mail };
  }

  return (
    <div
      className={`h-14 w-[72px] shrink-0 overflow-hidden rounded-md border border-border bg-white ${className}`}
      aria-hidden
    >
      {srcDoc ? (
        <iframe
          title={`Thumbnail ${name}`}
          srcDoc={srcDoc}
          className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-50 border-0 bg-white"
          sandbox="allow-same-origin"
          tabIndex={-1}
        />
      ) : (
        <PlaceholderThumb {...placeholder} />
      )}
    </div>
  );
}
