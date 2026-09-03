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

export const PUSH_WIZARD_DRAFT_KEY = "visora-push-wizard-draft-id";
export const PUSH_WIZARD_CREATING_KEY = "visora-push-wizard-creating";
export const IN_APP_WIZARD_DRAFT_KEY = "visora-in-app-wizard-draft-id";
export const IN_APP_WIZARD_CREATING_KEY = "visora-in-app-wizard-creating";
export const WHATSAPP_WIZARD_DRAFT_KEY = "visora-whatsapp-wizard-draft-id";
export const WHATSAPP_WIZARD_CREATING_KEY = "visora-whatsapp-wizard-creating";

type WizardChannel = "push" | "in_app" | "whatsapp";

const WIZARD_DRAFT_KEYS: Record<WizardChannel, string> = {
  push: PUSH_WIZARD_DRAFT_KEY,
  in_app: IN_APP_WIZARD_DRAFT_KEY,
  whatsapp: WHATSAPP_WIZARD_DRAFT_KEY,
};

const WIZARD_CREATING_KEYS: Record<WizardChannel, string> = {
  push: PUSH_WIZARD_CREATING_KEY,
  in_app: IN_APP_WIZARD_CREATING_KEY,
  whatsapp: WHATSAPP_WIZARD_CREATING_KEY,
};

export function clearChannelWizardDraftSession(channel: WizardChannel) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(WIZARD_DRAFT_KEYS[channel]);
  sessionStorage.removeItem(WIZARD_CREATING_KEYS[channel]);
}

export async function waitForChannelWizardDraftId(channel: WizardChannel, timeoutMs = 5000) {
  if (typeof window === "undefined") return null;

  const draftKey = WIZARD_DRAFT_KEYS[channel];
  const creatingKey = WIZARD_CREATING_KEYS[channel];
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const draftId = sessionStorage.getItem(draftKey);
    if (draftId) return draftId;
    if (sessionStorage.getItem(creatingKey) !== "1") return null;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return sessionStorage.getItem(draftKey);
}
