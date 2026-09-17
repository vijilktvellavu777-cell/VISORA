import type { RenderlyCampaignMetrics } from "@/lib/renderly-metrics";

export type RenderlyCampaignListItem = {
  id: string;
  name: string;
  subject: string | null;
  preheader: string | null;
  body: string;
  tags: string[];
  status: string;
  updatedAt: string;
  projectAddress: string;
  metrics: RenderlyCampaignMetrics;
};
