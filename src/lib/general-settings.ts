import type { Workspace } from "@prisma/client";

export type GeneralSettings = {
  organizationName: string;
  website: string;
  industry: string;
  country: string;
  organizationTimeZone: string;
  logoUrl: string;
  brandName: string;
  primaryColor: string;
  defaultSenderName: string;
  defaultLanguage: string;
  defaultTimeZone: string;
  dateFormat: string;
  paused: boolean;
};

export const INDUSTRY_OPTIONS = [
  "E-commerce",
  "Financial services",
  "Healthcare",
  "Media & entertainment",
  "SaaS / Technology",
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

export function workspaceToGeneralSettings(workspace: Workspace): GeneralSettings {
  return {
    organizationName: workspace.name,
    website: workspace.website ?? "",
    industry: workspace.industry ?? "",
    country: workspace.country ?? "",
    organizationTimeZone: workspace.organizationTimeZone ?? "America/New_York",
    logoUrl: workspace.logoUrl ?? "",
    brandName: workspace.brandName ?? workspace.name,
    primaryColor: workspace.primaryColor ?? "#6d5efc",
    defaultSenderName: workspace.defaultSenderName ?? workspace.name,
    defaultLanguage: workspace.defaultLanguage ?? "en",
    defaultTimeZone: workspace.defaultTimeZone ?? workspace.organizationTimeZone ?? "America/New_York",
    dateFormat: workspace.dateFormat ?? "MM/DD/YYYY",
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
    logoUrl: settings.logoUrl.trim() || null,
    brandName: settings.brandName.trim() || null,
    primaryColor: settings.primaryColor.trim() || null,
    defaultSenderName: settings.defaultSenderName.trim() || null,
    defaultLanguage: settings.defaultLanguage.trim() || null,
    defaultTimeZone: settings.defaultTimeZone.trim() || null,
    dateFormat: settings.dateFormat.trim() || null,
  };
}
