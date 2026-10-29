import { prisma } from "@/lib/db";
import {
  authenticateAccount,
  createPasswordResetTokenValue,
  hashResetToken,
  normalizeEmail,
  setAccountPassword,
} from "@/lib/account-auth";
import { buildPasswordResetUrl, sendPasswordResetEmail } from "@/lib/auth-email";
import { isValidLoginIdentifier } from "@/lib/login-identifier";

export async function requestPasswordReset(emailRaw: string) {
  const email = normalizeEmail(emailRaw);
  const account = await prisma.account.findUnique({ where: { email } });

  if (account?.emailVerifiedAt) {
    const token = createPasswordResetTokenValue();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        accountId: account.id,
        tokenHash: hashResetToken(token),
        expiresAt,
      },
    });

    await sendPasswordResetEmail(email, buildPasswordResetUrl(token));
  }

  return {
    message:
      "If an account with a verified email exists, we sent a password reset link to that address.",
  };
}

export async function completePasswordReset(tokenRaw: string, password: string) {
  const token = tokenRaw.trim();
  if (!token) {
    return { ok: false as const, error: "Reset link is invalid or expired." };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
    include: { account: true },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, error: "Reset link is invalid or expired." };
  }

  if (!record.account.emailVerifiedAt) {
    return { ok: false as const, error: "This account email is not verified." };
  }

  const updated = await setAccountPassword(record.accountId, password);
  if (!updated.ok) {
    return { ok: false as const, error: updated.errors.join(" ") };
  }

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { ok: true as const };
}

export { authenticateAccount };