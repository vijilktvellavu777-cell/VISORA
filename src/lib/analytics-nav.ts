import { BarChart3, Hammer, LineChart } from "lucide-react";
import type { HubPanelNavSection } from "@/components/hub-panel-subnav";

export const ANALYTICS_NAV_SECTIONS: HubPanelNavSection[] = [
  {
    id: "reports",
    title: "Reports",
    icon: BarChart3,
    items: [
      { href: "/analytics/reports/report-builder", label: "Report builder" },
      { href: "/analytics/reports/custom-event-report", label: "Custom event report" },
      { href: "/analytics/reports/engagement-report", label: "Engagement report" },
      { href: "/analytics/reports/revenue-report", label: "Revenue report" },
      { href: "/analytics/reports/segment-report", label: "Segment report" },
    ],
  },
  {
    id: "performance",
    title: "Analytics",
    icon: LineChart,
    items: [
      { href: "/analytics/performance/campaign-performance", label: "Campaign performance" },
      { href: "/analytics/performance/conversions", label: "Conversions" },
    ],
  },
  {
    id: "data-build",
    title: "Data build",
    icon: Hammer,
    items: [
      { href: "/analytics/data-build/custom-report", label: "Custom report" },
      { href: "/analytics/data-build/designs", label: "Designs" },
    ],
  },
];
