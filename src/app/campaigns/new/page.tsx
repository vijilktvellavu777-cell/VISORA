import { Suspense } from "react";
import NewCampaignRouter from "./page-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading…</div>}>
      <NewCampaignRouter />
    </Suspense>
  );
}
