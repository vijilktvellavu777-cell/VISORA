"use client";

import { usePathname } from "next/navigation";
import { isHubSubnavPath, subnavContentOffsetClassName } from "@/lib/subnav";

export function SubnavContentOffset({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={isHubSubnavPath(pathname) ? subnavContentOffsetClassName : undefined}>
      {children}
    </div>
  );
}
