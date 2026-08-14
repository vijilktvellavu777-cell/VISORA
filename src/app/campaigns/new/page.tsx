import { Suspense } from "react";
import NewCampaignPage from "./new-campaign-form";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading…</div>}>
      <NewCampaignPage />
    </Suspense>
  );
}
