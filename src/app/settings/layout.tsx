import { SettingsSubnav } from "@/components/settings-subnav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-3.75rem)] bg-surface">
      <SettingsSubnav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
