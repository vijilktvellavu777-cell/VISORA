import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
  if (!workspace) return;

  const publishable = await prisma.apiKey.findUnique({ where: { key: "visora_pk_local" } });
  if (!publishable) {
    await prisma.apiKey.create({
      data: {
        workspaceId: workspace.id,
        name: "Browser SDK key",
        key: "visora_pk_local",
        keyType: "publishable",
      },
    });
    console.log("Created publishable SDK key: visora_pk_local");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
