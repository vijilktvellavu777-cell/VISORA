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

function shouldSyncDefaultPassword() {
  if (process.env.VISORA_LOGIN_SYNC_PASSWORD === "false") return false;
  if (process.env.VISORA_LOGIN_SYNC_PASSWORD === "true") return true;
  return process.env.NODE_ENV !== "production";
}

async function main() {
  let workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { name: "VISORA", slug: "default" },
    });
  }

  const { username, email, password } = defaultAccountConfig();
  const validation = validatePassword(password);
  if (!validation.ok) {
    throw new Error(
      `VISORA_LOGIN_PASSWORD does not meet policy: ${validation.errors.join("; ")}`,
    );
  }

  const passwordHash = await hashPassword(password);
  const existing = await prisma.account.findUnique({ where: { username } });

  if (!existing) {
    await prisma.account.create({
      data: {
        workspaceId: workspace.id,
        username,
        email,
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`Created default login account: ${username} (${email})`);
    return;
  }

  if (shouldSyncDefaultPassword()) {
    await prisma.account.update({
      where: { id: existing.id },
      data: {
        email,
        passwordHash,
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
      },
    });
    console.log(`Synced default login password for ${username} (${email})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
