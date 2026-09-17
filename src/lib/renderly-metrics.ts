export type RenderlyCampaignMetrics = {
  previews: number;
  comments: number;
  brokenLinks: number;
  unsecureLinks: number;
  htmlSizeKb: number;
  loadTimeMs: number;
};

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededInt(seed: number, min: number, max: number): number {
  const span = max - min + 1;
  return min + (seed % span);
}

function seededFloat(seed: number, min: number, max: number, decimals: number): number {
  const value = min + ((seed % 10000) / 10000) * (max - min);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function analyzeEmailHtml(body: string): Pick<
  RenderlyCampaignMetrics,
  "brokenLinks" | "unsecureLinks" | "htmlSizeKb" | "loadTimeMs"
> {
  const html = body.trim();
  const bytes = new TextEncoder().encode(html).length;
  const htmlSizeKb = bytes === 0 ? 0 : Math.round((bytes / 1024) * 100) / 100;

  const hrefMatches = html.match(/href\s*=\s*["']([^"']+)["']/gi) ?? [];
  let brokenLinks = 0;
  let unsecureLinks = 0;

  for (const match of hrefMatches) {
    const urlMatch = match.match(/href\s*=\s*["']([^"']+)["']/i);
    const href = urlMatch?.[1]?.trim() ?? "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }
    if (/^https?:\/\//i.test(href) && /^http:\/\//i.test(href)) {
      unsecureLinks += 1;
    }
    if (/^(javascript:|data:)/i.test(href) || href === "#" || /\{\{/.test(href)) {
      brokenLinks += 1;
    }
  }

  const loadTimeMs =
    htmlSizeKb === 0
      ? 0
      : Math.round(80 + htmlSizeKb * 2.8 + hrefMatches.length * 4.2);

  return { brokenLinks, unsecureLinks, htmlSizeKb, loadTimeMs };
}

export function getRenderlyCampaignMetrics(campaignId: string, body: string): RenderlyCampaignMetrics {
  const analysis = analyzeEmailHtml(body);
  const seed = hashSeed(campaignId);

  return {
    ...analysis,
    previews: seededInt(seed, 3, 48),
    comments: seededInt(seed >> 3, 0, 12),
  };
}

export function renderlyProjectAddress(campaignId: string): string {
  const token = campaignId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "proof";
  return `p_${token}@rendering.inboxmonster.com`;
}

export function renderlyProofTitle(campaign: {
  name: string;
  subject: string | null;
  updatedAt: Date | string;
}): string {
  const updated =
    typeof campaign.updatedAt === "string" ? new Date(campaign.updatedAt) : campaign.updatedAt;
  const stamp = updated.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const subject = campaign.subject?.trim() || campaign.name;
  return `Proof Launch: (HTML-only) [${campaign.name} - ${stamp}] ${subject}`;
}
