"use client";

import { SettingsSectionSubnav } from "@/components/settings-section-subnav";
import { getSettingsArea } from "@/lib/settings-area-sections";

export function SettingsAreaSectionLayout({
  areaId,
  children,
}: {
  areaId: string;
  children: React.ReactNode;
}) {
  const area = getSettingsArea(areaId);
  if (!area) {
    return <div className="min-w-0 flex-1">{children}</div>;
  }

  return (
    <div className="flex min-h-full min-w-0 flex-1">
      <SettingsSectionSubnav
        title={area.title}
        icon={area.icon}
        basePath={area.basePath}
        sections={area.sections}
      />
      <div className="min-w-0 flex-1 bg-background">{children}</div>
    </div>
  );
}
