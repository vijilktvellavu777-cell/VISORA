import { prisma } from "@/lib/db";
import { hashPassword, normalizeEmail, normalizeUsername } from "@/lib/account-auth";
import { validatePassword } from "@/lib/password-policy";

export function defaultAccountConfig() {
  const username = normalizeUsername(process.env.VISORA_LOGIN_USERNAME ?? "admin");
  const email = normalizeEmail(process.env.VISORA_LOGIN_EMAIL ?? "admin@visora.local");
  const password = process.env.VISORA_LOGIN_PASSWORD ?? "VisoraAdmin1!";
  return { username, email, password };
}

export function shouldSyncDefaultPassword() {
  if (process.env.VISORA_LOGIN_SYNC_PASSWORD === "false") return false;
  if (process.env.VISORA_LOGIN_SYNC_PASSWORD === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export async function ensureDefaultWorkspaceAccount(options?: { syncPassword?: boolean }) {
  const syncPassword = options?.syncPassword ?? shouldSyncDefaultPassword();

  let workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { name: "VISORA", slug: "default" },
    });
  }

  const { username, email, password } = defaultAccountConfig();
  const validation = validatePassword(password);
  if (!validation.ok) {
    throw new Error(`VISORA_LOGIN_PASSWORD does not meet policy: ${validation.errors.join("; ")}`);
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
    return { created: true, syncedPassword: true, username, email };
  }

  if (syncPassword) {
    await prisma.account.update({
      where: { id: existing.id },
      data: {
        email,
        passwordHash,
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
      },
    });
    return { created: false, syncedPassword: true, username, email };
  }

  return { created: false, syncedPassword: false, username, email };
}
