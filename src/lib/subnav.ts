export const SUBNAV_WIDTH_PX = 280;
export const MAIN_SIDEBAR_WIDTH_PX = 240;

export const HUB_SUBNAV_PATHS = ["/audience", "/content", "/analytics"] as const;

export function isHubSubnavPath(pathname: string) {
  return HUB_SUBNAV_PATHS.includes(pathname as (typeof HUB_SUBNAV_PATHS)[number]);
}

/**
 * Hub panel is only open on the section landing route.
 * Choosing a submenu navigates into a child path and the panel hides.
 */
export function hasHubSubnav(pathname: string) {
  return isHubSubnavPath(pathname);
}

export function isHubSectionPath(pathname: string, hub: (typeof HUB_SUBNAV_PATHS)[number]) {
  return pathname === hub || pathname.startsWith(`${hub}/`);
}

export const subnavContentOffsetClassName = "pl-[280px]";
