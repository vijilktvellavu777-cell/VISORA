import { parseJson } from "@/lib/types";

export const PRESET_EXTENSION_ATTRIBUTES = [
  { value: "first_name", label: "First_name" },
  { value: "last_name", label: "Last_name" },
] as const;

export type ListExtensionEntryValues = {
  externalId: string | null;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  attributes: string;
};

export function parseExtensionAttributes(raw: string | null | undefined): string[] {
  const parsed = parseJson<unknown>(raw ?? "[]", []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export function extensionAttributeLabel(value: string): string {
  const preset = PRESET_EXTENSION_ATTRIBUTES.find((item) => item.value === value);
  if (preset) return preset.label;
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getEntryAttributeValue(entry: ListExtensionEntryValues, attribute: string): string | null {
  if (attribute === "first_name") return entry.firstName;
  if (attribute === "last_name") return entry.lastName;
  if (attribute === "email") return entry.email;
  if (attribute === "phone") return entry.phone;
  if (attribute === "external_id") return entry.externalId;

  const custom = parseJson<Record<string, unknown>>(entry.attributes, {});
  const value = custom[attribute];
  if (value == null || value === "") return null;
  return String(value);
}

export function defaultExtensionAttributes(type: string): string[] {
  if (type === "sms") return ["phone", "first_name", "last_name"];
  if (type === "email") return ["email", "first_name", "last_name"];
  return ["external_id", "first_name", "last_name"];
}

export function resolveExtensionAttributes(raw: string | null | undefined, type: string): string[] {
  const configured = parseExtensionAttributes(raw);
  return configured.length > 0 ? configured : defaultExtensionAttributes(type);
}
