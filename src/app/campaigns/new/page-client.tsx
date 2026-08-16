"use client";

import { useSearchParams } from "next/navigation";
import { EmailCampaignWizard } from "@/components/email-campaign-wizard";
import NewCampaignPage from "./new-campaign-form";

export default function NewCampaignRouter() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "email";

  if (type === "email") {
    return <EmailCampaignWizard />;
  }

  return <NewCampaignPage />;
}
