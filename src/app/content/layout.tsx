import { ContentSubnav } from "@/components/content-subnav";
import { SubnavContentOffset } from "@/components/subnav-content-offset";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ContentSubnav />
      <SubnavContentOffset>{children}</SubnavContentOffset>
    </>
  );
}
