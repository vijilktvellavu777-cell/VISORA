"use client";

import { usePathname } from "next/navigation";
import { HubPanelSubnav } from "@/components/hub-panel-subnav";
import { CONTENT_NAV_SECTIONS } from "@/lib/content-nav";
import { hasHubSubnav } from "@/lib/subnav";

export function ContentSubnav() {
  const pathname = usePathname();
  if (!hasHubSubnav(pathname)) return null;

  return (
    <HubPanelSubnav
      title="Content"
      closeHref="/"
      sections={CONTENT_NAV_SECTIONS}
      variant="fixed"
    />
  );
}
