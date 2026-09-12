export const LINK_TABLE_TYPES = [
  { value: "email", label: "Email" },
  { value: "universal", label: "Universal" },
  { value: "sms", label: "SMS" },
] as const;

export type LinkTableType = (typeof LINK_TABLE_TYPES)[number]["value"];

export function linkTableTypeLabel(type: string) {
  return LINK_TABLE_TYPES.find((item) => item.value === type)?.label ?? type;
}

export function isValidLinkTableType(type: string): type is LinkTableType {
  return LINK_TABLE_TYPES.some((item) => item.value === type);
}
