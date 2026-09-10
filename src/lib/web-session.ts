const COOKIE_NAME = "visora_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  return process.env.SESSION_SECRET ?? "visora-local-dev-secret";
}

async function hmacSha256Hex(payload: string, secretKey: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function sessionCookieName() {
  return COOKIE_NAME;
}

export function sessionMaxAgeSeconds() {
  return MAX_AGE_SECONDS;
}

export async function createSessionToken(username: string) {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${username}:${exp}`;
  const signature = await hmacSha256Hex(payload, secret());
  return `${payload}:${signature}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [username, expRaw, signature] = parts;
  const exp = Number(expRaw);
  if (!username || !Number.isFinite(exp) || exp < Date.now()) return null;

  const payload = `${username}:${expRaw}`;
  const expected = await hmacSha256Hex(payload, secret());
  if (expected !== signature) return null;
  return username;
}

export function getLoginCredentials() {
  return {
    username: process.env.VISORA_LOGIN_USERNAME ?? "admin",
    password: process.env.VISORA_LOGIN_PASSWORD ?? "visora",
  };
}

export function credentialsMatch(username: string, password: string) {
  const expected = getLoginCredentials();
  return username === expected.username && password === expected.password;
}
