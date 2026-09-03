"use client";

import { useSearchParams } from "next/navigation";
import { ChannelCampaignWizard } from "@/components/channel-campaign-wizard";
import { EmailCampaignWizard } from "@/components/email-campaign-wizard";
import NewCampaignPage from "./new-campaign-form";

export default function NewCampaignRouter() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "email";
  const fresh = searchParams.get("fresh") === "1";

  if (type === "email") {
    return <EmailCampaignWizard fresh={fresh} />;
  }

  if (type === "push") {
    return <ChannelCampaignWizard channel="push" fresh={fresh} />;
  }

  if (type === "in_app") {
    return <ChannelCampaignWizard channel="in_app" fresh={fresh} />;
  }

  if (type === "whatsapp") {
    return <ChannelCampaignWizard channel="whatsapp" fresh={fresh} />;
  }

  return <NewCampaignPage />;
}
