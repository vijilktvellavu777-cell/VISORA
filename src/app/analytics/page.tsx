import { redirect } from "next/navigation";

export default function AnalyticsIndexPage() {
  redirect("/analytics/reports/report-builder");
}
