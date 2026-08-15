import { AnalyticsSubnav } from "@/components/analytics-subnav";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AnalyticsSubnav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
