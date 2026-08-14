import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.campaignSend.deleteMany();
  await prisma.canvasEntry.deleteMany();
  await prisma.canvasStep.deleteMany();
  await prisma.canvas.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.event.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: { name: "VISORA", slug: "default" },
  });

  const apiKey = await prisma.apiKey.create({
    data: {
      workspaceId: workspace.id,
      name: "SDK / REST key",
      key: "visora_sk_local",
    },
  });

  console.log("Workspace ready:", workspace.slug);
  console.log("API key:", apiKey.key);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
