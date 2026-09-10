import { AnalyticsSubnav } from "@/components/analytics-subnav";
import { SubnavContentOffset } from "@/components/subnav-content-offset";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnalyticsSubnav />
      <SubnavContentOffset>{children}</SubnavContentOffset>
    </>
  );
}
