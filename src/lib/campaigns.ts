import { prisma } from "./db";
import { parsePushPayload, type PushPlatform } from "./campaign-message";
import { renderMessage } from "./messaging";
import { deliverPushNotification, isStalePushToken } from "./push-delivery";
import { resolveSegmentMembers } from "./workspace";

async function sendPushCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("Campaign not found");

  const payload = parsePushPayload(campaign.subject, campaign.body);
  const platforms = payload.platforms.length > 0 ? payload.platforms : (["web", "ios", "android"] as PushPlatform[]);
  const members = await resolveSegmentMembers(campaign.workspaceId, campaign.segmentId);
  const now = new Date();

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "sending" },
  });

  let count = 0;

  for (const customer of members) {
    const subscriptions = JSON.parse(customer.subscriptions || "{}") as Record<string, boolean>;
    if (subscriptions.push === false) continue;

    const devices = await prisma.device.findMany({
      where: {
        customerId: customer.id,
        workspaceId: campaign.workspaceId,
        platform: { in: platforms },
      },
    });

    if (devices.length === 0) continue;

    const title = renderMessage(payload.title || campaign.name, customer);
    const message = renderMessage(payload.message, customer);

    for (const device of devices) {
      const delivery = await deliverPushNotification({
        platform: device.platform as PushPlatform,
        token: device.token,
        title,
        body: message,
      });

      if (isStalePushToken(delivery)) {
        await prisma.device.delete({ where: { id: device.id } }).catch(() => undefined);
      }

      await prisma.campaignSend.create({
        data: {
          campaignId,
          customerId: customer.id,
          deviceId: device.id,
          status: delivery.status,
          channel: campaign.channel,
          subject: title,
          body: message,
          errorMessage: delivery.error ?? (delivery.simulated ? "Simulated delivery" : null),
          sentAt: delivery.success ? now : null,
        },
      });

      if (delivery.success) count += 1;
    }
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "sent", sentAt: now },
  });

  return { alreadySent: false, count, devices: count };
}

async function sendStandardCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("Campaign not found");

  const members = await resolveSegmentMembers(campaign.workspaceId, campaign.segmentId);
  const now = new Date();

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "sending" },
  });

  let count = 0;
  for (const customer of members) {
    const subscriptions = JSON.parse(customer.subscriptions || "{}") as Record<string, boolean>;
    if (subscriptions[campaign.channel] === false) continue;

    const body = renderMessage(campaign.body, customer);
    const subject = campaign.subject ? renderMessage(campaign.subject, customer) : null;

    await prisma.campaignSend.create({
      data: {
        campaignId,
        customerId: customer.id,
        status: "sent",
        channel: campaign.channel,
        subject,
        body,
        sentAt: now,
      },
    });
    count += 1;
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "sent", sentAt: now },
  });

  return { alreadySent: false, count };
}

export async function sendCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.status === "sent") {
    return { alreadySent: true, count: await prisma.campaignSend.count({ where: { campaignId } }) };
  }

  if (campaign.channel === "push") {
    return sendPushCampaign(campaignId);
  }

  return sendStandardCampaign(campaignId);
}

export async function enrollCanvas(canvasId: string) {
  const canvas = await prisma.canvas.findUnique({
    where: { id: canvasId },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!canvas) throw new Error("Canvas not found");

  const members = await resolveSegmentMembers(canvas.workspaceId, canvas.segmentId);
  let enrolled = 0;
  for (const customer of members) {
    await prisma.canvasEntry.upsert({
      where: { canvasId_customerId: { canvasId, customerId: customer.id } },
      create: { canvasId, customerId: customer.id, status: "active", stepIndex: 0 },
      update: {},
    });
    enrolled += 1;
  }
  await prisma.canvas.update({
    where: { id: canvasId },
    data: { status: "active" },
  });
  return { enrolled, steps: canvas.steps.length };
}
