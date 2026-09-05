import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.suppressionEntry.deleteMany();
  await prisma.suppressionList.deleteMany();
  await prisma.listExtension.deleteMany();
  await prisma.planTask.deleteMany();
  await prisma.planProject.deleteMany();
  await prisma.contentTemplate.deleteMany();
  await prisma.contentFile.deleteMany();
  await prisma.campaignSend.deleteMany();
  await prisma.canvasEntry.deleteMany();
  await prisma.canvasStep.deleteMany();
  await prisma.canvas.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.device.deleteMany();
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
      keyType: "secret",
    },
  });

  const publishableKey = await prisma.apiKey.create({
    data: {
      workspaceId: workspace.id,
      name: "Browser SDK key",
      key: "visora_pk_local",
      keyType: "publishable",
    },
  });

  const welcomeBody = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:32px;font-family:Segoe UI,sans-serif;background:#f8fafc;">
    <h1 style="color:#4f46e5;">Welcome to VISORA</h1>
    <p>Hi {{ first_name }}, thanks for joining us.</p>
  </body>
</html>`;

  const dragDropBody = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Segoe UI,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td align="center" style="padding:24px;">
        <table role="presentation" width="600" style="background:#fff;border-radius:12px;padding:32px;">
          <tr><td>
            <h1 style="font-size:28px;color:#0f172a;">Your headline here</h1>
            <p style="font-size:16px;color:#334155;">Write your message here.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  await prisma.messageTemplate.createMany({
    data: [
      {
        workspaceId: workspace.id,
        name: "Test_DZ",
        channel: "email",
        subject: "Test template",
        body: dragDropBody,
        editorType: "drag-drop",
        createdBy: "Deborah Zanardi",
        source: "saved",
        updatedAt: new Date("2026-07-22T12:22:00"),
        createdAt: new Date("2026-07-22T12:22:00"),
      },
      {
        workspaceId: workspace.id,
        name: "Welcome",
        channel: "email",
        subject: "Welcome to VISORA",
        body: welcomeBody,
        editorType: "html",
        createdBy: "Narasimha Sakhamuri",
        source: "saved",
        updatedAt: new Date("2026-07-13T03:24:00"),
        createdAt: new Date("2026-07-13T03:24:00"),
      },
      {
        workspaceId: workspace.id,
        name: "Product launch",
        channel: "email",
        subject: "Introducing something new",
        body: welcomeBody,
        editorType: "html",
        createdBy: "VISORA",
        source: "visora",
      },
      {
        workspaceId: workspace.id,
        name: "Newsletter",
        channel: "email",
        subject: "Your monthly update",
        body: dragDropBody,
        editorType: "drag-drop",
        createdBy: "VISORA",
        source: "visora",
      },
      {
        workspaceId: workspace.id,
        name: "Re-engagement",
        channel: "email",
        subject: "We miss you",
        body: welcomeBody,
        editorType: "html",
        createdBy: "VISORA",
        source: "visora",
      },
      {
        workspaceId: workspace.id,
        name: "Promotional offer",
        channel: "email",
        subject: "Special offer inside",
        body: dragDropBody,
        editorType: "drag-drop",
        createdBy: "VISORA",
        source: "visora",
      },
      {
        workspaceId: workspace.id,
        name: "Order confirmation",
        channel: "email",
        subject: "Your order is confirmed",
        body: welcomeBody,
        editorType: "html",
        createdBy: "VISORA",
        source: "visora",
      },
    ],
  });

  console.log("Workspace ready:", workspace.slug);
  console.log("Secret API key:", apiKey.key);
  console.log("Publishable SDK key:", publishableKey.key);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
