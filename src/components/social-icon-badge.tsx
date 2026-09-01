import type { SocialIconCollection, SocialPlatform } from "@/lib/email-drag-drop-blocks";
import { SOCIAL_PLATFORM_META, socialIconSurfaceStyle } from "@/lib/social-block-icons";

type Props = {
  platform: SocialPlatform;
  collection: SocialIconCollection;
  size?: number;
  className?: string;
};

export function SocialIconBadge({ platform, collection, size = 32, className }: Props) {
  const meta = SOCIAL_PLATFORM_META[platform];
  const style = socialIconSurfaceStyle(collection, meta.color, size);

  return (
    <span className={className} style={style} aria-hidden="true">
      {meta.glyph}
    </span>
  );
}
