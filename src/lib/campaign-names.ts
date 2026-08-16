import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

export const DUPLICATE_CAMPAIGN_NAME_ERROR = "A campaign with this name already exists.";

export class DuplicateCampaignNameError extends Error {
  constructor(message = DUPLICATE_CAMPAIGN_NAME_ERROR) {
    super(message);
    this.name = "DuplicateCampaignNameError";
  }
}

type DbClient = PrismaClient | Prisma.TransactionClient;

export function normalizeCampaignName(name: string) {
  return name.trim().toLowerCase();
}

export async function findCampaignWithName(
  workspaceId: string,
  name: string,
  excludeId?: string,
  db: DbClient = prisma,
) {
  const target = normalizeCampaignName(name);
  if (!target) return null;

  const campaigns = await db.campaign.findMany({
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
  db: DbClient = prisma,
) {
  const trimmed = baseName.trim() || "Untitled campaign";
  let candidate = trimmed;
  let counter = 2;

  while (await findCampaignWithName(workspaceId, candidate, excludeId, db)) {
    candidate = `${trimmed} (${counter})`;
    counter += 1;
  }

  return candidate;
}

type CreateCampaignData = Omit<Prisma.CampaignUncheckedCreateInput, "workspaceId" | "name">;

export async function createCampaignRecord(
  workspaceId: string,
  requestedName: string,
  data: CreateCampaignData,
  options?: { autoUniqueName?: boolean },
) {
  return prisma.$transaction(async (tx) => {
    const trimmed = requestedName.trim() || "Untitled campaign";
    let name = trimmed;

    if (options?.autoUniqueName) {
      name = await uniqueCampaignName(workspaceId, trimmed, undefined, tx);
    } else {
      const duplicate = await findCampaignWithName(workspaceId, trimmed, undefined, tx);
      if (duplicate) {
        throw new DuplicateCampaignNameError();
      }
    }

    return tx.campaign.create({
      data: {
        ...data,
        workspaceId,
        name,
      },
    });
  });
}

export const EMAIL_WIZARD_DRAFT_KEY = "visora-email-wizard-draft-id";
export const EMAIL_WIZARD_CREATING_KEY = "visora-email-wizard-creating";

export function clearEmailWizardDraftSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(EMAIL_WIZARD_DRAFT_KEY);
  sessionStorage.removeItem(EMAIL_WIZARD_CREATING_KEY);
}

export async function waitForEmailWizardDraftId(timeoutMs = 5000) {
  if (typeof window === "undefined") return null;

  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const draftId = sessionStorage.getItem(EMAIL_WIZARD_DRAFT_KEY);
    if (draftId) return draftId;
    if (sessionStorage.getItem(EMAIL_WIZARD_CREATING_KEY) !== "1") return null;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return sessionStorage.getItem(EMAIL_WIZARD_DRAFT_KEY);
}
