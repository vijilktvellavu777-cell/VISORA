"use client";

import { usePathname } from "next/navigation";
import { HubPanelSubnav } from "@/components/hub-panel-subnav";
import { ANALYTICS_NAV_SECTIONS } from "@/lib/analytics-nav";
import { hasHubSubnav } from "@/lib/subnav";

export function AnalyticsSubnav() {
  const pathname = usePathname();
  if (!hasHubSubnav(pathname)) return null;

  return (
    <HubPanelSubnav
      title="Analytics"
      closeHref="/"
      sections={ANALYTICS_NAV_SECTIONS}
      variant="fixed"
    />
  );
}
