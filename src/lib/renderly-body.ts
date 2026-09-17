export function isEmailHtmlBody(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return false;
    } catch {
      /* not JSON — treat as content */
    }
  }

  return (
    /<!doctype/i.test(trimmed) ||
    /<html[\s>]/i.test(trimmed) ||
    /<table[\s>]/i.test(trimmed) ||
    /<div[\s>]/i.test(trimmed) ||
    /<p[\s>]/i.test(trimmed) ||
    /<img[\s>]/i.test(trimmed)
  );
}
