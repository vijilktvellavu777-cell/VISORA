import { PrismaClient } from "@prisma/client";
import { sendCampaign } from "../src/lib/campaigns";

const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
  if (!workspace) throw new Error("Workspace not found");

  const customer = await prisma.customer.upsert({
    where: { workspaceId_externalId: { workspaceId: workspace.id, externalId: "push_test_user" } },
    create: {
      workspaceId: workspace.id,
      externalId: "push_test_user",
      email: "push@test.com",
      firstName: "Push",
      lastName: "Tester",
    },
    update: {},
  });

  await prisma.device.deleteMany({
    where: { workspaceId: workspace.id, customerId: { not: customer.id } },
  });
  await prisma.device.deleteMany({ where: { customerId: customer.id } });

  await prisma.device.create({
    data: {
      workspaceId: workspace.id,
      customerId: customer.id,
      platform: "web",
      token: "web_device_push_test",
    },
  });

  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name: "Push delivery test",
      channel: "push",
      status: "draft",
      subject: "Hello {{ first_name }}",
      body: JSON.stringify({
        message: "This is a test push for {{ first_name }}",
        platforms: ["web"],
      }),
    },
  });

  const result = await sendCampaign(campaign.id);
  const sends = await prisma.campaignSend.findMany({
    where: { campaignId: campaign.id },
    include: { device: true },
  });

  console.log("Send result:", result);
  console.log("Campaign sends:", sends.map((s) => ({
    status: s.status,
    device: s.device?.platform,
    error: s.errorMessage,
  })));

  if (result.count !== 1 || sends.length !== 1 || sends[0]?.status !== "sent") {
    throw new Error("Push delivery test failed");
  }

  console.log("Push delivery test passed");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
