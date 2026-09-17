import { WorkspaceSettingsSectionView } from "@/components/workspace-settings-section-views";

type PageProps = { params: Promise<{ section: string }> };

export default async function SettingsWorkspaceSectionPage({ params }: PageProps) {
  const { section } = await params;
  return <WorkspaceSettingsSectionView section={section} />;
}
