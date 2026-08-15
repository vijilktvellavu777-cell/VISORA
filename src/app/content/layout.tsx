import { ContentSubnav } from "@/components/content-subnav";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ContentSubnav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
