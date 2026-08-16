import { prisma } from "@/lib/db";

export const DUPLICATE_CAMPAIGN_NAME_ERROR = "A campaign with this name already exists.";

export function normalizeCampaignName(name: string) {
  return name.trim().toLowerCase();
}

export async function findCampaignWithName(
  workspaceId: string,
  name: string,
  excludeId?: string,
) {
  const target = normalizeCampaignName(name);
  if (!target) return null;

  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId },
    select: { id: true, name: true },
  });

  return (
    campaigns.find(
      (campaign) =>
        campaign.id !== excludeId && normalizeCampaignName(campaign.name) === target,
    ) ?? null
  );
}

export async function uniqueCampaignName(
  workspaceId: string,
  baseName: string,
  excludeId?: string,
) {
  const trimmed = baseName.trim() || "Untitled campaign";
  let candidate = trimmed;
  let counter = 2;

  while (await findCampaignWithName(workspaceId, candidate, excludeId)) {
    candidate = `${trimmed} (${counter})`;
    counter += 1;
  }

  return candidate;
}
