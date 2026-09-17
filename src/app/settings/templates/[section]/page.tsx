import { SettingsJsonSectionRoute } from "@/components/settings-json-section-route";

type PageProps = { params: Promise<{ section: string }> };

export default async function Page({ params }: PageProps) {
  const { section } = await params;
  return <SettingsJsonSectionRoute areaId="templates" section={section} />;
}
