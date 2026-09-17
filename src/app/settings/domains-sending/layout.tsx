import { SettingsAreaSectionLayout } from "@/components/settings-area-section-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SettingsAreaSectionLayout areaId="domains-sending">{children}</SettingsAreaSectionLayout>;
}
