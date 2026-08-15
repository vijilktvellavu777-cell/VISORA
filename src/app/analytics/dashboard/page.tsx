import { redirect } from "next/navigation";

export default function AnalyticsDashboardRedirectPage() {
  redirect("/analytics/performance/campaign-performance");
}
