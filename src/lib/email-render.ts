export function prepareEmailHtmlForPreview(body: string) {
  const trimmed = body.trim();
  if (!trimmed) return "";

  if (/<html[\s>]/i.test(trimmed) || /<!doctype/i.test(trimmed)) {
    return trimmed;
  }

  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:24px;font-family:Segoe UI,sans-serif;">${trimmed}</body>
</html>`;
}
