import { SettingsAreaSectionLayout } from "@/components/settings-area-section-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SettingsAreaSectionLayout areaId="tracking-data">{children}</SettingsAreaSectionLayout>;
}
