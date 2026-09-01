import type { SocialIconCollection, SocialPlatform } from "@/lib/email-drag-drop-blocks";

export type SocialPlatformMeta = {
  label: string;
  defaultUrl: string;
  color: string;
  glyph: string;
};

export const SOCIAL_PLATFORM_META: Record<SocialPlatform, SocialPlatformMeta> = {
  facebook: { label: "Facebook", defaultUrl: "https://www.facebook.com/", color: "#1877F2", glyph: "f" },
  x: { label: "X", defaultUrl: "https://x.com/", color: "#000000", glyph: "X" },
  instagram: { label: "Instagram", defaultUrl: "https://www.instagram.com/", color: "#E4405F", glyph: "◎" },
  linkedin: { label: "LinkedIn", defaultUrl: "https://www.linkedin.com/", color: "#0A66C2", glyph: "in" },
  youtube: { label: "YouTube", defaultUrl: "https://www.youtube.com/", color: "#FF0000", glyph: "▶" },
  pinterest: { label: "Pinterest", defaultUrl: "https://www.pinterest.com/", color: "#BD081C", glyph: "P" },
  tiktok: { label: "TikTok", defaultUrl: "https://www.tiktok.com/", color: "#000000", glyph: "♪" },
  snapchat: { label: "Snapchat", defaultUrl: "https://www.snapchat.com/", color: "#FFFC00", glyph: "👻" },
  whatsapp: { label: "WhatsApp", defaultUrl: "https://www.whatsapp.com/", color: "#25D366", glyph: "☎" },
  custom: { label: "Custom", defaultUrl: "https://", color: "#64748b", glyph: "+" },
};

export const SOCIAL_ICON_COLLECTIONS: { value: SocialIconCollection; label: string }[] = [
  { value: "colored_circle", label: "Colored circle" },
  { value: "colored_square", label: "Colored square" },
  { value: "black_circle", label: "Black circle" },
  { value: "black_square", label: "Black square" },
  { value: "white_circle", label: "White circle" },
  { value: "white_square", label: "White square" },
];

export const SOCIAL_ICON_SPACING_OPTIONS = [0, 2, 5, 8, 10, 12, 15, 20];

export function socialIconSurfaceStyle(collection: SocialIconCollection, color: string, size = 32) {
  const base = {
    width: size,
    height: size,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size <= 20 ? 10 : 12,
    fontWeight: 700,
    lineHeight: 1,
    textDecoration: "none",
    flexShrink: 0,
  } as const;

  switch (collection) {
    case "colored_square":
      return { ...base, backgroundColor: color, color: "#ffffff", borderRadius: 4 };
    case "black_circle":
      return { ...base, backgroundColor: "#000000", color: "#ffffff", borderRadius: "50%" };
    case "black_square":
      return { ...base, backgroundColor: "#000000", color: "#ffffff", borderRadius: 4 };
    case "white_circle":
      return {
        ...base,
        backgroundColor: "#ffffff",
        color,
        borderRadius: "50%",
        border: `1px solid ${color}`,
      };
    case "white_square":
      return {
        ...base,
        backgroundColor: "#ffffff",
        color,
        borderRadius: 4,
        border: `1px solid ${color}`,
      };
    case "colored_circle":
    default:
      return { ...base, backgroundColor: color, color: "#ffffff", borderRadius: "50%" };
  }
}

export function socialIconInlineStyle(collection: SocialIconCollection, color: string, size = 32): string {
  const style = socialIconSurfaceStyle(collection, color, size);
  return Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${value}`)
    .join(";");
}

export function previewPlatforms(): SocialPlatform[] {
  return ["facebook", "x", "instagram", "linkedin"];
}
