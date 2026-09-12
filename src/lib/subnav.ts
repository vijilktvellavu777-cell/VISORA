export const SUBNAV_WIDTH_PX = 220;
export const MAIN_SIDEBAR_WIDTH_PX = 240;

export const HUB_SUBNAV_PATHS = ["/audience", "/content", "/analytics"] as const;

export function isHubSubnavPath(pathname: string) {
  return HUB_SUBNAV_PATHS.includes(pathname as (typeof HUB_SUBNAV_PATHS)[number]);
}

export function hasHubSubnav(pathname: string) {
  return HUB_SUBNAV_PATHS.some((hub) => pathname === hub || pathname.startsWith(`${hub}/`));
}

export function isHubSectionPath(pathname: string, hub: (typeof HUB_SUBNAV_PATHS)[number]) {
  return pathname === hub || pathname.startsWith(`${hub}/`);
}

export const subnavPanelClassName =
  "fixed inset-y-0 z-20 w-[220px] shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 py-6 text-white";

export const subnavPanelStyle = { left: `${MAIN_SIDEBAR_WIDTH_PX}px` };

export const subnavContentOffsetClassName = "pl-[220px]";
