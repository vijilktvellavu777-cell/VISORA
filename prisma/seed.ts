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
    data: { name: "VISORA Demo", slug: "demo" },
  });

  const apiKey = await prisma.apiKey.create({
    data: {
      workspaceId: workspace.id,
      name: "SDK / REST key",
      key: "visora_demo_sk_live_replace_me",
    },
  });

  const now = Date.now();
  const days = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);

  const customers = await Promise.all(
    [
      {
        externalId: "usr_maya",
        email: "maya@northwind.example",
        firstName: "Maya",
        lastName: "Chen",
        country: "US",
        attributes: { plan: "pro", ltv: 840, city: "Austin" },
        lastSeenAt: days(0),
      },
      {
        externalId: "usr_jonah",
        email: "jonah@northwind.example",
        firstName: "Jonah",
        lastName: "Adeyemi",
        country: "NG",
        attributes: { plan: "free", ltv: 0, city: "Lagos" },
        lastSeenAt: days(2),
      },
      {
        externalId: "usr_priya",
        email: "priya@northwind.example",
        firstName: "Priya",
        lastName: "Nair",
        country: "IN",
        attributes: { plan: "pro", ltv: 210, city: "Bengaluru" },
        lastSeenAt: days(1),
      },
      {
        externalId: "usr_leo",
        email: "leo@northwind.example",
        firstName: "Leo",
        lastName: "Martinez",
        country: "MX",
        attributes: { plan: "starter", ltv: 49, city: "CDMX" },
        lastSeenAt: days(12),
        subscriptions: { email: true, push: false, sms: true, in_app: true },
      },
      {
        externalId: "usr_hana",
        email: "hana@northwind.example",
        firstName: "Hana",
        lastName: "Sato",
        country: "JP",
        attributes: { plan: "pro", ltv: 1260, city: "Tokyo" },
        lastSeenAt: days(0),
      },
    ].map((row) =>
      prisma.customer.create({
        data: {
          workspaceId: workspace.id,
          externalId: row.externalId,
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          country: row.country,
          attributes: JSON.stringify(row.attributes),
          lastSeenAt: row.lastSeenAt,
          subscriptions: JSON.stringify(
            row.subscriptions ?? { email: true, push: true, sms: true, in_app: true },
          ),
        },
      }),
    ),
  );

  const byExt = Object.fromEntries(customers.map((c) => [c.externalId, c]));

  const events: { user: string; name: string; daysAgo: number; properties?: Record<string, unknown> }[] = [
    { user: "usr_maya", name: "app_open", daysAgo: 0 },
    { user: "usr_maya", name: "purchase", daysAgo: 3, properties: { amount: 49, sku: "pro_month" } },
    { user: "usr_maya", name: "viewed_pricing", daysAgo: 4 },
    { user: "usr_jonah", name: "app_open", daysAgo: 2 },
    { user: "usr_jonah", name: "signup", daysAgo: 14 },
    { user: "usr_priya", name: "purchase", daysAgo: 8, properties: { amount: 49, sku: "pro_month" } },
    { user: "usr_priya", name: "app_open", daysAgo: 1 },
    { user: "usr_leo", name: "signup", daysAgo: 40 },
    { user: "usr_leo", name: "app_open", daysAgo: 12 },
    { user: "usr_hana", name: "purchase", daysAgo: 1, properties: { amount: 490, sku: "pro_year" } },
    { user: "usr_hana", name: "app_open", daysAgo: 0 },
    { user: "usr_hana", name: "referred_friend", daysAgo: 6 },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: {
        workspaceId: workspace.id,
        customerId: byExt[event.user].id,
        name: event.name,
        properties: JSON.stringify(event.properties ?? {}),
        occurredAt: days(event.daysAgo),
      },
    });
  }

  const proUsers = await prisma.segment.create({
    data: {
      workspaceId: workspace.id,
      name: "Pro plan",
      description: "Customers whose plan attribute is pro",
      rules: JSON.stringify({
        op: "and",
        filters: [{ kind: "attribute", field: "plan", op: "eq", value: "pro" }],
      }),
    },
  });

  const recentPurchasers = await prisma.segment.create({
    data: {
      workspaceId: workspace.id,
      name: "Purchased in last 14 days",
      description: "Anyone who fired a purchase event recently",
      rules: JSON.stringify({
        op: "and",
        filters: [{ kind: "event", name: "purchase", op: "performed", days: 14 }],
      }),
    },
  });

  await prisma.segment.create({
    data: {
      workspaceId: workspace.id,
      name: "Free, no purchase",
      description: "Free plan users who have never purchased",
      rules: JSON.stringify({
        op: "and",
        filters: [
          { kind: "attribute", field: "plan", op: "eq", value: "free" },
          { kind: "event", name: "purchase", op: "not_performed" },
        ],
      }),
    },
  });

  const welcome = await prisma.messageTemplate.create({
    data: {
      workspaceId: workspace.id,
      name: "Welcome email",
      channel: "email",
      subject: "Welcome to VISORA, {{ first_name }}",
      body: "Hi {{ first_name }}, thanks for joining. Your workspace is ready.",
    },
  });

  await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name: "Pro upsell — email",
      description: "Nudge free users toward Pro",
      channel: "email",
      status: "draft",
      subject: "{{ first_name }}, unlock campaigns and journeys",
      body: "Hi {{ first_name }},\n\nYou are on the free plan. Upgrade to Pro to send multi-channel campaigns from VISORA.\n\n— The VISORA team",
      segmentId: (
        await prisma.segment.findFirst({ where: { name: "Free, no purchase" } })
      )?.id,
      templateId: welcome.id,
    },
  });

  await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name: "Purchase thank-you",
      description: "Sent to recent purchasers",
      channel: "push",
      status: "draft",
      body: "Thanks for your purchase, {{ first_name }}. We saved your receipt.",
      segmentId: recentPurchasers.id,
    },
  });

  const canvas = await prisma.canvas.create({
    data: {
      workspaceId: workspace.id,
      name: "Onboarding — first 7 days",
      description: "Welcome, then a feature nudge, then an upgrade prompt",
      status: "draft",
      segmentId: proUsers.id,
    },
  });

  await prisma.canvasStep.createMany({
    data: [
      {
        canvasId: canvas.id,
        order: 0,
        type: "message",
        name: "Welcome email",
        config: JSON.stringify({
          channel: "email",
          subject: "Welcome, {{ first_name }}",
          body: "You are on Pro. Start with a segment, then a campaign.",
        }),
      },
      {
        canvasId: canvas.id,
        order: 1,
        type: "delay",
        name: "Wait 2 days",
        config: JSON.stringify({ hours: 48 }),
      },
      {
        canvasId: canvas.id,
        order: 2,
        type: "message",
        name: "Feature nudge",
        config: JSON.stringify({
          channel: "in_app",
          body: "{{ first_name }}, try Canvas to automate this journey.",
        }),
      },
    ],
  });

  console.log("Seeded workspace", workspace.slug);
  console.log("API key:", apiKey.key);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
