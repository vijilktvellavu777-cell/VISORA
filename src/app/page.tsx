import { getHomeDashboard } from "@/lib/home";
import { HomeDashboard } from "@/components/home-dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; grain?: string }>;
}) {
  const params = await searchParams;
  const data = await getHomeDashboard(params.from, params.to, params.grain);
  return <HomeDashboard data={data} />;
}
