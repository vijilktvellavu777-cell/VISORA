import { SettingsAreaSectionLayout } from "@/components/settings-area-section-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SettingsAreaSectionLayout areaId="billing-usage">{children}</SettingsAreaSectionLayout>;
}
