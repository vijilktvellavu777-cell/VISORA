import { AudienceSubnav } from "@/components/audience-subnav";

export default function AudienceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AudienceSubnav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
