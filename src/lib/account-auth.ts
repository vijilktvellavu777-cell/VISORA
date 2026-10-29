import { createHash, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { prisma } from "@/lib/db";
import { validatePassword } from "@/lib/password-policy";
import { isValidLoginIdentifier } from "@/lib/login-identifier";

export { isValidLoginIdentifier } from "@/lib/login-identifier";

const scryptAsync = promisify(scrypt);

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algo, salt, hashHex] = storedHash.split(":");
  if (algo !== "scrypt" || !salt || !hashHex) return false;

  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hashHex, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export async function authenticateAccount(identifier: string, password: string) {
  const trimmed = identifier.trim();
  if (!isValidLoginIdentifier(trimmed)) return null;

  const normalized = trimmed.includes("@") ? normalizeEmail(trimmed) : normalizeUsername(trimmed);
  const account = await prisma.account.findFirst({
    where: trimmed.includes("@") ? { email: normalized } : { username: normalized },
  });
  if (!account) return null;
  if (!(await verifyPassword(password, account.passwordHash))) return null;
  return account;
}

export async function setAccountPassword(accountId: string, password: string) {
  const validation = validatePassword(password);
  if (!validation.ok) {
    return { ok: false as const, errors: validation.errors };
  }

  const passwordHash = await hashPassword(password);
  await prisma.account.update({
    where: { id: accountId },
    data: { passwordHash },
  });
  return { ok: true as const };
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetTokenValue() {
  return randomBytes(32).toString("hex");
}
