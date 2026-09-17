import { GeneralSettingsSectionView } from "@/components/general-settings-section-views";

type PageProps = { params: Promise<{ section: string }> };

export default async function SettingsGeneralSectionPage({ params }: PageProps) {
  const { section } = await params;
  return <GeneralSettingsSectionView section={section} />;
}
