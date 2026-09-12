"use client";

import { usePathname } from "next/navigation";
import { hasHubSubnav, subnavContentOffsetClassName } from "@/lib/subnav";

export function SubnavContentOffset({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={hasHubSubnav(pathname) ? subnavContentOffsetClassName : undefined}>
      {children}
    </div>
  );
}
