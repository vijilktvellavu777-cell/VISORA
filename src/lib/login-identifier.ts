export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,64}$/;

export function isValidLoginIdentifier(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.includes("@")) {
    return EMAIL_PATTERN.test(trimmed);
  }
  return USERNAME_PATTERN.test(trimmed);
}
