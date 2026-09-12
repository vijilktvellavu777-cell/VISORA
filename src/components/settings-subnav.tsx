"use client";

import { HubPanelSubnav } from "@/components/hub-panel-subnav";
import { DEFAULT_SETTINGS_PATH, SETTINGS_NAV_SECTIONS } from "@/lib/settings-nav";

export function SettingsSubnav() {
  return (
    <HubPanelSubnav
      title="Settings"
      closeHref="/"
      sections={SETTINGS_NAV_SECTIONS}
      variant="inline"
    />
  );
}

export { DEFAULT_SETTINGS_PATH };
