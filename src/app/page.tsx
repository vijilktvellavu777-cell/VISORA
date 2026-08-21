import { getHomeDashboard } from "@/lib/home";
import { normalizeDateRange } from "@/lib/dates";
import { HomeDashboard } from "@/components/home-dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; grain?: string }>;
}) {
  const params = await searchParams;
  const range = normalizeDateRange(params.from, params.to);
  const data = await getHomeDashboard(range.from, range.to, params.grain);
  return <HomeDashboard data={data} />;
}
