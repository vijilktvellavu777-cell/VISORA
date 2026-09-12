"use client";

import { usePathname } from "next/navigation";
import { HubPanelSubnav } from "@/components/hub-panel-subnav";
import { AUDIENCE_NAV_SECTIONS } from "@/lib/audience-nav";
import { hasHubSubnav } from "@/lib/subnav";

export function AudienceSubnav() {
  const pathname = usePathname();
  if (!hasHubSubnav(pathname)) return null;

  return (
    <HubPanelSubnav
      title="Audience"
      closeHref="/"
      sections={AUDIENCE_NAV_SECTIONS}
      variant="fixed"
    />
  );
}
