export type BlockType =
  | "title"
  | "paragraph"
  | "list"
  | "button"
  | "divider"
  | "spacer"
  | "image"
  | "video"
  | "social"
  | "icons"
  | "html"
  | "menu";

export type TextAlign = "left" | "center" | "right" | "justify";
export type TextDirection = "ltr" | "rtl";
export type FontWeight = "regular" | "bold" | "light";
export type LineHeightMode = "custom" | "auto";
export type TitleLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type ListType = "unordered" | "ordered";
export type ListStyleType = "default" | "disc" | "circle" | "square" | "decimal";
export type ButtonLinkType = "web_page" | "email" | "phone" | "file";
export type BorderStyle = "solid" | "dashed" | "dotted" | "none";

export type PaddingOptions = {
  paddingAll: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingMoreOptions: boolean;
};

export type BorderOptions = {
  style: BorderStyle;
  width: number;
  color: string;
  moreOptions: boolean;
};

export type BlockOptions = PaddingOptions & {
  hideOnDesktop: boolean;
  hideOnMobile: boolean;
};

export type ButtonBlockStyle = {
  linkType: ButtonLinkType;
  url: string;
  autoWidth: boolean;
  fontFamily: string;
  fontWeight: FontWeight;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  textDirection: TextDirection;
  borderRadius: number;
  contentPadding: PaddingOptions;
  border: BorderOptions;
  hoverEnabled: boolean;
  blockOptions: BlockOptions;
};

export type DividerBlockStyle = {
  transparent: boolean;
  lineStyle: BorderStyle;
  lineWidth: number;
  lineColor: string;
  width: number;
  textAlign: TextAlign;
  blockOptions: BlockOptions;
};

export type TextBlockStyle = {
  fontFamily: string;
  fontWeight: FontWeight;
  fontSize: number;
  textColor: string;
  linkColor: string;
  textAlign: TextAlign;
  lineHeight: number;
  lineHeightMode: LineHeightMode;
  letterSpacing: number;
  textDirection: TextDirection;
  blockOptions: BlockOptions;
  titleLevel?: TitleLevel;
  paragraphSpacing?: number;
  listType?: ListType;
  listStyleType?: ListStyleType;
  listItemsSpacing?: number;
  nestedItemsIndent?: number;
};

export type CanvasBlock = {
  id: string;
  type: BlockType;
  content: string;
  style?: TextBlockStyle;
  buttonStyle?: ButtonBlockStyle;
  dividerStyle?: DividerBlockStyle;
};

export const TEXT_BLOCK_TYPES: BlockType[] = ["title", "paragraph", "list"];

export function isTextBlock(type: BlockType) {
  return TEXT_BLOCK_TYPES.includes(type);
}

export function isPropertiesBlock(type: BlockType) {
  return isTextBlock(type) || type === "button" || type === "divider";
}

export function defaultPaddingOptions(all = 10): PaddingOptions {
  return {
    paddingAll: all,
    paddingTop: all,
    paddingRight: all,
    paddingBottom: all,
    paddingLeft: all,
    paddingMoreOptions: false,
  };
}

export function defaultBlockOptions(): BlockOptions {
  return {
    paddingAll: 10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingMoreOptions: false,
    hideOnDesktop: false,
    hideOnMobile: false,
  };
}

export function defaultTitleStyle(): TextBlockStyle {
  return {
    titleLevel: "h1",
    fontFamily: "Global font",
    fontWeight: "bold",
    fontSize: 34,
    textColor: "#2e3c47",
    linkColor: "#1871d8",
    textAlign: "center",
    lineHeight: 1.2,
    lineHeightMode: "custom",
    letterSpacing: 0,
    textDirection: "ltr",
    blockOptions: defaultBlockOptions(),
  };
}

export function defaultParagraphStyle(): TextBlockStyle {
  return {
    fontFamily: "Global font",
    fontWeight: "regular",
    fontSize: 14,
    textColor: "#101b24",
    linkColor: "#1871d8",
    textAlign: "left",
    paragraphSpacing: 0,
    lineHeight: 1.2,
    lineHeightMode: "custom",
    letterSpacing: 0,
    textDirection: "ltr",
    blockOptions: defaultBlockOptions(),
  };
}

export function defaultListStyle(): TextBlockStyle {
  return {
    fontFamily: "Global font",
    fontWeight: "regular",
    fontSize: 14,
    textColor: "#101b24",
    linkColor: "#1871d8",
    textAlign: "left",
    listType: "unordered",
    listStyleType: "default",
    listItemsSpacing: 0,
    nestedItemsIndent: 40,
    lineHeight: 1.2,
    lineHeightMode: "custom",
    letterSpacing: 0,
    textDirection: "ltr",
    blockOptions: defaultBlockOptions(),
  };
}

export function defaultButtonStyle(): ButtonBlockStyle {
  return {
    linkType: "web_page",
    url: "",
    autoWidth: true,
    fontFamily: "Global font",
    fontWeight: "regular",
    fontSize: 14,
    backgroundColor: "#1871d8",
    textColor: "#ffffff",
    textAlign: "center",
    lineHeight: 2,
    letterSpacing: 0,
    textDirection: "ltr",
    borderRadius: 2,
    contentPadding: {
      paddingAll: 10,
      paddingTop: 5,
      paddingRight: 10,
      paddingBottom: 5,
      paddingLeft: 10,
      paddingMoreOptions: true,
    },
    border: {
      style: "solid",
      width: 1,
      color: "#1871d8",
      moreOptions: false,
    },
    hoverEnabled: false,
    blockOptions: defaultBlockOptions(),
  };
}

export function defaultDividerStyle(): DividerBlockStyle {
  return {
    transparent: false,
    lineStyle: "solid",
    lineWidth: 1,
    lineColor: "#bbbbbb",
    width: 100,
    textAlign: "center",
    blockOptions: defaultBlockOptions(),
  };
}

export function defaultStyleForType(type: BlockType): TextBlockStyle | undefined {
  if (type === "title") return defaultTitleStyle();
  if (type === "paragraph") return defaultParagraphStyle();
  if (type === "list") return defaultListStyle();
  return undefined;
}

export function getBlockStyle(block: CanvasBlock): TextBlockStyle {
  if (block.style) return block.style;
  return defaultStyleForType(block.type) ?? defaultParagraphStyle();
}

export function getButtonStyle(block: CanvasBlock): ButtonBlockStyle {
  if (block.buttonStyle) return block.buttonStyle;
  return defaultButtonStyle();
}

export function getDividerStyle(block: CanvasBlock): DividerBlockStyle {
  if (block.dividerStyle) return block.dividerStyle;
  return defaultDividerStyle();
}

export function getBlockWrapperOptions(block: CanvasBlock): BlockOptions {
  if (block.type === "button") return getButtonStyle(block).blockOptions;
  if (block.type === "divider") return getDividerStyle(block).blockOptions;
  return getBlockStyle(block).blockOptions;
}

export function defaultContent(type: BlockType): string {
  switch (type) {
    case "title":
      return "Your headline here";
    case "paragraph":
      return "Write your message here. Add personalization with {{ first_name }}.";
    case "list":
      return "First item\nSecond item\nThird item";
    case "button":
      return "Call to action";
    case "html":
      return "<p>Custom HTML block</p>";
    case "menu":
      return "Home | Products | Contact";
    default:
      return "";
  }
}

function fontWeightValue(weight: FontWeight) {
  if (weight === "bold") return "700";
  if (weight === "light") return "300";
  return "400";
}

function fontFamilyValue(fontFamily: string) {
  if (fontFamily === "Global font") return "Segoe UI, Helvetica, Arial, sans-serif";
  return fontFamily;
}

function paddingOptionsCss(options: PaddingOptions) {
  if (options.paddingMoreOptions) {
    return `padding:${options.paddingTop}px ${options.paddingRight}px ${options.paddingBottom}px ${options.paddingLeft}px;`;
  }
  return `padding:${options.paddingAll}px;`;
}

function paddingCss(options: BlockOptions) {
  return paddingOptionsCss(options);
}

function typographyCss(style: TextBlockStyle) {
  return [
    `font-family:${fontFamilyValue(style.fontFamily)}`,
    `font-weight:${fontWeightValue(style.fontWeight)}`,
    `font-size:${style.fontSize}px`,
    `color:${style.textColor}`,
    `text-align:${style.textAlign}`,
    `line-height:${style.lineHeightMode === "auto" ? "normal" : style.lineHeight}`,
    `letter-spacing:${style.letterSpacing}px`,
    `direction:${style.textDirection}`,
  ].join(";");
}

function wrapperClass(block: CanvasBlock) {
  const options = getBlockWrapperOptions(block);
  const classes = ["visora-block"];
  if (options.hideOnDesktop) classes.push("hide-desktop");
  if (options.hideOnMobile) classes.push("hide-mobile");
  return classes.join(" ");
}

function buttonCss(style: ButtonBlockStyle) {
  const border =
    style.border.style === "none"
      ? "border:none;"
      : `border:${style.border.width}px ${style.border.style} ${style.border.color};`;
  const width = style.autoWidth ? "display:inline-block;" : "display:block;width:100%;";
  return [
    width,
    paddingOptionsCss(style.contentPadding),
    `background:${style.backgroundColor}`,
    `color:${style.textColor}`,
    `font-family:${fontFamilyValue(style.fontFamily)}`,
    `font-weight:${fontWeightValue(style.fontWeight)}`,
    `font-size:${style.fontSize}px`,
    `line-height:${style.lineHeight}`,
    `letter-spacing:${style.letterSpacing}px`,
    `direction:${style.textDirection}`,
    `border-radius:${style.borderRadius}px`,
    border,
    "text-decoration:none",
    "text-align:center",
    "box-sizing:border-box",
  ].join(";");
}

function dividerMargin(align: TextAlign) {
  if (align === "left") return "margin:0 auto 0 0;";
  if (align === "right") return "margin:0 0 0 auto;";
  return "margin:0 auto;";
}

function dividerLineCss(dividerStyle: DividerBlockStyle) {
  const color = dividerStyle.transparent ? "transparent" : dividerStyle.lineColor;
  return `border:none;border-top:${dividerStyle.lineWidth}px ${dividerStyle.lineStyle} ${color};width:${dividerStyle.width}%;${dividerMargin(dividerStyle.textAlign)}`;
}

export function blockToHtml(block: CanvasBlock): string {
  const style = getBlockStyle(block);
  const wrapperStyle = paddingCss(style.blockOptions);
  const className = wrapperClass(block);

  switch (block.type) {
    case "title": {
      const tag = style.titleLevel ?? "h1";
      return `<div class="${className}" style="${wrapperStyle}"><${tag} style="${typographyCss(style)};margin:0;">${block.content}</${tag}></div>`;
    }
    case "paragraph":
      return `<div class="${className}" style="${wrapperStyle}"><p style="${typographyCss(style)};margin:0 0 ${style.paragraphSpacing ?? 0}px;">${block.content.replace(/\n/g, "<br/>")}</p></div>`;
    case "list": {
      const items = block.content.split("\n").filter(Boolean);
      const tag = style.listType === "ordered" ? "ol" : "ul";
      const listStyle =
        style.listStyleType === "default"
          ? ""
          : `list-style-type:${style.listStyleType};`;
      return `<div class="${className}" style="${wrapperStyle}"><${tag} style="${typographyCss(style)};margin:0;padding-left:${style.nestedItemsIndent ?? 40}px;${listStyle}">${items
        .map(
          (item) =>
            `<li style="margin-bottom:${style.listItemsSpacing ?? 0}px;">${item}</li>`,
        )
        .join("")}</${tag}></div>`;
    }
    case "button": {
      const buttonStyle = getButtonStyle(block);
      const href = buttonStyle.url || "#";
      const align = buttonStyle.textAlign;
      return `<div class="${wrapperClass(block)}" style="${paddingCss(buttonStyle.blockOptions)};text-align:${align};"><a href="${href}" style="${buttonCss(buttonStyle)}">${block.content}</a></div>`;
    }
    case "divider": {
      const dividerStyle = getDividerStyle(block);
      return `<div class="${wrapperClass(block)}" style="${paddingCss(dividerStyle.blockOptions)};text-align:${dividerStyle.textAlign};"><hr style="${dividerLineCss(dividerStyle)}" /></div>`;
    }
    case "spacer":
      return `<div style="height:32px;"></div>`;
    case "image":
      return `<p style="margin:0 0 16px;text-align:center;"><img src="https://placehold.co/600x240/e2e8f0/64748b?text=Image" alt="Image" style="max-width:100%;border-radius:8px;" /></p>`;
    case "video":
      return `<p style="margin:0 0 16px;text-align:center;color:#64748b;">[ Video placeholder ]</p>`;
    case "social":
      return `<p style="margin:0 0 16px;text-align:center;color:#64748b;">[ Social links ]</p>`;
    case "icons":
      return `<p style="margin:0 0 16px;text-align:center;color:#64748b;">[ Icon row ]</p>`;
    case "html":
      return block.content;
    case "menu":
      return `<p style="margin:0 0 16px;text-align:center;font-size:14px;color:#64748b;">${block.content}</p>`;
    default:
      return "";
  }
}

export function blocksToHtml(blocks: CanvasBlock[]): string {
  const inner = blocks.map(blockToHtml).join("\n");
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      @media only screen and (max-width: 600px) {
        .hide-mobile { display: none !important; }
      }
      @media only screen and (min-width: 601px) {
        .hide-desktop { display: none !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Segoe UI,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;padding:32px;">
            <tr><td>${inner}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function blockPropertiesTitle(type: BlockType) {
  if (type === "title") return "TITLE PROPERTIES";
  if (type === "paragraph") return "PARAGRAPH PROPERTIES";
  if (type === "list") return "LIST PROPERTIES";
  if (type === "button") return "BUTTON PROPERTIES";
  if (type === "divider") return "DIVIDER PROPERTIES";
  return "BLOCK PROPERTIES";
}
