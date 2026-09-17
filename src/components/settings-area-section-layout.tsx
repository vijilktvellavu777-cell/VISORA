"use client";

import { usePathname } from "next/navigation";
import { SettingsSectionSubnav } from "@/components/settings-section-subnav";
import { getSettingsArea } from "@/lib/settings-area-sections";

export function SettingsAreaSectionLayout({
  areaId,
  children,
}: {
  areaId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const area = getSettingsArea(areaId);
  if (!area) {
    return <div className="min-w-0 flex-1">{children}</div>;
  }

  const showSectionSubnav =
    pathname === area.basePath || pathname.startsWith(`${area.basePath}/`);

  return (
    <div className="flex min-h-full min-w-0 flex-1">
      {showSectionSubnav ? (
        <SettingsSectionSubnav
          title={area.title}
          icon={area.icon}
          basePath={area.basePath}
          sections={area.sections}
        />
      ) : null}
      <div className="min-w-0 flex-1 bg-background">{children}</div>
    </div>
  );
}
