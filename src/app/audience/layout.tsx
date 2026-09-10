import { AudienceSubnav } from "@/components/audience-subnav";
import { SubnavContentOffset } from "@/components/subnav-content-offset";

export default function AudienceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AudienceSubnav />
      <SubnavContentOffset>{children}</SubnavContentOffset>
    </>
  );
}
