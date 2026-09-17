import type { Workspace } from "@prisma/client";

export type GeneralSettings = {
  organizationName: string;
  organizationId: string;
  website: string;
  industry: string;
  country: string;
  organizationTimeZone: string;
  defaultLanguage: string;
  logoUrl: string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  faviconUrl: string;
  defaultTimeZone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  paused: boolean;
};

export const INDUSTRY_OPTIONS = [
  "E-commerce",
  "Financial services",
  "Healthcare",
  "Media & entertainment",
  "SaaS / Technology",
  "Technology",
  "Travel & hospitality",
  "Other",
] as const;

export const COUNTRY_OPTIONS = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Germany",
  "France",
  "Singapore",
  "United Arab Emirates",
  "Other",
] as const;

export const TIME_ZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
] as const;

export const DATE_FORMAT_OPTIONS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] as const;
export const TIME_FORMAT_OPTIONS = ["12h", "24h"] as const;
export const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "INR", "AUD", "CAD"] as const;

export function formatOrganizationId(workspaceId: string) {
  const compact = workspaceId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 22).toUpperCase();
  return `org_${compact}`;
}

export function workspaceToGeneralSettings(workspace: Workspace): GeneralSettings {
  return {
    organizationName: workspace.name,
    organizationId: formatOrganizationId(workspace.id),
    website: workspace.website ?? "",
    industry: workspace.industry ?? "",
    country: workspace.country ?? "",
    organizationTimeZone: workspace.organizationTimeZone ?? "America/New_York",
    defaultLanguage: workspace.defaultLanguage ?? "en",
    logoUrl: workspace.logoUrl ?? "",
    brandName: workspace.brandName ?? workspace.name,
    primaryColor: workspace.primaryColor ?? "#6d5efc",
    secondaryColor: workspace.secondaryColor ?? "#6366f1",
    faviconUrl: workspace.faviconUrl ?? "",
    defaultTimeZone: workspace.defaultTimeZone ?? workspace.organizationTimeZone ?? "America/New_York",
    dateFormat: workspace.dateFormat ?? "MM/DD/YYYY",
    timeFormat: workspace.timeFormat ?? "12h",
    currency: workspace.currency ?? "USD",
    paused: workspace.pausedAt != null,
  };
}

export function generalSettingsToWorkspaceData(settings: GeneralSettings) {
  return {
    name: settings.organizationName.trim(),
    website: settings.website.trim() || null,
    industry: settings.industry.trim() || null,
    country: settings.country.trim() || null,
    organizationTimeZone: settings.organizationTimeZone.trim() || null,
    defaultLanguage: settings.defaultLanguage.trim() || null,
    logoUrl: settings.logoUrl.trim() || null,
    brandName: settings.brandName.trim() || null,
    primaryColor: settings.primaryColor.trim() || null,
    secondaryColor: settings.secondaryColor.trim() || null,
    faviconUrl: settings.faviconUrl.trim() || null,
    defaultTimeZone: settings.defaultTimeZone.trim() || null,
    dateFormat: settings.dateFormat.trim() || null,
    timeFormat: settings.timeFormat.trim() || null,
    currency: settings.currency.trim() || null,
  };
}
