export function normalizeLinkUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function validateLinkUrl(url: string): string | null {
  if (!url) return "Link URL is required.";
  try {
    new URL(url);
    return null;
  } catch {
    return "Enter a valid link URL.";
  }
}
