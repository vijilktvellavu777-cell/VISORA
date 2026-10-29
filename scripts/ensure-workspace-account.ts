import { PrismaClient } from "@prisma/client";
import { hashPassword, normalizeEmail, normalizeUsername } from "../src/lib/account-auth";
import { validatePassword } from "../src/lib/password-policy";

const prisma = new PrismaClient();

function defaultAccountConfig() {
  const username = normalizeUsername(process.env.VISORA_LOGIN_USERNAME ?? "admin");
  const email = normalizeEmail(process.env.VISORA_LOGIN_EMAIL ?? "admin@visora.local");
  const password = process.env.VISORA_LOGIN_PASSWORD ?? "VisoraAdmin1!";
  return { username, email, password };
}

async function main() {
  let workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { name: "VISORA", slug: "default" },
    });
  }

  const existing = await prisma.account.findFirst({ where: { workspaceId: workspace.id } });
  if (existing) return;

  const { username, email, password } = defaultAccountConfig();
  const validation = validatePassword(password);
  if (!validation.ok) {
    throw new Error(
      `VISORA_LOGIN_PASSWORD does not meet policy: ${validation.errors.join("; ")}`,
    );
  }

  await prisma.account.create({
    data: {
      workspaceId: workspace.id,
      username,
      email,
      passwordHash: await hashPassword(password),
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Created default login account: ${username} (${email})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
